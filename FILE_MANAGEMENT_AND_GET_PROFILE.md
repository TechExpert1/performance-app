# Profile APIs - File Management & Get Authenticated Profile

## Updates Summary

Three major enhancements to profile management:

1. **File Deletion Support** - Delete specific document URLs
2. **File Array Append** - Add new files instead of replacing
3. **Get Authenticated Profile** - Fetch current user's profile

---

## 1. File Deletion Support

### Overview
Delete specific files (CNIC, business proof, gym images) while editing gym owner profile.

### Features
- Delete individual file URLs from arrays
- Support multiple deletion keys
- Existing files preserved unless explicitly deleted
- Array-based deletion accepts single URL or array of URLs

### Implementation Details

**Delete Keys Available:**
```
deletePersonalIdentification  - Remove CNIC/ID documents
deleteProofOfBusiness         - Remove business proof files
deleteGymImages               - Remove gym facility photos
```

### Usage Examples

#### Delete Single File
```json
{
  "deleteGymImages": "https://s3.amazonaws.com/bucket/gym-old-1.jpg"
}
```

#### Delete Multiple Files
```json
{
  "deletePersonalIdentification": [
    "https://s3.amazonaws.com/bucket/cnic-old-1.jpg",
    "https://s3.amazonaws.com/bucket/cnic-old-2.jpg"
  ],
  "deleteProofOfBusiness": "https://s3.amazonaws.com/bucket/old-license.pdf"
}
```

#### Delete and Add New Files
```
Form Data:
- deleteGymImages: "https://s3.../old-gym-1.jpg"
- gymImages: [new-gym-1.jpg, new-gym-2.jpg]  (files)
```

**Result:** Old image removed, new images appended

---

## 2. File Array Append (Instead of Replace)

### Overview
New file uploads are appended to existing arrays instead of replacing them.

### Old Behavior (Replaced)
```
Before: [image1.jpg, image2.jpg]
Upload: image3.jpg
Result: [image3.jpg]  ❌ Images 1 & 2 lost
```

### New Behavior (Appended)
```
Before: [image1.jpg, image2.jpg]
Upload: image3.jpg
Result: [image1.jpg, image2.jpg, image3.jpg]  ✅ All preserved
```

### Example Request

**Request:**
```
PUT /profile/gym-owner/update-profile

Form Data:
- gymName: Updated Gym Name
- gymImages: [photo1.jpg, photo2.jpg]  (new files)
```

**Processing:**
1. Fetch existing gym
2. Get current gymImages: [existing1.jpg, existing2.jpg]
3. Append new files: [existing1.jpg, existing2.jpg, photo1.jpg, photo2.jpg]
4. Update and return

**Response:**
```json
{
  "gymDetails": {
    "gymImages": [
      "https://s3.../existing1.jpg",
      "https://s3.../existing2.jpg",
      "https://s3.../photo1.jpg",
      "https://s3.../photo2.jpg"
    ]
  }
}
```

---

## 3. Get Authenticated User Profile API

### Endpoint
```
GET /profile/me/profile
```

### Authentication
- **Required**: Yes (Bearer Token)
- **Middleware**: userAuth
- **Works For**: Athletes, Coaches, Gym Owners

### Request Headers
```json
{
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}
```

### Response (200 OK)

#### For Athlete
```json
{
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "_id": "64ff8c0576e9700012345672",
      "name": "Adam Scout",
      "email": "info@adamscout.com",
      "phoneNumber": "+1234567890",
      "gender": "male",
      "dob": "1997-03-23T00:00:00.000Z",
      "nationality": "American",
      "role": "athlete",
      "profileImage": "https://s3.../profile.jpg",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-10-30T15:30:00.000Z"
    },
    "athleteDetails": {
      "_id": "64ff8c0576e9700012345673",
      "userId": "64ff8c0576e9700012345672",
      "height": {
        "cm": 167,
        "inches": 65.75
      },
      "weight": {
        "kg": 80,
        "lbs": 176.37
      },
      "sportsAndSkillLevels": [
        {
          "_id": "607f1f77bcf86cd799439031",
          "sport": {
            "_id": "607f1f77bcf86cd799439011",
            "name": "Rugby"
          },
          "skillSetLevel": {
            "_id": "607f1f77bcf86cd799439021",
            "level": "Intermediate"
          }
        }
      ]
    }
  }
}
```

