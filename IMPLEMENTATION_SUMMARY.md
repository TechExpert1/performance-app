# Edit Profile APIs - Implementation Summary

## ✅ Implementation Complete

Two comprehensive profile update endpoints have been successfully created and tested. Both follow the same data structure as their respective signup APIs.

---

## APIs Created

### 1. **Athlete Profile Update API**
**Endpoint:** `PUT /profile/athlete/update-profile`

**Purpose:** Update athlete's "My Account" screen data
- Personal Information (name, email, phone, DOB, gender, nationality)
- Athlete Details (height, weight, sports/skill levels)

**Authentication:** userAuth middleware (Bearer Token)

**Key Features:**
- ✅ Updates user profile information
- ✅ Updates athlete-specific details
- ✅ Auto-converts measurements (cm↔inches, kg↔lbs)
- ✅ Validates email uniqueness
- ✅ Populates sport and skill level references
- ✅ Partial updates supported

---

### 2. **Gym Owner Profile Update API**
**Endpoint:** `PUT /profile/gym-owner/update-profile`

**Purpose:** Update gym owner's profile across three screens:
1. **Personal Information** - name, email, phone, DOB, gender, nationality
2. **Gym Information** - gym name, address, registration, CNIC, sports
3. **Identity Verification** - document uploads (CNIC, business proof, gym photos)

**Authentication:** gymOwnerAuth middleware (Bearer Token)

**Key Features:**
- ✅ Updates user personal information
- ✅ Updates gym details (name, address, registration, CNIC)
- ✅ Handles multiple sport associations
- ✅ File upload support to S3 (multipart/form-data)
- ✅ Identity document upload (CNIC, passport, business license)
- ✅ Gym facility image uploads
- ✅ Validates gym ownership
- ✅ Partial updates supported

---

## Files Modified

### New Service Functions
**File:** `src/services/profile.ts`
- Added import for unit conversion utilities
- `updateAthleteProfile()` - Handles athlete profile updates
- `updateGymOwnerProfile()` - Handles gym owner profile updates

### New Controller Methods
**File:** `src/controllers/profile.ts`
- Added imports for new service functions
- `ProfileController.updateAthleteProfile()` - Athlete endpoint handler
- `ProfileController.updateGymOwnerProfile()` - Gym owner endpoint handler

### New Routes
**File:** `src/routes/profile.ts`
- `PUT /profile/athlete/update-profile` (with userAuth)
- `PUT /profile/gym-owner/update-profile` (with gymOwnerAuth, file upload middleware)

---

## Data Structure Mapping

### Athlete Profile Update Fields

**From User Model:**
```typescript
name: string
email: string
phoneNumber: string
dob: Date
gender: "male" | "female" | "other"
nationality: string
```

**From Athlete_User Model:**
```typescript
height: {
  cm: number,
  inches: number (auto-calculated)
}
weight: {
  kg: number,
  lbs: number (auto-calculated)
}
sportsAndSkillLevels: [{
  sport: ObjectId,
  skillSetLevel: ObjectId
}]
```

### Gym Owner Profile Update Fields

**From User Model:**
```typescript
name: string
email: string
phoneNumber: string
dob: Date
gender: "male" | "female" | "other"
nationality: string
```

**From Gym Model:**
```typescript
name: string (gym name)
address: string
registration: string
cnic: string
sport: [ObjectId] (array of sport IDs)
personalIdentification: [string] (S3 URLs)
proofOfBusiness: [string] (S3 URLs)
gymImages: [string] (S3 URLs)
```

---

## Request/Response Examples

### Athlete Update - Request
```json
{
  "name": "Adam Scout",
  "email": "adam@example.com",
  "phoneNumber": "+1234567890",
  "dob": "1997-03-23",
  "gender": "male",
  "nationality": "American",
  "height": 167,
  "weight": 80,
  "sportsAndSkillLevels": [
    {
      "sport": "607f1f77bcf86cd799439011",
      "skillSetLevel": "607f1f77bcf86cd799439021"
    }
  ]
}
```

### Athlete Update - Response
```json
{
  "message": "Athlete profile updated successfully",
  "data": {
    "user": {
      "_id": "64ff8c0576e9700012345672",
      "name": "Adam Scout",
      "email": "adam@example.com",
      "gender": "male",
      "role": "athlete"
    },
    "athleteDetails": {
      "userId": "64ff8c0576e9700012345672",
      "height": { "cm": 167, "inches": 65.75 },
      "weight": { "kg": 80, "lbs": 176.37 },
      "sportsAndSkillLevels": [...]
    }
  }
}
```

### Gym Owner Update - Form Data
```
name: John Fitness Owner
email: owner@gym.com
phoneNumber: +1987654321
dob: 1990-05-15
gender: male
nationality: British
gymName: AVX Training Club
address: Street 8 Main Carbe International
registration: ABX2568FX
cnic: 82101-5591852222-1
sport[0]: 607f1f77bcf86cd799439011
sport[1]: 607f1f77bcf86cd799439012
personalIdentification: [file1, file2]
proofOfBusiness: [file]
gymImages: [file1, file2, file3]
```

