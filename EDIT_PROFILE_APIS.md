# Edit Profile APIs - Comprehensive Documentation

## Overview
Two comprehensive profile update endpoints for athlete and gym owner profiles, matching the signup API data structure.

---

## 1. Athlete Profile Update API (My Account Screen)

### Endpoint
```
PUT /profile/athlete/update-profile
```

### Authentication
- **Required**: Yes (Bearer Token - userAuth middleware)
- **Header**: `Authorization: Bearer YOUR_ATHLETE_TOKEN`

### Request Headers
```json
{
  "Authorization": "Bearer YOUR_ATHLETE_TOKEN",
  "Content-Type": "application/json"
}
```

### Request Body

```json
{
  "name": "Adam Scout",
  "email": "info@adamscout.com",
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
    },
    {
      "sport": "607f1f77bcf86cd799439012",
      "skillSetLevel": "607f1f77bcf86cd799439022"
    }
  ]
}
```

### Request Parameters

#### Personal Information (User Fields)
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `name` | string | No | Full name | "Adam Scout" |
| `email` | string | No | Email address (must be unique) | "info@adamscout.com" |
| `phoneNumber` | string | No | Phone number | "+1234567890" |
| `dob` | date (ISO string) | No | Date of birth | "1997-03-23" |
| `gender` | enum | No | Gender (male/female/other) | "male" |
| `nationality` | string | No | Nationality | "American" |

#### Athlete Details (Athlete_User Fields)
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `height` | number | No | Height in cm | 167 |
| `weight` | number | No | Weight in kg | 80 |
| `sportsAndSkillLevels` | array | No | Array of sports and skill levels | See example above |

### Response (200 OK)

```json
{
  "message": "Athlete profile updated successfully",
  "data": {
    "user": {
      "_id": "64ff8c0576e9700012345672",
      "name": "Adam Scout",
      "email": "info@adamscout.com",
      "phoneNumber": "+1234567890",
      "dob": "1997-03-23T00:00:00.000Z",
      "gender": "male",
      "nationality": "American",
      "role": "athlete",
      "profileImage": "https://s3.amazonaws.com/bucket/profile.jpg",
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
      ],
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-10-30T15:30:00.000Z"
    }
  }
}
```

### cURL Example

```bash
curl -X PUT "http://localhost:3000/profile/athlete/update-profile" \
  -H "Authorization: Bearer YOUR_ATHLETE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Adam Scout",
    "email": "info@adamscout.com",
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
  }'
```

### Error Responses

**400 - Email Already in Use**
```json
{
  "error": "Email already in use"
}
```

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

**422 - Validation Error**
```json
{
  "error": "Failed to update athlete details"
}
```

---

## 2. Gym Owner Profile Update API (Personal Information + Gym Information + Identity Verification)

### Endpoint
```
PUT /profile/gym-owner/update-profile
```

### Authentication
- **Required**: Yes (Bearer Token - gymOwnerAuth middleware)
- **Header**: `Authorization: Bearer YOUR_GYM_OWNER_TOKEN`

### Request Headers
```json
{
  "Authorization": "Bearer YOUR_GYM_OWNER_TOKEN",
  "Content-Type": "multipart/form-data"
}
```

### Request Body (Form Data + JSON)

#### Personal Information Section
```json
{
  "name": "John Fitness Owner",
  "email": "owner@gymname.com",
  "phoneNumber": "+1987654321",
  "dob": "1990-05-15",
  "gender": "male",
  "nationality": "British"
}
```

#### Gym Information Section
```json
{
  "gymName": "AVX Training Club",
  "address": "Street 8 Main carbe international",
  "registration": "ABX2568FX",
  "cnic": "82101-5591852222-1",
  "sport": [
    "607f1f77bcf86cd799439011",
    "607f1f77bcf86cd799439012"
  ]
}
```

#### Identity Verification Files
Files uploaded as multipart form data:
- `personalIdentification` (array of files) - Registration documents
- `proofOfBusiness` (array of files) - Business proof documents
- `gymImages` (array of files) - Gym photos

### Complete Form Data Example

```
POST /profile/gym-owner/update-profile

Headers:
  Authorization: Bearer YOUR_GYM_OWNER_TOKEN

Form Data:
  name: "John Fitness Owner"
  email: "owner@gymname.com"
  phoneNumber: "+1987654321"
  dob: "1990-05-15"
  gender: "male"
  nationality: "British"
  gymName: "AVX Training Club"
  address: "Street 8 Main carbe international"
  registration: "ABX2568FX"
  cnic: "82101-5591852222-1"
  sport: ["607f1f77bcf86cd799439011", "607f1f77bcf86cd799439012"]
  personalIdentification: [<file>, <file>]
  proofOfBusiness: [<file>]
  gymImages: [<file>, <file>, <file>]
```

