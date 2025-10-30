# Edit Profile APIs - Visual Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Edit Profile APIs                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ATHLETE PROFILE UPDATE              GYM OWNER PROFILE UPDATE    │
│  ════════════════════════            ════════════════════════    │
│                                                                   │
│  PUT /profile/athlete/...       PUT /profile/gym-owner/...     │
│  ├─ Authentication                ├─ Authentication             │
│  │  └─ userAuth (Bearer)          │  └─ gymOwnerAuth (Bearer)   │
│  │                                 │                             │
│  ├─ Request Format                ├─ Request Format             │
│  │  └─ application/json            │  └─ multipart/form-data    │
│  │                                 │                             │
│  ├─ Personal Info Update          ├─ Personal Info Update      │
│  │  ├─ name                        │  ├─ name                   │
│  │  ├─ email                       │  ├─ email                  │
│  │  ├─ phoneNumber                 │  ├─ phoneNumber            │
│  │  ├─ dob                         │  ├─ dob                    │
│  │  ├─ gender                      │  ├─ gender                 │
│  │  └─ nationality                 │  └─ nationality            │
│  │                                 │                             │
│  ├─ Athlete Details Update        ├─ Gym Details Update        │
│  │  ├─ height (cm)                 │  ├─ gymName                │
│  │  │  └─ auto↔inches              │  ├─ address                │
│  │  ├─ weight (kg)                 │  ├─ registration           │
│  │  │  └─ auto↔lbs                 │  ├─ cnic                   │
│  │  └─ sportsAndSkillLevels[]      │  └─ sport[] (ObjectIds)   │
│  │     ├─ sport: ObjectId          │                             │
│  │     └─ skillSetLevel: ObjectId  │  ├─ File Uploads           │
│  │                                 │  ├─ personalIdentification │
│  │                                 │  │  (CNIC, passport)       │
│  │                                 │  ├─ proofOfBusiness        │
│  │                                 │  │  (business license)      │
│  │                                 │  └─ gymImages              │
│  │                                 │     (facility photos)      │
│  │                                 │                             │
│  └─ Response                      └─ Response                  │
│     {                               {                           │
│       message: string,                message: string,          │
│       data: {                        data: {                    │
│         user: {...},                  user: {...},             │
│         athleteDetails: {...}         gymDetails: {...}        │
│       }                              }                          │
│     }                               }                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Athlete Profile Update Flow

```
┌──────────────────┐
│   Frontend       │
│  "My Account"    │
│    Screen        │
└────────┬─────────┘
         │
         │ PUT /profile/athlete/update-profile
         │ + Bearer Token + JSON
         ▼
┌──────────────────────────┐
│   AuthenticatedRequest   │
│    ✓ Extract JWT Token   │
│    ✓ Validate User       │
│    ✓ Set req.user        │
└────────┬─────────────────┘
         │
         ▼
┌───────────────────────────────────┐
│   updateAthleteProfile()          │
│   (Service Function)              │
│                                   │
│  1. Validate authentication       │
│  2. Check email uniqueness        │
│  3. Prepare user update data      │
│  4. Update User model             │
│  5. Prepare athlete update data   │
│  6. Update Athlete_User model     │
│  7. Populate references           │
│  8. Return updated data           │
└────────┬────────────────────────┘
         │
         ▼
    ┌─────────────────┐
    │   Database      │
    │                 │
    │  Users table    │
    │  Athlete_Users  │
    │  Sports         │
    │  SkillLevels    │
    └────────┬────────┘
             │
             ▼
    ┌──────────────────────────┐
    │   Response (200 OK)      │
    │                          │
    │  {                       │
    │    message: string,      │
    │    data: {               │
    │      user: {...},        │
    │      athleteDetails: {   │
    │        height: { cm, in },
    │        weight: { kg, lbs },
    │        sports: [...]     │
    │      }                   │
    │    }                     │
    │  }                       │
    └──────────────────────────┘
             │
             ▼
    ┌──────────────────┐
    │   Frontend       │
    │   Update View    │
    │ w/ New Data      │
    └──────────────────┘
```

