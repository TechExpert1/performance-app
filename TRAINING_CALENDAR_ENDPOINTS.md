# Training Calendar Endpoints & Dropdown Documentation

## Overview
The `POST /training-calander` endpoint creates a new training calendar entry. While there **is no dedicated training calendar dropdown endpoint**, you can use the **sports-related dropdown endpoints** to fetch the required IDs.

---

## Required Fields for POST /training-calander

| Field | Type | Required | Description | Source |
|-------|------|----------|-------------|--------|
| `date` | Date | ✅ Yes | Training date (ISO format) | User input |
| `trainingName` | String | ❌ No | Name/title of the training session | User input |
| `sport` | ObjectId | ❌ No | Sport ID (e.g., "Basketball") | `/dropdowns/sports` |
| `category` | ObjectId | ❌ No | Sport Category ID (e.g., "Offense") | `/dropdowns/sports-skillLevel` |
| `skill` | ObjectId | ❌ No | Sport Skill ID (e.g., "3-point shooting") | `/dropdowns/sports-skillLevel` |
| `coach` | ObjectId | ❌ No | Coach User ID | Gym member list or coach assignment |
| `gym` | ObjectId | ❌ No | Gym ID (required if `trainingScope` is "gym") | User's gym or gym list |
| `startTime` | String | ❌ No | Training start time (e.g., "09:00") | User input |
| `finishTime` | String | ❌ No | Training end time (e.g., "10:30") | User input |
| `trainingScope` | String | ❌ No | "self" or "gym" (default: "self") | User selection |
| `recurrence` | String | ❌ No | "weekly" or "monthly" (default: null for one-time) | User selection |
| `note` | String | ❌ No | Additional notes or instructions | User input |
| `attendees` | Array[ObjectId] | ❌ No | Array of user IDs to invite (if `trainingScope` is "gym") | Gym member list |

---

## Dropdown Endpoints to Fetch Required IDs

### 1. GET /dropdowns/sports
**Purpose:** Get all sports with their categories and skills

**Response Structure:**
```json
{
  "data": [
    {
      "_id": "sport_001",
      "name": "Basketball",
      "category": [
        {
          "_id": "category_001",
          "name": "Offense",
          "skill": [
            {
              "_id": "skill_001",
              "name": "3-point shooting",
              "skillLevel": "Advanced"
            },
            {
              "_id": "skill_002",
              "name": "Dribbling",
              "skillLevel": "Intermediate"
            }
          ]
        },
        {
          "_id": "category_002",
          "name": "Defense",
          "skill": [
            {
              "_id": "skill_003",
              "name": "Man-to-man defense",
              "skillLevel": "Intermediate"
            }
          ]
        }
      ]
    },
    {
      "_id": "sport_002",
      "name": "Football",
      "category": [...]
    }
  ]
}
```

**What You Get:**
- `sport._id` → Use in `POST /training-calander` payload as `sport`
- `category._id` → Use as `category`
- `skill._id` → Use as `skill`

**Usage Example:**
```javascript
const sports = await fetch('/dropdowns/sports').then(r => r.json());
// Extract IDs:
const sportId = sports.data[0]._id;          // "sport_001" (Basketball)
const categoryId = sports.data[0].category[0]._id;  // "category_001" (Offense)
const skillId = sports.data[0].category[0].skill[0]._id;  // "skill_001" (3-point shooting)
```

---

### 2. GET /dropdowns/sports-skillLevel
**Purpose:** Similar to above but with additional skill level information

**Response Structure:**
```json
{
  "data": [
    {
      "_id": "sport_001",
      "name": "Basketball",
      "category": [
        {
          "_id": "category_001",
          "name": "Offense",
          "skill": [
            {
              "_id": "skill_001",
              "name": "3-point shooting",
              "skillLevel": "Advanced"
            },
            {
              "_id": "skill_002",
              "name": "Dribbling",
              "skillLevel": "Intermediate"
            }
          ]
        }
      ]
    }
  ]
}
```

**Usage:** Same as above, with additional `skillLevel` field available if needed

---

## Sample POST /training-calander Payloads

### 1. Basic Self-Training (One-time)
```json
{
  "date": "2025-10-25T10:00:00Z",
  "trainingName": "Morning Basketball Practice",
  "sport": "sport_001",
  "category": "category_001",
  "skill": "skill_001",
  "startTime": "10:00",
  "finishTime": "11:30",
  "trainingScope": "self",
  "note": "Focus on 3-point shooting"
}
```

**Response:**
```json
{
  "message": "Training calendar entry created successfully",
  "data": {
    "_id": "training_calendar_123",
    "user": "user_001",
    "date": "2025-10-25T10:00:00Z",
    "trainingName": "Morning Basketball Practice",
    "sport": "sport_001",
    "category": "category_001",
    "skill": "skill_001",
    "startTime": "10:00",
    "finishTime": "11:30",
    "trainingScope": "self",
    "note": "Focus on 3-point shooting",
    "recurrence": null,
    "createdAt": "2025-10-21T15:30:00Z"
  }
}
```

---

