# Performance App - Testing Endpoints Guide

## Base URL
```
https://performance-app-production.up.railway.app/api/v1
```

---

## 🎯 Profile Management

### 1. Update Gym Owner Profile
**Endpoint:** `PATCH /profile/:id`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "user": {
    "name": "Updated Gym Owner Name",
    "email": "newemail@gmail.com",
    "phoneNumber": "+923214253482",
    "gender": "male",
    "nationality": "Pakistani",
    "dob": "1990-01-15T00:00:00.000Z"
  }
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "68595ae6dfbcc100db286241",
    "name": "Updated Gym Owner Name",
    "email": "newemail@gmail.com",
    "phoneNumber": "+923214253482",
    ...
  }
}
```

---

### 2. Get Gym Owner Profile (with updated data)
**Endpoint:** `GET /profile/:id`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Response:**
```json
{
  "user": {
    "_id": "68595ae6dfbcc100db286241",
    "name": "Updated Gym Owner Name",
    "email": "newemail@gmail.com",
    "phoneNumber": "+923214253482",
    "role": "gymOwner",
    "gym": {
      "_id": "6888b736c892e0d6f16623fc",
      "name": "Universal Gym",
      "address": "75 str LA",
      ...
    }
  },
  "gymDetails": {
    "_id": "6888b736c892e0d6f16623fc",
    "name": "Universal Gym",
    "address": "75 str LA",
    "sport": [...]
  },
  "requests": []
}
```

---

## 📅 Training Calendar Management

### 3. Create Training Calendar (with multiple skills)
**Endpoint:** `POST /training-calander`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "trainingName": "Advanced Boxing Session",
  "sport": "6877ce55e42c26ccd8e0b9b3",
  "category": "6877ce55e42c26ccd8e0b9b4",
  "date": "2025-10-27T17:26:05.000Z",
  "startTime": "10:26 AM",
  "finishTime": "11:26 AM",
  "recurrence": "weekly",
  "recurrenceStatus": "active",
  "note": "Focus on defensive techniques",
  "skills": [
    "6877ce55e42c26ccd8e0b9c0",
    "6877ce55e42c26ccd8e0b9c1",
    "6877ce55e42c26ccd8e0b9c2"
  ],
  "classLimit": 23,
  "attendees": [
    "VALID_USER_ID_1",
    "VALID_USER_ID_2",
    "VALID_USER_ID_3"
  ],
  "coach": "68f75fd517502dbae9af1133",
  "trainingScope": "gym",
  "gym": "6888b736c892e0d6f16623fc"
}
```

**Response:**
```json
{
  "message": "Training calendar created",
  "data": {
    "_id": "68fc9f45acb37c4061e9f78e",
    "user": { "..." },
    "coach": { "..." },
    "trainingName": "Advanced Boxing Session",
    "sport": { "..." },
    "category": { "..." },
    "skills": [
      { "_id": "6877ce55e42c26ccd8e0b9c0", "name": "Rear Hook", ... },
      { "_id": "6877ce55e42c26ccd8e0b9c1", "name": "Lead Uppercut", ... },
      { "_id": "6877ce55e42c26ccd8e0b9c2", "name": "Rear Uppercut", ... }
    ],
    "trainingScope": "gym",
    "date": "2025-10-27T17:26:05.000Z",
    "startTime": "10:26 AM",
    "finishTime": "11:26 AM",
    "gym": { "..." },
    "recurrence": "weekly",
    "recurrenceEndDate": "2025-11-03T17:26:05.000Z",
    "recurrenceStatus": "active",
    "classLimit": 23,
    "note": "Focus on defensive techniques",
    "attendees": [
      {
        "_id": "training_member_id",
        "user": { "..." },
        "status": "approved",
        "checkInStatus": "not-checked-in"
      }
    ]
  }
}
```

---

