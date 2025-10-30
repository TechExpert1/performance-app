# Edit Profile APIs - Quick Start Guide

## 🚀 Getting Started

Two profile update endpoints ready to use:

---

## ⚽ Athlete Profile Update

### URL
```
PUT http://localhost:3000/profile/athlete/update-profile
```

### Headers
```
Authorization: Bearer YOUR_ATHLETE_TOKEN
Content-Type: application/json
```

### Body (JSON)
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "dob": "1995-03-23",
  "gender": "male",
  "nationality": "American",
  "height": 180,
  "weight": 75,
  "sportsAndSkillLevels": [
    {
      "sport": "SPORT_ID_HERE",
      "skillSetLevel": "SKILL_LEVEL_ID_HERE"
    }
  ]
}
```

### Response
```json
{
  "message": "Athlete profile updated successfully",
  "data": {
    "user": { /* updated user */ },
    "athleteDetails": {
      "height": { "cm": 180, "inches": 70.87 },
      "weight": { "kg": 75, "lbs": 165.35 },
      "sportsAndSkillLevels": [...]
    }
  }
}
```

---

## 🏋️ Gym Owner Profile Update

### URL
```
PUT http://localhost:3000/profile/gym-owner/update-profile
```

### Headers
```
Authorization: Bearer YOUR_GYM_OWNER_TOKEN
Content-Type: multipart/form-data
```

### Form Data

**Personal Information:**
```
name: John Fitness Owner
email: owner@gym.com
phoneNumber: +1987654321
dob: 1990-05-15
gender: male
nationality: British
```

**Gym Information:**
```
gymName: AVX Training Club
address: Street 8 Main Carbe International
registration: ABX2568FX
cnic: 82101-5591852222-1
sport[0]: SPORT_ID_1
sport[1]: SPORT_ID_2
```

**Files (Optional):**
```
personalIdentification: [file1, file2]  (CNIC, Passport)
proofOfBusiness: [file]                 (Business License)
gymImages: [file1, file2, file3]        (Gym Photos)
```

### Response
```json
{
  "message": "Gym owner profile updated successfully",
  "data": {
    "user": { /* updated user */ },
    "gymDetails": {
      "name": "AVX Training Club",
      "address": "Street 8 Main Carbe International",
      "registration": "ABX2568FX",
      "cnic": "82101-5591852222-1",
      "sport": [
        { "_id": "...", "name": "Rugby" },
        { "_id": "...", "name": "Boxing" }
      ],
      "personalIdentification": [
        "https://s3.../cnic-front.jpg",
        "https://s3.../cnic-back.jpg"
      ],
      "proofOfBusiness": ["https://s3.../license.pdf"],
      "gymImages": ["https://s3.../gym-1.jpg", "..."]
    }
  }
}
```

---

## 📋 Field Reference

### Athlete Fields
| Field | Type | Optional? | Auto-Calculated |
|-------|------|-----------|-----------------|
| name | string | Yes | - |
| email | string | Yes | - |
| phoneNumber | string | Yes | - |
| dob | ISO date | Yes | - |
| gender | enum | Yes | - |
| nationality | string | Yes | - |
| height | number (cm) | Yes | inches ✓ |
| weight | number (kg) | Yes | lbs ✓ |
| sportsAndSkillLevels | array | Yes | - |

### Gym Owner Fields
| Field | Type | Optional? | Auto |
|-------|------|-----------|------|
| name | string | Yes | - |
| email | string | Yes | - |
| phoneNumber | string | Yes | - |
| dob | ISO date | Yes | - |
| gender | enum | Yes | - |
| nationality | string | Yes | - |
| gymName | string | Yes | - |
| address | string | Yes | - |
| registration | string | Yes | - |
| cnic | string | Yes | - |
| sport | array | Yes | - |
| personalIdentification | files | Yes | - |
| proofOfBusiness | files | Yes | - |
| gymImages | files | Yes | - |

---

## 🔑 Status Codes

```
200 ✅ Success
400 ⚠️  Bad request / Validation error
401 ⚠️  Unauthorized / Missing token
403 ⚠️  Forbidden / Wrong role
404 ⚠️  Not found
422 ⚠️  Update failed
500 ❌ Server error
```

---

## 💡 Common Scenarios

### Update Only Name & Email
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```
✓ All other fields preserved

