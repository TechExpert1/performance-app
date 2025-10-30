# File Management & Get Profile - Quick Reference

## 🆕 Three New Features

### 1️⃣ Get Authenticated Profile
```
GET /profile/me/profile
Authorization: Bearer TOKEN
```
Returns current user's full profile + linked data

### 2️⃣ Delete Files
```
PUT /profile/gym-owner/update-profile

{
  "deleteGymImages": "https://s3.../old.jpg",
  "deletePersonalIdentification": ["url1", "url2"],
  "deleteProofOfBusiness": "https://s3.../old.pdf"
}
```
Remove specific files from arrays

### 3️⃣ Append Files (Auto)
```
PUT /profile/gym-owner/update-profile
Form Data:
  gymImages: [new-file.jpg]
```
New files added to existing, not replacing

---

## Get Authenticated Profile

### Request
```bash
curl -X GET http://localhost:3000/profile/me/profile \
  -H "Authorization: Bearer TOKEN"
```

### Response (Athlete)
```json
{
  "user": {
    "name": "Adam Scout",
    "email": "adam@scout.com",
    "gender": "male",
    "role": "athlete"
  },
  "athleteDetails": {
    "height": { "cm": 167, "inches": 65.75 },
    "weight": { "kg": 80, "lbs": 176.37 },
    "sportsAndSkillLevels": [...]
  }
}
```

### Response (Gym Owner)
```json
{
  "user": {
    "name": "John Owner",
    "email": "owner@gym.com",
    "role": "gymOwner"
  },
  "gymDetails": {
    "name": "AVX Training Club",
    "address": "123 Main",
    "personalIdentification": [...],
    "proofOfBusiness": [...],
    "gymImages": [...]
  }
}
```

---

## Delete Files While Editing

### Single File Delete
```json
{
  "deleteGymImages": "https://s3.../old-gym-1.jpg"
}
```

### Multiple Files Delete
```json
{
  "deletePersonalIdentification": [
    "https://s3.../old-id-1.jpg",
    "https://s3.../old-id-2.jpg"
  ]
}
```

### Delete + Update + Add
```
Form Data:
  gymName: "New Name"
  deleteGymImages: ["old-1.jpg", "old-2.jpg"]
  gymImages: [new-1.jpg, new-2.jpg]
```

**Result:**
- Old images removed
- New name updated
- New images appended (old ones deleted first)

---

## File Array Append Behavior

### Before (Replaced) ❌
```
Current: [img1, img2]
Upload: img3
Result: [img3]  <- Lost 1 & 2!
```

### Now (Appended) ✅
```
Current: [img1, img2]
Upload: img3
Result: [img1, img2, img3]  <- All preserved!
```

---

## Delete Keys Reference

| Key | What It Deletes |
|-----|-----------------|
| `deletePersonalIdentification` | CNIC/Passport documents |
| `deleteProofOfBusiness` | Business license files |
| `deleteGymImages` | Gym facility photos |

Accepts: Single URL or array of URLs

---

## Complete File Management Example

```bash
curl -X PUT http://localhost:3000/profile/gym-owner/update-profile \
  -H "Authorization: Bearer TOKEN" \
  -F "gymName=Updated Gym" \
  -F "deleteGymImages=https://s3.../old1.jpg" \
  -F "deleteGymImages=https://s3.../old2.jpg" \
  -F "deletePersonalIdentification=https://s3.../old-cnic.jpg" \
  -F "personalIdentification=@new-cnic-1.jpg" \
  -F "personalIdentification=@new-cnic-2.jpg" \
  -F "gymImages=@new-gym-1.jpg" \
  -F "gymImages=@new-gym-2.jpg"
```

**Processing:**
1. Delete 2 gym images
2. Delete 1 CNIC
3. Add 2 new CNCCs to existing
4. Add 2 new gym photos to existing

**Result:**
- gymImages: [existing-img, new-1, new-2]
- personalIdentification: [existing-cnic, new-1, new-2]

---

## Routes Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/profile/me/profile` | userAuth | ✨ Get own profile |
| PUT | `/profile/athlete/update-profile` | userAuth | Update athlete |
| PUT | `/profile/gym-owner/update-profile` | gymOwnerAuth | Update gym + files |

---

## Use Cases

### Use Case 1: Delete Old Documents
```json
{
  "deletePersonalIdentification": "https://s3.../expired.jpg",
  "personalIdentification": [new-cnic-front.jpg, new-cnic-back.jpg]
}
```
Old document removed, new ones added

### Use Case 2: Add More Gym Photos
```json
{
  "gymImages": [photo1.jpg, photo2.jpg]
}
```
New photos appended to existing list

### Use Case 3: Cleanup + Update
```json
{
  "gymName": "Updated Gym Name",
  "deleteGymImages": [old1.jpg, old2.jpg, old3.jpg],
  "gymImages": [new1.jpg]
}
```
Update name, remove 3 old photos, add 1 new photo

### Use Case 4: Get Current Profile
```bash
GET /profile/me/profile
Authorization: Bearer TOKEN
```
Returns athlete/gym owner's complete profile

---

## Response Examples

### Delete Success
```json
{
  "message": "Gym owner profile updated successfully",
  "data": {
    "gymDetails": {
      "personalIdentification": [
        "https://s3.../cnic-passport.jpg"
      ],
      "gymImages": [
        "https://s3.../photo1.jpg",
        "https://s3.../photo2.jpg"
      ]
    }
  }
}
```

### Get Profile Success
```json
{
  "message": "User profile retrieved successfully",
  "data": {
    "user": {...},
    "athleteDetails": {...}  // or gymDetails
  }
}
```

---

## Error Codes

```
200 ✅ Success
400 ⚠️  Bad request / Invalid data
401 ⚠️  Unauthorized / No token
404 ⚠️  Not found / User doesn't exist
422 ⚠️  Update failed / DB error
500 ❌ Server error
```

---

## Documentation

📄 Full docs: `FILE_MANAGEMENT_AND_GET_PROFILE.md`

Contains:
- Detailed implementation
- All examples
- Technical details
- Best practices
