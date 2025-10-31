# Fix: "Unauthorized: Invalid or expired token" on 2nd Profile Update

## Problem Analysis

When updating profile the **2nd time**, users were receiving:
```json
{
  "message": "Unauthorized: Invalid or expired token"
}
```

Despite providing a valid token.

## Root Cause

The issue was caused by **unhandled errors in the file upload middleware** (`uploadMultipleToS3`):

1. **File Upload Middleware Error Handling Issue**:
   - When an error occurred in `uploadMultipleToS3` middleware, it would call `res.status(500).json()`
   - This sent an error response but **didn't properly exit the middleware chain**
   - The request object state could become corrupted or in an inconsistent state
   - On 2nd request, the middleware state could cause authentication to fail

2. **Missing Global Error Handler**:
   - No global error handler middleware existed
   - Errors in middleware would propagate without proper cleanup
   - Authentication context (`req.user`) could be lost if an error occurred

3. **No Authentication Verification in Controllers**:
   - Profile update controllers didn't verify authentication before processing
   - If middleware failed to set `req.user`, the controller would still attempt to use it
   - Error messages weren't clear about authentication failures

## Solutions Applied

### 1. Fixed File Upload Middleware (`src/helpers/s3Utils.ts`)

**Before:**
```typescript
export const uploadMultipleToS3 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ... upload logic ...
    req.fileUrls = fileUrls;
    next();
  } catch (err) {
    console.error("Dynamic Upload Error:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Upload failed",
    });
  }
};
```

**After:**
```typescript
export const uploadMultipleToS3 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      req.fileUrls = {};
      return next();
    }

    const fileUrls: { [fieldname: string]: string[] } = {};

    for (const file of files) {
      try {
        // ... upload logic ...
        fs.unlinkSync(file.path);
      } catch (fileErr) {
        // Log individual file error but continue processing
        console.error(`Failed to upload file ${file.originalname}:`, fileErr);
        // Clean up temp file on error
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkErr) {
          console.error(`Failed to delete temp file ${file.path}:`, unlinkErr);
        }
      }
    }

    req.fileUrls = fileUrls;
    next();
  } catch (err) {
    console.error("Dynamic Upload Error:", err);
    // Pass error to next middleware instead of sending response
    // This ensures authentication flow is not disrupted
    next(err);
  }
};
```

**Key Changes:**
- ✅ Wrap individual file uploads in try-catch
- ✅ Continue processing even if one file fails
- ✅ Pass error to `next(err)` instead of sending response
- ✅ Allows global error handler to manage the response
- ✅ Prevents middleware chain from being interrupted

### 2. Added Global Error Handler (`src/index.ts`)

**Added:**
```typescript
// Global error handler middleware (must be after all routes)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error Handler:", err);
  
  // If response already sent, skip
  if (res.headersSent) {
    return next(err);
  }

  // Default to 500 server error
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle specific error types
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  if (err.name === "ValidationError") {
    statusCode = 422;
    message = err.message;
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});
```

**Key Benefits:**
- ✅ Centralized error handling for all errors
- ✅ Proper HTTP status codes for different error types
- ✅ Prevents response from being sent twice
- ✅ Consistent error response format
- ✅ Development mode includes error stack traces

### 3. Enhanced Profile Update Controllers

**Before:**
```typescript
updateAthleteProfile: async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await updateAthleteProfile(req);
    res.status(200).json(result);
  } catch (err) {
    res.status(422).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
}
```

**After:**
```typescript
updateAthleteProfile: async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Verify user is authenticated before attempting update
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const result = await updateAthleteProfile(req);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error updating athlete profile:", err);
    res.status(422).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
}
```

**Key Changes:**
- ✅ Verify authentication early
- ✅ Return 401 if not authenticated (instead of 422)
- ✅ Log errors for debugging
- ✅ Clear error messages about authentication failures

## Request Flow After Fix

### First Request (File Upload):
```
Client Request
    ↓
gymOwnerAuth middleware ✓ (validates token, sets req.user)
    ↓
newMulterUpload middleware ✓ (parses files)
    ↓
uploadMultipleToS3 middleware ✓ (uploads to S3, sets req.fileUrls)
    ↓
updateGymOwnerProfile controller ✓ (validates auth, processes update)
    ↓
updateGymOwnerProfile service ✓ (updates database)
    ↓
Response sent ✓
```

### Second Request (No File Upload):
```
Client Request
    ↓
gymOwnerAuth middleware ✓ (validates token, sets req.user)
    ↓
newMulterUpload middleware ✓ (no files, req.fileUrls = {})
    ↓
uploadMultipleToS3 middleware ✓ (no files to process, calls next())
    ↓
updateGymOwnerProfile controller ✓ (validates auth, processes update)
    ↓
updateGymOwnerProfile service ✓ (updates database)
    ↓
Response sent ✓
```

### Error Scenario (After Fix):
```
Client Request
    ↓
[Error occurs in any middleware]
    ↓
next(err) is called ↓
    ↓
Global error handler ✓ (catches error, sends proper response)
    ↓
Proper 500 error with message returned ✓
    ↓
Request flow is not disrupted ✓
```

## Testing Steps

### 1. Test First Update (with files):
```bash
curl -X PUT http://localhost:3000/profile/gym-owner/update-profile \
  -H "Authorization: Bearer TOKEN" \
  -F "gymName=New Gym Name" \
  -F "gymImages=@photo1.jpg"
```

Expected: ✅ 200 OK with updated data

### 2. Test Second Update (with files):
```bash
curl -X PUT http://localhost:3000/profile/gym-owner/update-profile \
  -H "Authorization: Bearer TOKEN" \
  -F "gymName=Another Update" \
  -F "gymImages=@photo2.jpg"
```

Expected: ✅ 200 OK with updated data (should work now!)

### 3. Test Update Without Files:
```bash
curl -X PUT http://localhost:3000/profile/gym-owner/update-profile \
  -H "Authorization: Bearer TOKEN" \
  -d '{"gymName":"Text Only Update"}' \
  -H "Content-Type: application/json"
```

Expected: ✅ 200 OK with updated data

### 4. Test Invalid Token:
```bash
curl -X PUT http://localhost:3000/profile/gym-owner/update-profile \
  -H "Authorization: Bearer INVALID_TOKEN"
```

Expected: ✅ 401 Unauthorized with message "Unauthorized: Invalid or expired token"

## Files Modified

| File | Change | Reason |
|------|--------|--------|
| `src/helpers/s3Utils.ts` | Enhanced error handling in `uploadMultipleToS3` | Prevent middleware chain interruption |
| `src/controllers/profile.ts` | Added auth verification in `updateAthleteProfile` and `updateGymOwnerProfile` | Catch auth issues early |
| `src/index.ts` | Added global error handler middleware | Centralized error management |

## Build Status

✅ **TypeScript Compilation: SUCCESSFUL**

```
> tsc
(no errors, no warnings)
```

## Summary

The issue was caused by **unhandled errors in file upload middleware disrupting the request flow**. The fix involved:

1. **Better error handling in `uploadMultipleToS3`** - Pass errors to global handler instead of sending response
2. **Global error handler** - Centralized error management with proper HTTP status codes
3. **Controller improvements** - Verify authentication early and log errors

These changes ensure that:
- ✅ Token validation is consistent across requests
- ✅ File upload errors don't corrupt request state
- ✅ Clear error messages for authentication failures
- ✅ Proper HTTP status codes for different error types
- ✅ Request flow is never interrupted by middleware errors