#### For Gym Owner
```json
{
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "_id": "64ff8c0576e9700012345674",
      "name": "John Fitness Owner",
      "email": "owner@gym.com",
      "phoneNumber": "+1987654321",
      "gender": "male",
      "dob": "1990-05-15T00:00:00.000Z",
      "nationality": "British",
      "role": "gymOwner",
      "profileImage": "https://s3.../owner-profile.jpg",
      "gym": "64ff8c0576e9700012345675",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-10-30T15:45:00.000Z"
    },
    "gymDetails": {
      "_id": "64ff8c0576e9700012345675",
      "owner": "64ff8c0576e9700012345674",
      "name": "AVX Training Club",
      "address": "Street 8 Main Carbe International",
      "registration": "ABX2568FX",
      "cnic": "82101-5591852222-1",
      "sport": [
        {
          "_id": "607f1f77bcf86cd799439011",
          "name": "Rugby"
        },
        {
          "_id": "607f1f77bcf86cd799439012",
          "name": "Boxing"
        }
      ],
      "personalIdentification": [
        "https://s3.../cnic-front.jpg",
        "https://s3.../cnic-back.jpg"
      ],
      "proofOfBusiness": [
        "https://s3.../business-license.pdf"
      ],
      "gymImages": [
        "https://s3.../gym-1.jpg",
        "https://s3.../gym-2.jpg",
        "https://s3.../gym-3.jpg"
      ],
      "adminStatus": "approved"
    }
  }
}
```

#### For Coach
```json
{
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "_id": "64ff8c0576e9700012345676",
      "name": "Michael Rodriguez",
      "email": "coach@gym.com",
      "phoneNumber": "+1-555-5555",
      "gender": "male",
      "role": "coach",
      "profileImage": "https://s3.../coach-profile.jpg",
      "gym": "64ff8c0576e9700012345675"
    },
    "gymDetails": {
      "_id": "64ff8c0576e9700012345675",
      "name": "AVX Training Club",
      "address": "Street 8 Main Carbe International",
      "sport": [...]
    }
  }
}
```

### cURL Example

**Get Athlete Profile:**
```bash
curl -X GET "http://localhost:3000/profile/me/profile" \
  -H "Authorization: Bearer YOUR_ATHLETE_TOKEN" \
  -H "Content-Type: application/json"
```

**Get Gym Owner Profile:**
```bash
curl -X GET "http://localhost:3000/profile/me/profile" \
  -H "Authorization: Bearer YOUR_GYM_OWNER_TOKEN" \
  -H "Content-Type: application/json"
```

### Error Responses

**401 - Unauthorized**
```json
{
  "error": "User not authenticated"
}
```

**404 - User Not Found**
```json
{
  "error": "User not found"
}
```

**422 - Server Error**
```json
{
  "error": "Error message"
}
```

---

## Complete File Management Example

### Scenario: Update Gym with File Management

**Update Request:**
```
PUT /profile/gym-owner/update-profile

Headers:
  Authorization: Bearer GYM_OWNER_TOKEN

Form Data:
  gymName: "Updated Fitness Hub"
  address: "New Address 123"
  
  deleteGymImages: [
    "https://s3.../old-gym-photo-1.jpg",
    "https://s3.../old-gym-photo-2.jpg"
  ]
  
  deletePersonalIdentification: "https://s3.../expired-cnic.jpg"
  
  personalIdentification: [new-cnic-front.jpg, new-cnic-back.jpg]
  
  gymImages: [new-gym-photo-1.jpg, new-gym-photo-2.jpg]
  
  proofOfBusiness: [new-business-license.pdf]
```

### Processing Flow:

**Step 1: Delete Specified Files**
```
Before gymImages: [img1.jpg, img2.jpg, img3.jpg]
Delete: [img1.jpg, img2.jpg]
After: [img3.jpg]
```

```
Before personalIdentification: [cnic-old.jpg, cnic-passport.jpg]
Delete: [cnic-old.jpg]
After: [cnic-passport.jpg]
```

**Step 2: Append New Files**
```
Current gymImages: [img3.jpg]
Add: [new-img1.jpg, new-img2.jpg]
Result: [img3.jpg, new-img1.jpg, new-img2.jpg]
```

```
Current personalIdentification: [cnic-passport.jpg]
Add: [new-cnic-front.jpg, new-cnic-back.jpg]
Result: [cnic-passport.jpg, new-cnic-front.jpg, new-cnic-back.jpg]
```

```
Current proofOfBusiness: []
Add: [new-license.pdf]
Result: [new-license.pdf]
```