### Request Parameters

#### Personal Information (User Fields)
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `name` | string | No | Full name | "John Fitness Owner" |
| `email` | string | No | Email address (must be unique) | "owner@gymname.com" |
| `phoneNumber` | string | No | Phone number | "+1987654321" |
| `dob` | date (ISO string) | No | Date of birth | "1990-05-15" |
| `gender` | enum | No | Gender (male/female/other) | "male" |
| `nationality` | string | No | Nationality | "British" |

#### Gym Information (Gym Fields)
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `gymName` | string | No | Gym name | "AVX Training Club" |
| `address` | string | No | Gym address | "Street 8 Main carbe international" |
| `registration` | string | No | Registration number | "ABX2568FX" |
| `cnic` | string | No | CNIC/ID number | "82101-5591852222-1" |
| `sport` | array | No | Array of sport IDs | ["607f1f77...", "607f1f77..."] |

#### Identity Verification (File Uploads)
| Field | Type | Description | Format |
|-------|------|-------------|--------|
| `personalIdentification` | file array | Registration documents (CNIC, Passport) | Image/PDF |
| `proofOfBusiness` | file array | Business proof (Business license, tax certificate) | Image/PDF |
| `gymImages` | file array | Gym photos and facilities | Image |

### Response (200 OK)

```json
{
  "message": "Gym owner profile updated successfully",
  "data": {
    "user": {
      "_id": "64ff8c0576e9700012345674",
      "name": "John Fitness Owner",
      "email": "owner@gymname.com",
      "phoneNumber": "+1987654321",
      "dob": "1990-05-15T00:00:00.000Z",
      "gender": "male",
      "nationality": "British",
      "role": "gymOwner",
      "profileImage": "https://s3.amazonaws.com/bucket/owner-profile.jpg",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-10-30T15:45:00.000Z"
    },
    "gymDetails": {
      "_id": "64ff8c0576e9700012345675",
      "owner": "64ff8c0576e9700012345674",
      "name": "AVX Training Club",
      "address": "Street 8 Main carbe international",
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
        "https://s3.amazonaws.com/bucket/cnic-front.jpg",
        "https://s3.amazonaws.com/bucket/cnic-back.jpg"
      ],
      "proofOfBusiness": [
        "https://s3.amazonaws.com/bucket/business-license.pdf"
      ],
      "gymImages": [
        "https://s3.amazonaws.com/bucket/gym-1.jpg",
        "https://s3.amazonaws.com/bucket/gym-2.jpg",
        "https://s3.amazonaws.com/bucket/gym-3.jpg"
      ],
      "adminStatus": "approved",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-10-30T15:45:00.000Z"
    }
  }
}
```

### cURL Example (Postman format)

```bash
curl -X PUT "http://localhost:3000/profile/gym-owner/update-profile" \
  -H "Authorization: Bearer YOUR_GYM_OWNER_TOKEN" \
  -F "name=John Fitness Owner" \
  -F "email=owner@gymname.com" \
  -F "phoneNumber=+1987654321" \
  -F "dob=1990-05-15" \
  -F "gender=male" \
  -F "nationality=British" \
  -F "gymName=AVX Training Club" \
  -F "address=Street 8 Main carbe international" \
  -F "registration=ABX2568FX" \
  -F "cnic=82101-5591852222-1" \
  -F "sport=607f1f77bcf86cd799439011" \
  -F "sport=607f1f77bcf86cd799439012" \
  -F "personalIdentification=@/path/to/cnic-front.jpg" \
  -F "personalIdentification=@/path/to/cnic-back.jpg" \
  -F "proofOfBusiness=@/path/to/business-license.pdf" \
  -F "gymImages=@/path/to/gym-1.jpg" \
  -F "gymImages=@/path/to/gym-2.jpg" \
  -F "gymImages=@/path/to/gym-3.jpg"
```

### Error Responses

**400 - Not a Gym Owner**
```json
{
  "error": "Only gym owners can update gym profile"
}
```

**400 - Email Already in Use**
```json
{
  "error": "Email already in use"
}
```

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

**422 - Validation Error**
```json
{
  "error": "Failed to update gym information"
}
```

---

## Complete Sample Requests

### Athlete Profile Update - Complete Example

**Request URL:**
```
http://localhost:3000/profile/athlete/update-profile
```

