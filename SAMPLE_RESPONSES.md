# Sample API Responses - Challenge Endpoints with User-Challenge ID Alignment

## Overview
When a `user` or `userId` query parameter is provided to challenge endpoints, the response returns the User_Challenge document's `_id` as the root `_id`, keeping the original Challenge `_id` as `challengeId`.

---

## 1. GET /challenges (List All Challenges)

### 1a. WITHOUT user query parameter (no user context)
```json
{
  "message": "Challenges fetched successfully",
  "data": [
    {
      "_id": "64a8f1b2c3d4e5f6g7h8i9j0",
      "name": "50 Push-ups Challenge",
      "description": "Complete 50 push-ups in one session",
      "createdBy": {
        "_id": "user123",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "exercise": {
        "_id": "exercise456",
        "name": "Push-up"
      },
      "format": {
        "_id": "format789",
        "name": "Reps"
      },
      "type": {
        "_id": "type101",
        "name": "Strength"
      },
      "participants": [
        {
          "_id": "user001",
          "name": "John Doe"
        },
        {
          "_id": "user002",
          "name": "Jane Smith"
        }
      ],
      "startDate": "2025-10-17T00:00:00.000Z",
      "endDate": "2025-10-24T00:00:00.000Z",
      "daysLeft": 7,
      "dailySubmissions": [
        {
          "_id": "sub001",
          "user": {
            "_id": "user001",
            "name": "John Doe",
            "profileImage": "https://example.com/john.jpg"
          },
          "date": "2025-10-17",
          "time": "09:30",
          "reps": "50",
          "distance": "",
          "mediaUrl": "https://example.com/video.mp4",
          "ownerApprovalStatus": "approved",
          "note": "Completed in 5 minutes"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "totalResults": 1
  }
}
```

### 1b. WITH user query parameter (user-scoped view)
```json
{
  "message": "Challenges fetched successfully",
  "data": [
    {
      "_id": "user_challenge_64c9e2a3d4e5f6g7h8i9j0k1",
      "challengeId": "64a8f1b2c3d4e5f6g7h8i9j0",
      "name": "50 Push-ups Challenge",
      "description": "Complete 50 push-ups in one session",
      "createdBy": {
        "_id": "user123",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "exercise": {
        "_id": "exercise456",
        "name": "Push-up"
      },
      "format": {
        "_id": "format789",
        "name": "Reps"
      },
      "type": {
        "_id": "type101",
        "name": "Strength"
      },
      "participants": [
        {
          "_id": "user001",
          "name": "John Doe"
        },
        {
          "_id": "user002",
          "name": "Jane Smith"
        }
      ],
      "startDate": "2025-10-17T00:00:00.000Z",
      "endDate": "2025-10-24T00:00:00.000Z",
      "daysLeft": 7,
      "status": "in-progress",
      "dailySubmissions": [
        {
          "_id": "user_sub_001",
          "date": "2025-10-17",
          "time": "09:30",
          "reps": "50",
          "distance": "",
          "mediaUrl": "https://example.com/user-video.mp4",
          "ownerApprovalStatus": "pending",
          "note": "Just completed my first batch"
        },
        {
          "_id": "user_sub_002",
          "date": "2025-10-16",
          "time": "14:15",
          "reps": "25",
          "distance": "",
          "mediaUrl": "https://example.com/user-video2.mp4",
          "ownerApprovalStatus": "approved",
          "note": "Warmed up first"
        }
      ],
      "userChallenge": {
        "_id": "user_challenge_64c9e2a3d4e5f6g7h8i9j0k1",
        "user": "user001",
        "challenge": "64a8f1b2c3d4e5f6g7h8i9j0",
        "status": "in-progress",
        "createdAt": "2025-10-17T10:00:00.000Z",
        "dailySubmissions": [
          {
            "_id": "user_sub_001",
            "date": "2025-10-17",
            "time": "09:30",
            "reps": "50",
            "distance": "",
            "mediaUrl": "https://example.com/user-video.mp4",
            "ownerApprovalStatus": "pending",
            "note": "Just completed my first batch"
          },
          {
            "_id": "user_sub_002",
            "date": "2025-10-16",
            "time": "14:15",
            "reps": "25",
            "distance": "",
            "mediaUrl": "https://example.com/user-video2.mp4",
            "ownerApprovalStatus": "approved",
            "note": "Warmed up first"
          }
        ]
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "totalResults": 1
  }
}
```

---