---

### Gym Owner Profile Update Flow

```
┌─────────────────────────────┐
│   Frontend                  │
│  Profile Screens            │
│  ├─ Personal Info           │
│  ├─ Gym Information         │
│  └─ Identity Verification   │
│     (with file uploads)     │
└────────┬────────────────────┘
         │
         │ PUT /profile/gym-owner/update-profile
         │ + Bearer Token + multipart/form-data
         ▼
┌──────────────────────────────────┐
│   newMulterUpload Middleware     │
│    ✓ Parse form data             │
│    ✓ Extract files               │
│    ✓ Prepare for S3 upload       │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│   uploadMultipleToS3 Middleware  │
│    ✓ Upload to S3 bucket         │
│    ✓ Generate URLs               │
│    ✓ Attach to req.fileUrls      │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│   gymOwnerAuth           │
│    ✓ Extract JWT Token   │
│    ✓ Validate GymOwner   │
│    ✓ Set req.user        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│   updateGymOwnerProfile()        │
│   (Service Function)             │
│                                  │
│  1. Validate authentication      │
│  2. Check gym owner status       │
│  3. Check email uniqueness       │
│  4. Prepare user update data     │
│  5. Update User model            │
│  6. Prepare gym update data      │
│  7. Attach file URLs from S3     │
│  8. Update Gym model             │
│  9. Populate references          │
│  10. Return updated data         │
└────────┬──────────────────────────┘
         │
         ▼
    ┌─────────────────────┐
    │   AWS S3 Bucket     │
    │                     │
    │  /personalIdentID/  │
    │  /proofOfBusiness/  │
    │  /gymImages/        │
    └────────┬────────────┘
             │
             ▼
    ┌──────────────────────┐
    │   Database           │
    │                      │
    │  Users table         │
    │  Gyms table          │
    │  Sports              │
    └────────┬─────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │   Response (200 OK)            │
    │                                │
    │  {                             │
    │    message: string,            │
    │    data: {                     │
    │      user: {...},              │
    │      gymDetails: {             │
    │        name, address,          │
    │        registration, cnic,     │
    │        sport: [...],           │
    │        personalId: [urls...],  │
    │        proofOfBusiness: [urls],│
    │        gymImages: [urls...]    │
    │      }                         │
    │    }                           │
    │  }                             │
    └────────────────────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │   Frontend               │
    │   Update All 3 Screens   │
    │ w/ New Data & Docs       │
    └──────────────────────────┘
```

---

## Request/Response Lifecycle

### Athlete Endpoint - Sequence Diagram

```
Client                    API                    Database
  │                        │                        │
  ├─ PUT request ────────▶ │                        │
  │  (athlete data)        │                        │
  │                        │                        │
  │                        ├─ Validate JWT ────────▶│
  │                        │                        │
  │                        │◀─ User found ─────────┤
  │                        │                        │
  │                        ├─ Check email ────────▶│
  │                        │                        │
  │                        │◀─ Email unique ───────┤
  │                        │                        │
  │                        ├─ Update User ────────▶│
  │                        │                        │
  │                        │◀─ User updated ───────┤
  │                        │                        │
  │                        ├─ Update Athlete ─────▶│
  │                        │                        │
  │                        │◀─ Athlete updated ────┤
  │                        │                        │
  │                        ├─ Populate data ──────▶│
  │                        │  (sports, skills)     │
  │                        │◀─ References loaded ──┤
  │                        │                        │
  │◀─ 200 Response ────────┤                        │
  │  (user + athlete)      │                        │
  │                        │                        │
```

### Gym Owner Endpoint - Sequence Diagram

