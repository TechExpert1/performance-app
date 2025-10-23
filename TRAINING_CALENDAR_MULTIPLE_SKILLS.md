# Training Calendar - Multiple Skills Support

## Overview
The POST `/training-calander` endpoint now supports sending **multiple skills** in a single training calendar entry.

## Changes Made

### 1. Model Update (`src/models/Training_Calendar.ts`)
Added a `skills` array field to store multiple skill references:

```typescript
skill: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Sport_Category_Skill",
},
skills: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sport_Category_Skill",
  },
],
```

### 2. Interface Update (`src/interfaces/trainingCalander.interface.ts`)
Updated the interface to include both `skill` (deprecated) and `skills` (new):

```typescript
skill?: Types.ObjectId;      // Deprecated, kept for backward compatibility
skills?: Types.ObjectId[];   // New: array of skill IDs
```

### 3. Service Update (`src/services/trainingCalendar.ts`)
Updated all populate calls to include the new `skills` field:

```typescript
.populate(["user", "sport", "category", "skill", "skills"])
```

---

## Usage

### Option 1: Send a Single Skill (Backward Compatible)
```json
{
  "date": "2025-10-25T10:00:00Z",
  "trainingName": "Basketball Practice",
  "sport": "sport_001",
  "category": "category_001",
  "skill": "skill_001",
  "startTime": "10:00",
  "finishTime": "11:30",
  "trainingScope": "self"
}
```

**Response:**
```json
{
  "message": "Training calendar created",
  "data": {
    "_id": "training_001",
    "skill": "skill_001",
    "skills": [],
    ...
  }
}
```

---

### Option 2: Send Multiple Skills (New)
```json
{
  "date": "2025-10-25T10:00:00Z",
  "trainingName": "Basketball Practice",
  "sport": "sport_001",
  "category": "category_001",
  "skills": ["skill_001", "skill_002", "skill_003"],
  "startTime": "10:00",
  "finishTime": "11:30",
  "trainingScope": "self"
}
```

**Response:**
```json
{
  "message": "Training calendar created",
  "data": {
    "_id": "training_001",
    "skill": null,
    "skills": ["skill_001", "skill_002", "skill_003"],
    ...
  }
}
```

---

### Option 3: Mix Both (Both Will Be Stored)
```json
{
  "date": "2025-10-25T10:00:00Z",
  "trainingName": "Basketball Practice",
  "sport": "sport_001",
  "category": "category_001",
  "skill": "skill_001",
  "skills": ["skill_002", "skill_003"],
  "startTime": "10:00",
  "finishTime": "11:30",
  "trainingScope": "self"
}
```

**Response:**
```json
{
  "message": "Training calendar created",
  "data": {
    "_id": "training_001",
    "skill": "skill_001",
    "skills": ["skill_002", "skill_003"],
    ...
  }
}
```

---

## GET /training-calander Response Format

When fetching training calendars, both `skill` and `skills` will be populated:

```json
{
  "message": "Paginated training calendar fetched",
  "data": [
    {
      "_id": "training_001",
      "trainingName": "Basketball Practice",
      "date": "2025-10-25T10:00:00Z",
      "sport": {
        "_id": "sport_001",
        "name": "Basketball"
      },
      "category": {
        "_id": "category_001",
        "name": "Offense"
      },
      "skill": {
        "_id": "skill_001",
        "name": "3-point shooting",
        "skillLevel": "Advanced"
      },
      "skills": [
        {
          "_id": "skill_002",
          "name": "Dribbling",
          "skillLevel": "Intermediate"
        },
        {
          "_id": "skill_003",
          "name": "Passing",
          "skillLevel": "Beginner"
        }
      ],
      "startTime": "10:00",
      "finishTime": "11:30",
      "trainingScope": "self",
      "createdAt": "2025-10-25T09:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

## Frontend Integration Example

### React Example - Multiple Skills Selection
```javascript
import React, { useState } from 'react';

function CreateTrainingForm() {
  const [formData, setFormData] = useState({
    date: '',
    trainingName: '',
    sport: '',
    category: '',
    skills: [], // Array of skills
    startTime: '',
    finishTime: ''
  });

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([
    { _id: 'skill_001', name: '3-point shooting' },
    { _id: 'skill_002', name: 'Dribbling' },
    { _id: 'skill_003', name: 'Passing' }
  ]);

  // Handle skill selection (multi-select)
  const handleSkillChange = (skillId) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter(id => id !== skillId)
        : [...prev.skills, skillId]
    }));
  };

  // Submit training
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      skills: formData.skills.length > 0 ? formData.skills : undefined
    };

    const response = await fetch('/training-calander', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('Training created:', result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Training Name"
        value={formData.trainingName}
        onChange={(e) => setFormData({...formData, trainingName: e.target.value})}
      />

      {/* Multi-select for skills */}
      <div>
        <label>Select Skills:</label>
        {availableSkills.map(skill => (
          <label key={skill._id}>
            <input
              type="checkbox"
              checked={formData.skills.includes(skill._id)}
              onChange={() => handleSkillChange(skill._id)}
            />
            {skill.name}
          </label>
        ))}
      </div>

      <button type="submit">Create Training</button>
    </form>
  );
}

export default CreateTrainingForm;
```

---

## PATCH /training-calander/:id (Update)

You can also update an existing training with multiple skills:

```json
{
  "skills": ["6877cd83e42c26ccd8e0b94c", "6877cd83e42c26ccd8e0b94d", "6877cd83e42c26ccd8e0b94e"]
}
```

---

## Sample Postman Request

### POST /training-calander
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "date": "2025-10-25T10:00:00Z",
  "trainingName": "Comprehensive Basketball Session",
  "sport": "6877cefee42c26ccd8e0b9fe",
  "category": "6877cefee42c26ccd8e0b9ff",
  "skills": [
    "6877d0a5b2e4d7f9c1a3b5d7",
    "6877d0a5b2e4d7f9c1a3b5d8",
    "6877d0a5b2e4d7f9c1a3b5d9"
  ],
  "startTime": "10:00",
  "finishTime": "11:30",
  "trainingScope": "gym",
  "gym": "6877d12f9e5b3c2a8f1d4e6g",
  "attendees": ["user_001", "user_002", "user_003"],
  "note": "Focus on multiple skills: shooting, dribbling, and defense"
}
```

---

## Backward Compatibility

✅ **Fully backward compatible**
- Old payloads with single `skill` still work
- Old payloads are stored in the `skill` field
- New payloads with `skills` array are stored in the `skills` field
- Both are populated in responses, allowing consumers to use either

---

## Benefits

✅ **More comprehensive training logging** - capture multiple skills in a single training session

✅ **Flexible API** - supports both single and multiple skills

✅ **No breaking changes** - existing code continues to work

✅ **Better analytics** - track skill distribution across multiple skills per training

---

## Implementation Status

✅ **Model Updated** - `Training_Calendar` schema supports `skills` array

✅ **Interface Updated** - `ITrainingCalendar` includes `skills` field

✅ **Service Updated** - `populate()` calls include `skills` field

✅ **Build Successful** - TypeScript compilation passed

✅ **Ready to Test** - Start the server and test with multiple skills