### Gym Owner Update - Response
```json
{
  "message": "Gym owner profile updated successfully",
  "data": {
    "user": {
      "_id": "64ff8c0576e9700012345674",
      "name": "John Fitness Owner",
      "email": "owner@gym.com",
      "role": "gymOwner"
    },
    "gymDetails": {
      "_id": "64ff8c0576e9700012345675",
      "name": "AVX Training Club",
      "address": "Street 8 Main Carbe International",
      "registration": "ABX2568FX",
      "cnic": "82101-5591852222-1",
      "sport": [
        { "_id": "607f1f77...", "name": "Rugby" },
        { "_id": "607f1f77...", "name": "Boxing" }
      ],
      "personalIdentification": ["https://s3.../cnic-front.jpg", "https://s3.../cnic-back.jpg"],
      "proofOfBusiness": ["https://s3.../license.pdf"],
      "gymImages": ["https://s3.../gym1.jpg", "https://s3.../gym2.jpg"]
    }
  }
}
```

---

## Validation & Error Handling

### Email Validation
- Checks for duplicate emails across system
- Returns `400 - Email already in use` if exists
- Email update only if unique

### User Validation
- Verifies user exists before update
- Returns `404 - User not found` if not exists
- Confirms user role matches endpoint

### Role Validation
- Athlete endpoint: requires athlete role
- Gym owner endpoint: requires gymOwner role
- Returns `401 - Unauthorized` if wrong role

### File Upload Validation
- Gym owner endpoint supports multipart/form-data
- Multiple files per document type
- Auto-uploads to S3
- Stores URLs in database

### Partial Updates
- All fields optional - send only what needs updating
- Existing data preserved if field not provided
- Flexible update strategy

---

## Error Responses

| Status | Scenario | Message |
|--------|----------|---------|
| 200 | Success | "Profile updated successfully" |
| 400 | Email duplicate | "Email already in use" |
| 400 | Wrong role | "Only gym owners can update gym profile" |
| 401 | No token | "User not authenticated" |
| 404 | User not found | "User not found" |
| 422 | Update failed | "Failed to update [athlete/gym] details" |
| 500 | Server error | Internal error message |

---

## Usage Flow

### Athlete Using "My Account" Screen
1. Fetch current profile via `GET /profile/:id`
2. User edits personal/athlete details
3. Submit `PUT /profile/athlete/update-profile`
4. System validates and updates both User and Athlete_User
5. Returns updated data with calculated conversions

### Gym Owner Using Profile Screens
1. Fetch current profile via `GET /profile/:id`
2. User edits personal information (Step 1)
3. User edits gym information (Step 2)
4. User uploads identity documents (Step 3)
5. Submit `PUT /profile/gym-owner/update-profile` with form data
6. System validates, uploads files to S3, updates User and Gym
7. Returns updated data with S3 document URLs

---

## Technical Details

### Imports Added
```typescript
import { kgToLb, cmToInches } from "../utils/functions.js";
```

### Key Functions Used
- `kgToLb()` - Converts kilograms to pounds
- `cmToInches()` - Converts centimeters to inches
- `bcrypt.hash()` - Password hashing (if password update added)
- S3 upload middleware - For file uploads

### Middleware Used
- `userAuth` - Athlete endpoint authentication
- `gymOwnerAuth` - Gym owner endpoint authentication
- `newMulterUpload` - File upload handling
- `uploadMultipleToS3` - S3 file storage

### Models Referenced
- `User` - Personal information
- `Athlete_User` - Athlete details
- `Gym` - Gym information

---

## Build Status

✅ **TypeScript Build:** Successful
- No compilation errors
- All types properly validated
- All imports resolved

---

## Testing Endpoints

### Athlete Endpoint
```
PUT http://localhost:3000/profile/athlete/update-profile
Authorization: Bearer ATHLETE_TOKEN
Content-Type: application/json
```

### Gym Owner Endpoint
```
PUT http://localhost:3000/profile/gym-owner/update-profile
Authorization: Bearer GYM_OWNER_TOKEN
Content-Type: multipart/form-data
```

---

## Documentation Files

1. **EDIT_PROFILE_APIS.md**
   - Comprehensive documentation
   - Complete request/response examples
   - cURL and Postman examples
   - Field mappings from signup APIs
   - Error responses
   - All query parameters explained

2. **EDIT_PROFILE_APIS_QUICK_REF.md**
   - Quick reference guide
   - At-a-glance endpoint info
   - Sample requests
   - File structure overview
   - Key features summary

---

## Alignment with Signup APIs

### Athlete Flow
**Signup:** `POST /auth/signup?role=athlete`
- Input: `{ user: {...}, athlete_details: {...} }`

**Update:** `PUT /profile/athlete/update-profile`
- Input: Same structure as signup
- Output: Updated user + athlete details

### Gym Owner Flow
**Signup:** `POST /auth/signup?role=gymOwner`
- Input: `{ user: {...}, gym_details: {...} }` + files

**Update:** `PUT /profile/gym-owner/update-profile`
- Input: Same structure as signup + files
- Output: Updated user + gym details

---

## Summary

✅ Two complete profile update APIs created
✅ Full alignment with signup data structures
✅ Comprehensive error handling
✅ File upload support for gym owners
✅ Unit conversion for athlete measurements
✅ Email uniqueness validation
✅ Role-based access control
✅ Partial updates supported
✅ TypeScript build successful
✅ Complete documentation provided

Ready for integration with frontend "My Account" screens!