### 2. Gym-Scoped Training with Attendees (Weekly Recurrence)
```json
{
  "date": "2025-10-27T09:00:00Z",
  "trainingName": "Team Basketball Training",
  "sport": "sport_001",
  "category": "category_001",
  "coach": "coach_user_001",
  "gym": "gym_001",
  "startTime": "09:00",
  "finishTime": "10:30",
  "trainingScope": "gym",
  "recurrence": "weekly",
  "attendees": [
    "user_002",
    "user_003",
    "user_004"
  ],
  "note": "Mandatory training for the week"
}
```

**Response:**
```json
{
  "message": "Training calendar entry created successfully",
  "data": {
    "_id": "training_calendar_124",
    "user": "user_001",
    "coach": "coach_user_001",
    "date": "2025-10-27T09:00:00Z",
    "trainingName": "Team Basketball Training",
    "sport": "sport_001",
    "category": "category_001",
    "gym": "gym_001",
    "startTime": "09:00",
    "finishTime": "10:30",
    "trainingScope": "gym",
    "recurrence": "weekly",
    "recurrenceEndDate": "2025-11-03T09:00:00Z",
    "recurrenceStatus": "active",
    "attendees": [
      "user_002",
      "user_003",
      "user_004"
    ],
    "note": "Mandatory training for the week",
    "createdAt": "2025-10-21T15:30:00Z"
  }
}
```

---

### 3. Monthly Recurrence
```json
{
  "date": "2025-10-25T14:00:00Z",
  "trainingName": "Monthly Assessment",
  "sport": "sport_002",
  "category": "category_002",
  "skill": "skill_003",
  "gym": "gym_001",
  "startTime": "14:00",
  "finishTime": "15:00",
  "trainingScope": "self",
  "recurrence": "monthly",
  "note": "Performance evaluation session"
}
```

**Response:**
```json
{
  "message": "Training calendar entry created successfully",
  "data": {
    "_id": "training_calendar_125",
    "user": "user_001",
    "date": "2025-10-25T14:00:00Z",
    "trainingName": "Monthly Assessment",
    "sport": "sport_002",
    "category": "category_002",
    "skill": "skill_003",
    "gym": "gym_001",
    "startTime": "14:00",
    "finishTime": "15:00",
    "trainingScope": "self",
    "recurrence": "monthly",
    "recurrenceEndDate": "2025-11-25T14:00:00Z",
    "recurrenceStatus": "in-active",
    "note": "Performance evaluation session",
    "createdAt": "2025-10-21T15:30:00Z"
  }
}
```

---

## Frontend Integration Flow

### Step 1: Fetch Dropdown Data
```javascript
// Get all sports, categories, and skills
const response = await fetch('/dropdowns/sports');
const dropdownData = await response.json();

// Store or display for user selection
const sports = dropdownData.data; // Array of sports
```

### Step 2: User Selects Sport → Populate Category Dropdown
```javascript
function handleSportSelect(selectedSportId) {
  const sport = sports.find(s => s._id === selectedSportId);
  const categories = sport.category; // Show in UI
}
```

### Step 3: User Selects Category → Populate Skill Dropdown
```javascript
function handleCategorySelect(selectedCategoryId) {
  const category = sport.category.find(c => c._id === selectedCategoryId);
  const skills = category.skill; // Show in UI
}
```

### Step 4: Submit Training Calendar
```javascript
async function createTraining(formData) {
  const payload = {
    date: formData.date,
    trainingName: formData.trainingName,
    sport: formData.selectedSportId,        // From dropdown
    category: formData.selectedCategoryId,  // From dropdown
    skill: formData.selectedSkillId,        // From dropdown
    coach: formData.coachId,                // If applicable
    gym: formData.gymId,                    // If applicable
    startTime: formData.startTime,
    finishTime: formData.finishTime,
    trainingScope: formData.trainingScope,  // "self" or "gym"
    recurrence: formData.recurrence,        // null, "weekly", or "monthly"
    attendees: formData.attendeeIds,        // If gym-scoped
    note: formData.note
  };

  const response = await fetch('/training-calander', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return response.json();
}
```

---

## Other Training Calendar Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/training-calander` | Get all training calendar entries (with filters) |
| GET | `/training-calander/:id` | Get a specific training calendar entry |
| PATCH | `/training-calander/:id` | Update a training calendar entry |
| DELETE | `/training-calander/:id` | Delete a training calendar entry |
| GET | `/training-calander/monthly-counts` | Get monthly training counts |
| GET | `/training-calander/:id/checkin-request` | Request check-in for a training session |
| GET | `/training-calander/update-status/:id` | Update training member status |

---

## Important Notes

⚠️ **No dedicated training calendar dropdown endpoint exists.** Use `/dropdowns/sports` or `/dropdowns/sports-skillLevel` to fetch sport, category, and skill IDs.

⚠️ **Gym ID**: If `trainingScope` is "gym", you'll need the `gym` ID. This typically comes from:
- User's profile (if they own/manage a gym)
- Gym membership list

⚠️ **Coach ID**: If assigning a coach, use the User ID of the coach. Fetch from gym member list or coach listing endpoints.

⚠️ **Attendees Array**: Only applicable when `trainingScope` is "gym". Users will receive notifications about the scheduled training.

⚠️ **Recurrence Behavior**:
- `recurrence: null` → One-time training session
- `recurrence: "weekly"` → Repeats for 7 days (auto-calculated)
- `recurrence: "monthly"` → Repeats for 1 month (auto-calculated)
- `recurrenceStatus` defaults to "in-active" and can be toggled via update endpoint