### 4. Get Training Calendar by ID
**Endpoint:** `GET /training-calander/:id`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Response:**
```json
{
  "message": "Training calendar fetched",
  "data": {
    "_id": "68fc9f45acb37c4061e9f78e",
    "trainingName": "Advanced Boxing Session",
    "date": "2025-10-27T17:26:05.000Z",
    "recurrence": "weekly",
    "skills": [
      { "_id": "6877ce55e42c26ccd8e0b9c0", "name": "Rear Hook", ... }
    ],
    "attendees": [
      {
        "_id": "training_member_id",
        "user": { "name": "John Doe", "email": "john@gmail.com", ... },
        "status": "approved",
        "checkInStatus": "not-checked-in"
      }
    ]
  }
}
```

---

### 5. Get All Training Calendars (with pagination and filtering)
**Endpoint:** `GET /training-calander?page=1&limit=10&month=october&year=2025`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `month` (optional): Month name (january-december)
- `year` (optional): Year (e.g., 2025)
- `sortBy` (optional): Field to sort by (default: createdAt)
- `sortOrder` (optional): asc or desc (default: desc)
- `user` (optional): Override user ID (not needed - uses Bearer token automatically)

**⭐ Automatic User Detection (Role-Based):**
- ✅ No need to pass `user` as query parameter
- ✅ System automatically uses authenticated user's ID from Bearer token
- ✅ Results depend on user role:

**Role-Based Filtering:**
- **Gym Owner**: Only trainings they created (not attendee trainings)
  - Returns: Trainings where `user: gymOwnerId`
- **Athlete/Coach**: Trainings they created + trainings they're invited to
  - Returns: Trainings where they're creator OR attendee (in Training_Member table)

**Response:**
```json
{
  "message": "Paginated training calendar fetched",
  "data": [
    {
      "_id": "68fc9f45acb37c4061e9f78e",
      "trainingName": "Advanced Boxing Session",
      "date": "2025-10-27T17:26:05.000Z",
      "skills": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "totalResults": 25
  }
}
```

---