### Response:
```json
{
  "message": "Gym owner profile updated successfully",
  "data": {
    "gymDetails": {
      "name": "Updated Fitness Hub",
      "address": "New Address 123",
      "personalIdentification": [
        "https://s3.../cnic-passport.jpg",
        "https://s3.../new-cnic-front.jpg",
        "https://s3.../new-cnic-back.jpg"
      ],
      "proofOfBusiness": [
        "https://s3.../new-business-license.pdf"
      ],
      "gymImages": [
        "https://s3.../img3.jpg",
        "https://s3.../new-gym-photo-1.jpg",
        "https://s3.../new-gym-photo-2.jpg"
      ]
    }
  }
}
```

---

## Route Summary

### New Routes Added

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/profile/me/profile` | userAuth | Get authenticated user's full profile |
| PUT | `/profile/athlete/update-profile` | userAuth | Update athlete profile |
| PUT | `/profile/gym-owner/update-profile` | gymOwnerAuth | Update gym owner profile with file management |

### Existing Routes (Unchanged)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/profile/:id` | Get any user's public profile |
| PATCH | `/profile/:id` | Update user profile (generic) |
| DELETE | `/profile/:id` | Delete user profile |
| PATCH | `/profile/:id/profile-image-update` | Update profile picture |

---

## Technical Implementation

### File Deletion Logic
```typescript
// For each file array (personalIdentification, proofOfBusiness, gymImages)
// 1. Get current array from database
// 2. Filter out URLs that match deletion keys
// 3. Store remaining URLs in update data

if (deletePersonalIdentification) {
  const urlsToDelete = Array.isArray(deletePersonalIdentification)
    ? deletePersonalIdentification
    : [deletePersonalIdentification];
  gymUpdateData.personalIdentification = (
    existingGym.personalIdentification || []
  ).filter((url) => !urlsToDelete.includes(url));
}
```

### File Append Logic
```typescript
// For each file array with new uploads
// 1. Get existing array from database
// 2. Get new files from req.fileUrls
// 3. Concatenate: [...existing, ...new]
// 4. Store combined array

if ((req as any).fileUrls.personalIdentification) {
  const existingIds = existingGym.personalIdentification || [];
  gymUpdateData.personalIdentification = [
    ...existingIds,
    ...(req as any).fileUrls.personalIdentification,
  ];
}
```

### Authenticated Profile Logic
```typescript
// 1. Get authenticated user from JWT
// 2. Fetch user document with relations
// 3. Check user role
// 4. Fetch appropriate linked profile:
//    - Athlete: Athlete_User document
//    - Gym Owner: Gym document
//    - Coach: Gym document (via gym reference)
// 5. Return combined response with user + linked profile
```

---

## Response Structure

### Get Authenticated Profile Response
```typescript
{
  message: string,  // Success message
  data: {
    user: {
      _id, name, email, phoneNumber,
      gender, dob, nationality, role,
      profileImage, gym, createdAt, updatedAt
    },
    athleteDetails?: {  // Only if athlete
      userId, height, weight, sportsAndSkillLevels
    },
    gymDetails?: {  // Only if gym owner/coach
      owner, name, address, registration, cnic,
      sport, personalIdentification, proofOfBusiness,
      gymImages, adminStatus
    }
  }
}
```

---

## File Management Best Practices

### When Deleting Files:
1. Pass exact URLs to delete
2. Check response to confirm deletion
3. Only delete URLs that exist in current array
4. Can combine delete + add in single request

### When Adding Files:
1. New files automatically append
2. No need to send existing URLs
3. Existing files always preserved
4. Maximum file size depends on S3 configuration

### Error Handling:
- Invalid URLs silently ignored (no harm)
- Deletion of non-existent URLs harmless
- Always verify array in response

---

## Status Codes

| Code | Scenario |
|------|----------|
| 200 | Success - Profile retrieved/updated |
| 400 | Validation error - Bad data |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Wrong role for endpoint |
| 404 | Not found - User or gym not found |
| 422 | Update failed - Database error |
| 500 | Server error |

---

## Summary

✅ **File Deletion** - Remove specific document URLs using delete keys
✅ **File Append** - New uploads add to existing arrays (no replacement)
✅ **Get Authenticated Profile** - Fetch current user's complete profile
✅ **Smart Population** - Automatically returns relevant linked profile
✅ **Role-Based** - Different response based on user role (athlete/coach/gym owner)
✅ **Backward Compatible** - All existing endpoints unchanged