```
Client                    API                    Database         S3
  │                        │                        │               │
  ├─ PUT request ────────▶ │                        │               │
  │  (form data+files)     │                        │               │
  │                        │                        │               │
  │                        ├─ Parse form ─────────▶│               │
  │                        │  (Multer)              │               │
  │                        │                        │               │
  │                        ├─ Upload files ─────────────────────▶ │
  │                        │                                       │
  │                        │◀─ S3 URLs returned ────────────────┤
  │                        │                        │               │
  │                        ├─ Validate JWT ────────▶│               │
  │                        │                        │               │
  │                        │◀─ Gym owner found ────┤               │
  │                        │                        │               │
  │                        ├─ Check email ────────▶│               │
  │                        │                        │               │
  │                        │◀─ Email unique ───────┤               │
  │                        │                        │               │
  │                        ├─ Update User ────────▶│               │
  │                        │                        │               │
  │                        │◀─ User updated ───────┤               │
  │                        │                        │               │
  │                        ├─ Update Gym ─────────▶│               │
  │                        │  (with S3 URLs)       │               │
  │                        │◀─ Gym updated ────────┤               │
  │                        │                        │               │
  │                        ├─ Populate data ──────▶│               │
  │                        │  (sports)             │               │
  │                        │◀─ References loaded ──┤               │
  │                        │                        │               │
  │◀─ 200 Response ────────┤                        │               │
  │  (user + gym)          │                        │               │
  │  with file URLs        │                        │               │
  │                        │                        │               │
```

---

## Status Code Decision Tree

```
                    Request Received
                           │
                           ▼
                  ┌──────────────────┐
                  │ Valid JWT Token? │
                  └────┬─────────┬───┘
                   No  │         │ Yes
                       ▼         ▼
                    401 ◀──┐   Check Role
                            │         │
                            │     ┌───┴──┬────┐
                            │     │ Role │    │
                            │     │ OK?  │    │
                            │    No│     │Yes▼
                            │     ▼     ├─ 403
                            │    401    │
                            │          ▼
                            │      Parse Body
                            │          │
                            │      ┌───┴───────┐
                            │      │ Valid     │
                            │      │ JSON?     │
                            │   No │           │
                            │      ▼           │ Yes
                            │     400          ▼
                            │                 Check Email
                            │                   │
                            │             ┌─────┴────┬───────┐
                            │             │   Email  │       │
                            │             │ Exists?  │       │
                            │        Yes  │ No       │       │
                            │             ▼  │       │       │
                            │            400 │       ▼       │
                            │                │     Find User │
                            │                │       │       │
                            │                │   ┌───┴─────┬─┘
                            │                │   │  User   │
                            │                │   │ Exists? │
                            │                │   │         │
                            │                │   │     No  │
                            │                │   ▼         ▼
                            │                │  404    Proceed
                            │                │         │
                            │                └────┬────┘
                            │                     │
                            │                     ▼
                            │                Update DB
                            │                     │
                            │              ┌──────┴──────┐
                            │              │   Success?  │
                            │           No │             │ Yes
                            │              ▼             ▼
                            │             422           200
                            │
                            ▼
                        Response
```

---

## Database Model Relationships

### Athlete Profile Update

```
┌─────────────────────┐
│   User              │
├─────────────────────┤
│ _id                 │
│ name         ◀──────┼──────────────┐
│ email               │              │
│ phoneNumber         │              │
│ dob                 │              │
│ gender              │              │
│ nationality         │              │
│ role: "athlete"     │              │
│ profileImage        │              │
│ ...                 │              │
└─────────────────────┘              │
                                     │
                                     │ References
                                     │
                            ┌────────┴──────────┐
                            │                   │
                            ▼                   ▼
                ┌──────────────────────┐  ┌──────────────┐
                │   Athlete_User       │  │    Sport     │
                ├──────────────────────┤  ├──────────────┤
                │ userId (FK User)  ◀─┴──│ _id          │
                │ height                 │ name         │
                │   cm                   │ ...          │
                │   inches (auto)        └──────────────┘
                │ weight                      ▲
                │   kg                        │
                │   lbs (auto)                │
                │ sportsAndSkillLevels[]      │
                │   sport (FK) ──────────────┘
                │   skillSetLevel (FK)
                │     ↓
                │ ┌──────────────────────┐
                │ │  Skill_Set_Level     │
                │ ├──────────────────────┤
                │ │ _id                  │
                │ │ level                │
                │ │ ...                  │
                │ └──────────────────────┘
                └──────────────────────┘
```

