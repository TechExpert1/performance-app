# Edit Profile APIs - Quick Reference

## Two APIs Created

### 1. Athlete Profile Update (My Account Screen)
```
PUT /profile/athlete/update-profile
Authorization: Bearer ATHLETE_TOKEN
Content-Type: application/json
```

**Updates:**
- Personal info: name, email, phone, DOB, gender, nationality
- Athlete details: height, weight, sports/skill levels
- Auto-converts: cm↔inches, kg↔lbs

**Sample Request:**
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
    }
  ]
}
```

---

### 2. Gym Owner Profile Update (Personal + Gym + Identity)
```
PUT /profile/gym-owner/update-profile
Authorization: Bearer GYM_OWNER_TOKEN
Content-Type: multipart/form-data
```

**Updates 3 Sections:**

#### Personal Information
- name, email, phone, DOB, gender, nationality

#### Gym Information
- gymName, address, registration, cnic, sport array

#### Identity Verification (Files)
- personalIdentification (CNIC, passport)
- proofOfBusiness (business license)
- gymImages (facility photos)

**Sample Form Data:**
```
name: John Fitness Owner
email: owner@gymname.com
phoneNumber: +1987654321
dob: 1990-05-15
gender: male
nationality: British
gymName: AVX Training Club
address: Street 8 Main carbe international
registration: ABX2568FX
cnic: 82101-5591852222-1
sport[0]: 607f1f77bcf86cd799439011
sport[1]: 607f1f77bcf86cd799439012
personalIdentification: [file1, file2]
proofOfBusiness: [file]
gymImages: [file1, file2, file3]
```

---

## Response Format

**Both APIs return:**
```json
{
  "message": "Profile updated successfully",
  "data": {
    "user": { /* updated user object */ },
    "athleteDetails": { /* for athlete */ },
    "gymDetails": { /* for gym owner */ }
  }
}
```

---

## Files Structure

### New Functions Added:
- `src/services/profile.ts`:
  - `updateAthleteProfile()` - Athlete profile logic
  - `updateGymOwnerProfile()` - Gym owner profile logic

### Controllers Updated:
- `src/controllers/profile.ts`:
  - `ProfileController.updateAthleteProfile()` 
  - `ProfileController.updateGymOwnerProfile()`

### Routes Added:
- `src/routes/profile.ts`:
  - `PUT /profile/athlete/update-profile`
  - `PUT /profile/gym-owner/update-profile`

---

## Data Mapping

### From Signup to Update API:
Exact same field structure as signup APIs:
- Athlete: `user` + `athlete_details`
- Gym Owner: `user` + `gym_details` (with files)

---

## Key Features

✅ Email uniqueness validation
✅ Role-based access control
✅ Auto unit conversion (athlete)
✅ File uploads to S3 (gym owner)
✅ Partial updates supported
✅ User existence check
✅ Comprehensive error handling

---

## Status Codes

- `200` - Success
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `422` - Update failed
- `500` - Server error

---

## Documentation

Full documentation with examples:
📄 `EDIT_PROFILE_APIS.md`

This file contains:
- Detailed endpoint documentation
- Complete request/response examples
- cURL and Postman examples
- Field mappings
- Error responses
- Key features