## 2. GET /challenges/:id (Get Single Challenge)

### 2a. WITHOUT user query parameter
```json
{
  "_id": "64a8f1b2c3d4e5f6g7h8i9j0",
  "name": "50 Push-ups Challenge",
  "description": "Complete 50 push-ups in one session",
  "createdBy": {
    "_id": "user123",
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "exercise": {
    "_id": "exercise456",
    "name": "Push-up"
  },
  "format": {
    "_id": "format789",
    "name": "Reps"
  },
  "type": {
    "_id": "type101",
    "name": "Strength"
  },
  "participants": [
    {
      "_id": "user001",
      "name": "John Doe"
    }
  ],
  "startDate": "2025-10-17T00:00:00.000Z",
  "endDate": "2025-10-24T00:00:00.000Z",
  "dailySubmissions": [
    {
      "_id": "sub001",
      "user": {
        "_id": "user001",
        "name": "John Doe",
        "profileImage": "https://example.com/john.jpg"
      },
      "date": "2025-10-17",
      "time": "09:30",
      "reps": "50",
      "distance": "",
      "mediaUrl": "https://example.com/video.mp4",
      "ownerApprovalStatus": "approved",
      "note": "Completed in 5 minutes"
    }
  ],
  "createdAt": "2025-10-15T08:00:00.000Z",
  "updatedAt": "2025-10-17T10:30:00.000Z"
}
```

### 2b. WITH user query parameter (e.g., GET /challenges/:id?user=user001)
```json
{
  "_id": "user_challenge_64c9e2a3d4e5f6g7h8i9j0k1",
  "challengeId": "64a8f1b2c3d4e5f6g7h8i9j0",
  "name": "50 Push-ups Challenge",
  "description": "Complete 50 push-ups in one session",
  "createdBy": {
    "_id": "user123",
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "exercise": {
    "_id": "exercise456",
    "name": "Push-up"
  },
  "format": {
    "_id": "format789",
    "name": "Reps"
  },
  "type": {
    "_id": "type101",
    "name": "Strength"
  },
  "participants": [
    {
      "_id": "user001",
      "name": "John Doe"
    }
  ],
  "startDate": "2025-10-17T00:00:00.000Z",
  "endDate": "2025-10-24T00:00:00.000Z",
  "status": "in-progress",
  "dailySubmissions": [
    {
      "_id": "user_sub_001",
      "date": "2025-10-17",
      "time": "09:30",
      "reps": "50",
      "distance": "",
      "mediaUrl": "https://example.com/user-video.mp4",
      "ownerApprovalStatus": "pending",
      "note": "Just completed my first batch"
    }
  ],
  "userChallenge": {
    "_id": "user_challenge_64c9e2a3d4e5f6g7h8i9j0k1",
    "user": "user001",
    "challenge": "64a8f1b2c3d4e5f6g7h8i9j0",
    "status": "in-progress",
    "createdAt": "2025-10-17T10:00:00.000Z",
    "dailySubmissions": [
      {
        "_id": "user_sub_001",
        "date": "2025-10-17",
        "time": "09:30",
        "reps": "50",
        "distance": "",
        "mediaUrl": "https://example.com/user-video.mp4",
        "ownerApprovalStatus": "pending",
        "note": "Just completed my first batch"
      }
    ]
  },
  "createdAt": "2025-10-15T08:00:00.000Z",
  "updatedAt": "2025-10-17T10:30:00.000Z"
}
```