### Gym Owner Profile Update

```
┌─────────────────────┐
│   User              │
├─────────────────────┤
│ _id                 │
│ name         ◀──────┼──────────────────┐
│ email               │                  │
│ phoneNumber         │                  │
│ dob                 │                  │
│ gender              │                  │
│ nationality         │                  │
│ role: "gymOwner"    │                  │
│ profileImage        │                  │
│ ...                 │                  │
└─────────────────────┘                  │
                                         │
                                         │ References
                                         │
                            ┌────────────┴──────────┐
                            │                       │
                            ▼                       ▼
                ┌──────────────────────────────┐
                │        Gym                   │
                ├──────────────────────────────┤
                │ owner (FK User) ◀────────────┤
                │ name (gymName)               │
                │ address                      │
                │ registration                 │
                │ cnic                         │
                │ sport[] (FK) ──────────┐    │
                │ personalIdentification[]     │
                │   (S3 URLs)                  │
                │ proofOfBusiness[]            │
                │   (S3 URLs)                  │
                │ gymImages[]                  │
                │   (S3 URLs)                  │
                └──────────────────────────────┘
                            │
                            │
                            ▼
                ┌──────────────────────┐
                │     Sport            │
                ├──────────────────────┤
                │ _id                  │
                │ name                 │
                │ ...                  │
                └──────────────────────┘
```

---

## File Upload Process (Gym Owner)

```
User selects files
        │
        ▼
Form submitted with files
        │
        ▼
┌───────────────────────────────┐
│  newMulterUpload Middleware   │
│  ✓ Parse multipart/form-data  │
│  ✓ Extract files to temp dir  │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ uploadMultipleToS3 Middleware │
│ ✓ Read files from temp        │
│ ✓ Upload to AWS S3 bucket     │
│ ✓ Generate public URLs        │
│ ✓ Attach to req.fileUrls      │
└───────────┬───────────────────┘
            │
            ▼
      req.fileUrls = {
        personalIdentification: [
          "https://s3.../id-1.jpg",
          "https://s3.../id-2.jpg"
        ],
        proofOfBusiness: [
          "https://s3.../license.pdf"
        ],
        gymImages: [
          "https://s3.../gym-1.jpg",
          "https://s3.../gym-2.jpg"
        ]
      }
            │
            ▼
     Service receives URLs
            │
            ▼
    Store URLs in Gym model
            │
            ▼
    Return response with URLs
            │
            ▼
    Frontend displays documents
```

---

## Summary Checklist

```
✅ Athlete Profile Update API
   ├─ Endpoint: PUT /profile/athlete/update-profile
   ├─ Authentication: userAuth
   ├─ Updates: Personal + Athlete Details
   ├─ Auto-converts: height, weight
   ├─ Validates: Email uniqueness
   └─ Response: User + AthleteDetails

✅ Gym Owner Profile Update API
   ├─ Endpoint: PUT /profile/gym-owner/update-profile
   ├─ Authentication: gymOwnerAuth
   ├─ Request Format: multipart/form-data
   ├─ Updates: Personal + Gym + Identity
   ├─ File Uploads: S3 integration
   ├─ Validates: Email, Gym owner status
   └─ Response: User + GymDetails

✅ Database Models
   ├─ User table updated
   ├─ Athlete_User updated
   ├─ Gym updated
   └─ References populated

✅ Error Handling
   ├─ Auth errors (401)
   ├─ Validation errors (400)
   ├─ Not found errors (404)
   ├─ Update failed (422)
   └─ Server errors (500)

✅ Documentation
   ├─ EDIT_PROFILE_APIS.md (comprehensive)
   ├─ EDIT_PROFILE_APIS_QUICK_REF.md (quick)
   ├─ IMPLEMENTATION_SUMMARY.md (detailed)
   └─ Visual guides (this file)

✅ Build Status
   └─ TypeScript: ✅ Successful
```