### 6. Update Training Calendar
**Endpoint:** `PATCH /training-calander/:id`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "trainingName": "Updated Training Name",
  "date": "2025-10-28T18:00:00.000Z",
  "startTime": "6:00 PM",
  "finishTime": "7:30 PM",
  "classLimit": 30,
  "note": "Updated note"
}
```

---

## 👥 Gym Members Management

### 7. Get Gym Members (with coach assignment)
**Endpoint:** `GET /coach/gym-members?coachId=COACH_ID&page=1&limit=20`

**Headers:**
```json
{
  "Authorization": "Bearer GYM_OWNER_TOKEN",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
- `coachId` (required): Coach ID
- `page` (optional): Page number
- `limit` (optional): Items per page
- `sortBy` (optional): Field to sort by
- `sortOrder` (optional): asc or desc

**Response:**
```json
{
  "data": [
    {
      "_id": "user_id_1",
      "name": "John Athlete",
      "email": "john@gmail.com",
      "profileImage": "url",
      "phoneNumber": "+923214253482",
      "role": "athlete",
      "gym": "gym_id",
      "coach": "coach_id",
      "assignedTo": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 2,
    "totalResults": 35
  }
}
```

---

### 8. Get Gym Members via SalesRep API
**Endpoint:** `GET /salesRep/gyms/:gymId/members`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Response:**
```json
{
  "gymMembers": [
    {
      "_id": "gym_member_id",
      "user": {
        "_id": "user_id",
        "name": "John Athlete",
        "email": "john@gmail.com",
        "profileImage": "url",
        "role": "athlete"
      }
    }
  ]
}
```

---

## 🏋️ Coach Management

### 9. Create Coach
**Endpoint:** `POST /coach`

**Headers:**
```json
{
  "Authorization": "Bearer GYM_OWNER_TOKEN",
  "Content-Type": "multipart/form-data"
}
```

**Form Data:**
```
name: "James Smith"
email: "james@gmail.com"
phoneNumber: "+923214253482"
profileImage: (file)
```

---

### 10. Update Coach
**Endpoint:** `PATCH /coach/:id`

**Headers:**
```json
{
  "Authorization": "Bearer GYM_OWNER_TOKEN",
  "Content-Type": "multipart/form-data"
}
```

**Form Data:**
```
name: "Updated Coach Name"
phoneNumber: "+923214253482"
profileImage: (file)
```

---

### 11. Get My Coaches (Gym Owner's Coaches)
**Endpoint:** `GET /coach/my-coaches`

**Headers:**
```json
{
  "Authorization": "Bearer GYM_OWNER_TOKEN",
  "Content-Type": "application/json"
}
```

**Response:**
```json
{
  "message": "Coaches fetched successfully",
  "data": [
    {
      "_id": "coach_id",
      "name": "James Smith",
      "email": "james@gmail.com",
      "profileImage": "url",
      "role": "coach",
      "gym": "gym_id"
    }
  ]
}
```

---

### 12. Assign Member to Coach
**Endpoint:** `POST /coach/:coachId/assign-member`

**Headers:**
```json
{
  "Authorization": "Bearer GYM_OWNER_TOKEN",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "userId": "athlete_user_id"
}
```

---

## 📊 Testing Checklist

- [ ] Update gym owner profile and verify immediate GET returns updated data
- [ ] Create training calendar with multiple skills and attendees
- [ ] Verify attendees are populated in create response
- [ ] Get training by ID and verify all details including attendees
- [ ] Filter trainings by month/year
- [ ] Get gym members with coach assignment
- [ ] Update training calendar fields
- [ ] Create and update coaches
- [ ] Assign members to coaches

---

## 🔐 Authentication

All endpoints marked with **Bearer TOKEN** require:

**Header:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

Get your token by logging in:
**Endpoint:** `POST /auth/login`

```json
{
  "email": "user@gmail.com",
  "password": "password123"
}
```

---

## 🏋️ Athlete Performance Analytics (Gym Owner)

### 1. Get Athlete Sport Reviews
**Endpoint:** `GET /coaches/athletes/:athleteId/sport-reviews?sport=SPORT_ID&month=march&year=2025`

**Authentication:** Requires `gymOwnerAuth` (Bearer token)

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_GYM_OWNER_TOKEN",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
- `sport` (optional): Sport ID to filter by
- `month` (optional): Month name (january-december)
- `year` (optional): Year (e.g., 2025)

**Description:**
Returns daily aggregated reviews (personal, peer, and coach) for an athlete on a 1-5 scale for each day they had reviews.

**Response:**
```json
{
  "message": "Sport reviews fetched successfully",
  "data": [
    {
      "date": "2025-03-14",
      "personalReview": 3.5,
      "peerReview": 4.2,
      "coachReview": 3.8
    },
    {
      "date": "2025-03-15",
      "personalReview": 3.0,
      "peerReview": 0,
      "coachReview": 4.5
    }
  ]
}
```

---

### 2. Get Athlete Skill Training
**Endpoint:** `GET /coaches/athletes/:athleteId/skill-training?sport=SPORT_ID&timePeriod=7`

**Authentication:** Requires `gymOwnerAuth` (Bearer token)

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_GYM_OWNER_TOKEN",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
- `sport` (optional): Sport ID to filter by
- `timePeriod` (optional): Number of days to look back (default: 7)
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)

**Description:**
Returns skill training distribution as percentages showing which skills the athlete has trained on during the specified time period.

**Response:**
```json
{
  "message": "Skill training data fetched successfully",
  "data": {
    "timePeriod": "7",
    "startDate": "2025-10-21T00:00:00.000Z",
    "endDate": "2025-10-28T00:00:00.000Z",
    "skills": [
      {
        "skill": "Leg Locks",
        "percentage": 50.0,
        "count": 5
      },
      {
        "skill": "Takedowns",
        "percentage": 20.0,
        "count": 2
      }
    ]
  }
}
```

---

### 3. Get Athlete Physical Performance
**Endpoint:** `GET /coaches/athletes/:athleteId/physical-performance?month=april&year=2025&exercise=EXERCISE_ID`

**Authentication:** Requires `gymOwnerAuth` (Bearer token)

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_GYM_OWNER_TOKEN",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
- `month` (optional): Month name (january-december)
- `year` (optional): Year (e.g., 2025)
- `exercise` (optional): Specific exercise ID to filter by

**Description:**
Returns physical performance metrics (e.g., Back Squat with weight progression) and attendance data for graphing.