### 2c. WITH user query parameter but NO User_Challenge found (fallback)
```json
{
  "_id": "64a8f1b2c3d4e5f6g7h8i9j0",
  "name": "50 Push-ups Challenge",
  "description": "Complete 50 push-ups in one session",
  "createdBy": {
    "_id": "user123",
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "exercise": {
    "_id": "exercise456",
    "name": "Push-up"
  },
  "format": {
    "_id": "format789",
    "name": "Reps"
  },
  "type": {
    "_id": "type101",
    "name": "Strength"
  },
  "participants": [
    {
      "_id": "user001",
      "name": "John Doe"
    }
  ],
  "startDate": "2025-10-17T00:00:00.000Z",
  "endDate": "2025-10-24T00:00:00.000Z",
  "dailySubmissions": [
    {
      "_id": "sub001",
      "user": {
        "_id": "user001",
        "name": "John Doe",
        "profileImage": "https://example.com/john.jpg"
      },
      "date": "2025-10-17",
      "time": "09:30",
      "reps": "50",
      "distance": "",
      "mediaUrl": "https://example.com/video.mp4",
      "ownerApprovalStatus": "approved",
      "note": "Completed in 5 minutes"
    }
  ],
  "createdAt": "2025-10-15T08:00:00.000Z",
  "updatedAt": "2025-10-17T10:30:00.000Z"
}
```
*(Note: Returns challenge's original _id because no User_Challenge exists for this user)*

---

## 3. GET /user-challenges (For Comparison)

### User-specific challenges (already existing behavior)
```json
{
  "message": "User challenges fetched successfully",
  "data": [
    {
      "_id": "user_challenge_64c9e2a3d4e5f6g7h8i9j0k1",
      "user": "user001",
      "challenge": {
        "_id": "64a8f1b2c3d4e5f6g7h8i9j0",
        "name": "50 Push-ups Challenge",
        "description": "Complete 50 push-ups in one session",
        "createdBy": {
          "_id": "user123",
          "name": "Admin User"
        },
        "exercise": {
          "_id": "exercise456",
          "name": "Push-up"
        },
        "format": {
          "_id": "format789",
          "name": "Reps"
        },
        "type": {
          "_id": "type101",
          "name": "Strength"
        }
      },
      "status": "in-progress",
      "dailySubmissions": [
        {
          "_id": "user_sub_001",
          "date": "2025-10-17",
          "time": "09:30",
          "reps": "50",
          "distance": "",
          "mediaUrl": "https://example.com/user-video.mp4",
          "ownerApprovalStatus": "pending",
          "note": "Just completed my first batch"
        },
        {
          "_id": "user_sub_002",
          "date": "2025-10-16",
          "time": "14:15",
          "reps": "25",
          "distance": "",
          "mediaUrl": "https://example.com/user-video2.mp4",
          "ownerApprovalStatus": "approved",
          "note": "Warmed up first"
        }
      ],
      "createdAt": "2025-10-17T10:00:00.000Z",
      "updatedAt": "2025-10-17T15:00:00.000Z"
    }
  ]
}
```

---

## 4. Comparison: Root _id Alignment

| Endpoint | Query | Root _id | Contains challengeId? | Contains userChallenge? |
|----------|-------|----------|--------------------|-----------------------|
| GET /challenges?user=user001 | With user param | User_Challenge._id ✅ | Yes (challengeId) ✅ | Yes ✅ |
| GET /challenges/:id?user=user001 | With user param | User_Challenge._id ✅ | Yes (challengeId) ✅ | Yes ✅ |
| GET /challenges | No user param | Challenge._id | No | No |
| GET /challenges/:id | No user param | Challenge._id | No | No |
| GET /user-challenges | N/A | User_Challenge._id | No | Implicit (same object) |

---

## 5. Key Differences Summary

### Without user query (generic challenge view)
- Root `_id` = Challenge document id
- Returns challenge metadata + all community dailySubmissions
- No user-specific status or individual user submissions

### With user query parameter (user-scoped view)
- Root `_id` = User_Challenge document id
- Includes `challengeId` = Challenge document id (for reference)
- Returns user-specific `status` (e.g., "in-progress", "completed", "abandoned")
- Returns only **that user's** `dailySubmissions` from the User_Challenge document
- Includes full `userChallenge` object with user-specific data
- If no User_Challenge exists for that user+challenge: falls back to challenge view (original behavior)

---

## 6. Usage Examples

### Frontend: Get challenge details for current user
```javascript
// User is viewing their own challenge progress
const userId = "user001";
const challengeId = "64a8f1b2c3d4e5f6g7h8i9j0";

const response = await fetch(`/challenges/${challengeId}?user=${userId}`);
const data = await response.json();

// Root _id is now the User_Challenge id
console.log(data._id); // "user_challenge_64c9e2a3d4e5f6g7h8i9j0k1"

// Still can access the challenge id
console.log(data.challengeId); // "64a8f1b2c3d4e5f6g7h8i9j0"

// User-specific progress
console.log(data.status); // "in-progress"
console.log(data.dailySubmissions); // [user's submissions only]
```

### Frontend: Browse community challenges (no personalization)
```javascript
// Browsing all available challenges
const response = await fetch(`/challenges`);
const data = await response.json();

// Root _id is the Challenge id (original behavior)
console.log(data.data[0]._id); // "64a8f1b2c3d4e5f6g7h8i9j0"

// Shows all community submissions
console.log(data.data[0].dailySubmissions.length); // could be 100+
```

---