### Update Sports
```json
{
  "sportsAndSkillLevels": [
    { "sport": "ID1", "skillSetLevel": "LEVEL1" },
    { "sport": "ID2", "skillSetLevel": "LEVEL2" }
  ]
}
```

### Add Gym Documents
```
Gym Owner Update:
personalIdentification: [cnic-front.jpg, cnic-back.jpg]
proofOfBusiness: [business-license.pdf]
gymImages: [gym-1.jpg, gym-2.jpg]
```

### Update Just Physical Stats
```json
{
  "height": 175,
  "weight": 80
}
```
✓ Auto-converts to inches/lbs

---

## 🔍 Example Postman Requests

### Athlete - Minimal Update
```
PUT /profile/athlete/update-profile

{
  "name": "Updated Name"
}
```

### Athlete - Full Update
```
PUT /profile/athlete/update-profile

{
  "name": "Adam Scout",
  "email": "adam@scout.com",
  "phoneNumber": "+1-555-1234",
  "dob": "1997-03-23",
  "gender": "male",
  "nationality": "American",
  "height": 170,
  "weight": 75,
  "sportsAndSkillLevels": [
    {
      "sport": "607f1f77bcf86cd799439011",
      "skillSetLevel": "607f1f77bcf86cd799439021"
    }
  ]
}
```

### Gym Owner - Personal + Gym
```
PUT /profile/gym-owner/update-profile

Form Data:
- name: John Owner
- email: john@gym.com
- phoneNumber: +1-555-9999
- gymName: Fitness Hub
- address: 123 Main Street
- registration: REG123456
- cnic: 12345-1234567-1
- sport[0]: 607f1f77bcf86cd799439011
- sport[1]: 607f1f77bcf86cd799439012
- personalIdentification: (file upload)
- proofOfBusiness: (file upload)
- gymImages: (file upload)
```

---

## ✅ Checklist Before First Use

- [ ] Have valid Bearer token
- [ ] Know user's current data (optional, for partial updates)
- [ ] For athlete: have sport/skill IDs
- [ ] For gym owner: have files ready if uploading documents
- [ ] Verify email is unique (if changing)
- [ ] Check role matches endpoint (athlete vs gym owner)

---

## 🛠️ Troubleshooting

### 401 Unauthorized
❌ Token is missing or invalid
✅ Add valid Bearer token in Authorization header

### 400 Bad Request
❌ Email already exists OR invalid data format
✅ Verify email is unique, use correct JSON format

### 404 Not Found
❌ User doesn't exist
✅ Verify correct token and user exists

### 422 Update Failed
❌ Database update failed
✅ Check data validity, try again

### 403 Forbidden
❌ Wrong endpoint for user role
✅ Athlete uses `/athlete/...`, Gym owner uses `/gym-owner/...`

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `EDIT_PROFILE_APIS.md` | Comprehensive docs with examples |
| `EDIT_PROFILE_APIS_QUICK_REF.md` | Quick reference |
| `IMPLEMENTATION_SUMMARY.md` | Technical details |
| `VISUAL_GUIDE.md` | Diagrams & architecture |
| `QUICK_START_GUIDE.md` | This file |

---

## 🎯 Next Steps

1. **Test Athlete Endpoint**
   ```bash
   curl -X PUT http://localhost:3000/profile/athlete/update-profile \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test"}'
   ```

2. **Test Gym Owner Endpoint**
   ```bash
   curl -X PUT http://localhost:3000/profile/gym-owner/update-profile \
     -H "Authorization: Bearer TOKEN" \
     -F "name=Test Owner"
   ```

3. **Integrate with Frontend**
   - Athlete: Connect to "My Account" screen
   - Gym Owner: Connect to profile update screens

4. **Monitor Logs**
   - Check for validation errors
   - Verify database updates
   - Confirm S3 uploads (gym owner)

---

## 📞 Support

For detailed information, refer to:
- `EDIT_PROFILE_APIS.md` - Full API documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation details
- `VISUAL_GUIDE.md` - Architecture diagrams