**Response:**
```json
{
  "message": "Physical performance data fetched successfully",
  "data": {
    "exercises": {
      "Back Squat": [
        {
          "date": "2025-02-06",
          "weight": 80,
          "reps": 5,
          "sets": 3,
          "rpe": 7
        }
      ]
    },
    "attendance": {
      "daysAttended": 8,
      "dates": ["2025-04-01", "2025-04-03", "2025-04-05"]
    }
  }
}
```

---

## ⚠️ Important Notes

1. **Valid User IDs**: When creating attendees, ensure you use valid User IDs that exist in your database
2. **Date Format**: Use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
3. **Multiple Skills**: The `skills` field is an array of skill IDs (new feature)
4. **Gym Auto-population**: If `trainingScope` is "gym" and gym is not provided, it auto-populates from gym owner's profile
5. **Recurrence**: Weekly recurrence auto-calculates `recurrenceEndDate` as +7 days
6. **Profile Caching**: All profile data uses `.lean()` to ensure fresh database data

---

## 📋 Dropdown/Reference Data APIs

### Get All Sports
**Endpoint:** `GET /dropdown-data/sports`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Description:**
Returns a list of all active sports with their IDs. Use these IDs for filtering or creating trainings.

**Response:**
```json
{
  "message": "Sports fetched successfully",
  "data": [
    {
      "_id": "6877ce55e42c26ccd8e0b9b3",
      "name": "Boxing"
    },
    {
      "_id": "6877ce55e42c26ccd8e0b9b4",
      "name": "Rugby"
    },
    {
      "_id": "6877ce55e42c26ccd8e0b9b5",
      "name": "Football"
    }
  ]
}
```

---

### Get Sport by ID
**Endpoint:** `GET /dropdown-data/sports/:id`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Response:**
```json
{
  "message": "Sport fetched successfully",
  "data": {
    "_id": "6877ce55e42c26ccd8e0b9b3",
    "name": "Boxing",
    "sportsType": {
      "_id": "68771234567890abcdef1234",
      "name": "Combat Sports"
    }
  }
}
```

---

### Get All Exercises
**Endpoint:** `GET /dropdown-data/exercises`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Description:**
Returns a list of all exercises with their categories and subcategories.

**Response:**
```json
{
  "message": "Exercises fetched successfully",
  "data": [
    {
      "_id": "68f21e7b2de1e16fbc8936d3",
      "name": "Back Squat",
      "description": "Weighted squat exercise",
      "challengeCategory": {
        "_id": "68f1234567890abcdef12345",
        "name": "Strength"
      },
      "subCategory": {
        "_id": "68f1234567890abcdef12346",
        "name": "Lower Body"
      }
    },
    {
      "_id": "68f21e7b2de1e16fbc8936d4",
      "name": "Deadlift",
      "description": "Deadlift exercise",
      "challengeCategory": {
        "_id": "68f1234567890abcdef12345",
        "name": "Strength"
      },
      "subCategory": {
        "_id": "68f1234567890abcdef12347",
        "name": "Full Body"
      }
    }
  ]
}
```

---

### Get Exercise by ID
**Endpoint:** `GET /dropdown-data/exercises/:id`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Response:**
```json
{
  "message": "Exercise fetched successfully",
  "data": {
    "_id": "68f21e7b2de1e16fbc8936d3",
    "name": "Back Squat",
    "description": "Weighted squat exercise",
    "coachTip": "Keep your back straight and chest up",
    "challengeCategory": {
      "_id": "68f1234567890abcdef12345",
      "name": "Strength"
    },
    "subCategory": {
      "_id": "68f1234567890abcdef12346",
      "name": "Lower Body"
    }
  }
}
```

---

### Get Exercises by Category
**Endpoint:** `GET /dropdown-data/exercises/category/:categoryId`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Description:**
Returns all exercises that belong to a specific challenge category.

**Response:**
```json
{
  "message": "Exercises fetched successfully",
  "data": [
    {
      "_id": "68f21e7b2de1e16fbc8936d3",
      "name": "Back Squat",
      "description": "Weighted squat exercise",
      "subCategory": {
        "_id": "68f1234567890abcdef12346",
        "name": "Lower Body"
      }
    }
  ]
}
```

---


Generated: 2025-10-25