**Postman Body (JSON):**
```json
{
  "name": "Adam Scout",
  "email": "info@adamscout.com",
  "phoneNumber": "+1-555-0123",
  "dob": "1997-03-23",
  "gender": "male",
  "nationality": "American",
  "height": 167,
  "weight": 80,
  "sportsAndSkillLevels": [
    {
      "sport": "607f1f77bcf86cd799439011",
      "skillSetLevel": "607f1f77bcf86cd799439021"
    },
    {
      "sport": "607f1f77bcf86cd799439012",
      "skillSetLevel": "607f1f77bcf86cd799439022"
    }
  ]
}
```

### Gym Owner Profile Update - Complete Example

**Request URL:**
```
http://localhost:3000/profile/gym-owner/update-profile
```

**Postman Form Data:**
```
name: John Fitness Owner
email: owner@avxtrainingclub.com
phoneNumber: +1-555-9876
dob: 1990-05-15
gender: male
nationality: British
gymName: AVX Training Club
address: Street 8 Main carbe international, Karachi
registration: ABX2568FX
cnic: 82101-5591852222-1
sport[0]: 607f1f77bcf86cd799439011
sport[1]: 607f1f77bcf86cd799439012
personalIdentification: [CNIC front image file]
personalIdentification: [CNIC back image file]
proofOfBusiness: [Business license PDF file]
gymImages: [Gym photo 1]
gymImages: [Gym photo 2]
gymImages: [Gym photo 3]
```

---

## Field Mapping to Signup APIs

### Athlete Signup to Update Mapping

| Update API Field | Signup API Field | Data Type | Notes |
|------------------|-----------------|-----------|-------|
| `name` | `user.name` | string | Personal name |
| `email` | `user.email` | string | Unique email |
| `phoneNumber` | `user.phoneNumber` | string | Contact number |
| `dob` | `user.dob` | date | Date of birth |
| `gender` | `user.gender` | enum | male/female/other |
| `nationality` | `user.nationality` | string | Country |
| `height` | `athlete_details.height` | number | In cm |
| `weight` | `athlete_details.weight` | number | In kg |
| `sportsAndSkillLevels` | `athlete_details.sportsAndSkillLevels` | array | Sports + skill levels |

### Gym Owner Signup to Update Mapping

| Update API Field | Signup API Field | Data Type | Notes |
|------------------|-----------------|-----------|-------|
| `name` | `user.name` | string | Owner name |
| `email` | `user.email` | string | Unique email |
| `phoneNumber` | `user.phoneNumber` | string | Contact number |
| `dob` | `user.dob` | date | Date of birth |
| `gender` | `user.gender` | enum | male/female/other |
| `nationality` | `user.nationality` | string | Country |
| `gymName` | `gym_details.name` | string | Gym name |
| `address` | `gym_details.address` | string | Gym address |
| `registration` | `gym_details.registration` | string | Registration number |
| `cnic` | `gym_details.cnic` | string | CNIC/ID |
| `sport` | `gym_details.sport` | array | Sport IDs |
| `personalIdentification` | `gym_details.personalIdentification` | file array | ID documents |
| `proofOfBusiness` | `gym_details.proofOfBusiness` | file array | Business docs |
| `gymImages` | `gym_details.gymImages` | file array | Gym photos |

---

## Status Codes

| Code | Description |
|------|-------------|
| `200` | Profile updated successfully |
| `400` | Bad request / Validation error |
| `401` | Unauthorized / Missing token |
| `403` | Forbidden / Not allowed |
| `404` | User or Gym not found |
| `422` | Unprocessable entity / Update failed |
| `500` | Server error |

---

## Key Features

✅ **Athlete Profile Update**
- Update personal information (name, email, DOB, gender, nationality, phone)
- Update athlete details (height, weight, sports, skill levels)
- Automatic unit conversion (cm ↔ inches, kg ↔ lbs)
- Email uniqueness validation
- Sport and skill level associations

✅ **Gym Owner Profile Update**
- Update personal information (same as athlete)
- Update gym information (name, address, registration, CNIC)
- Update sports offered
- Upload identity verification documents (CNIC, registration)
- Upload business proof documents
- Upload gym facility images
- Multiple file support via S3

✅ **Data Validation**
- Email uniqueness check
- User existence verification
- Role-based access control
- File upload handling
- Automatic conversion calculations

✅ **File Upload Support**
- Personal identification documents
- Proof of business documents
- Gym facility photos
- S3 integration for storage
- Multiple files per category

---

## Notes

1. **Height/Weight Conversion**: Athlete profile automatically converts cm to inches and kg to lbs
2. **File Uploads**: Gym owner updates support multipart/form-data for document uploads
3. **Sport Updates**: Pass array of sport IDs for multi-sport gyms
4. **Email Validation**: System checks for existing emails before updating
5. **Partial Updates**: Send only the fields you want to update
6. **Authentication**: Each role uses their specific auth middleware (userAuth/gymOwnerAuth)
