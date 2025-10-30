# Complete Journal GET Request Sample

## Full URL with All Filters

```
http://localhost:3000/journals?sport=607f1f77bcf86cd799439011&sessionType=2%20Handed%20Pickup&matchType=Competitive&category=607f1f77bcf86cd799439012&skill=607f1f77bcf86cd799439013&startDate=2024-01-01T00:00:00Z&endDate=2024-12-31T23:59:59Z&minReviewScore=7&maxReviewScore=10&page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

---

## Postman Request Format

### Method
```
GET
```

### URL
```
http://localhost:3000/journals
```

### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZmY4YzA1NzY5ZTcwMDAxMjM0NTY3OCIsImlhdCI6MTY5NDEyMzQ1NywiZXhwIjoxNjk0NzI4MjU3fQ.abc123...
Content-Type: application/json
```

### Query Parameters

| Key | Value | Description |
|-----|-------|-------------|
| `sport` | `607f1f77bcf86cd799439011` | Yoga sport ID |
| `sessionType` | `2 Handed Pickup` | Session type name |
| `matchType` | `Competitive` | Match type |
| `category` | `607f1f77bcf86cd799439012` | Beginner category ID |
| `skill` | `607f1f77bcf86cd799439013` | Core Strength skill ID |
| `startDate` | `2024-01-01T00:00:00Z` | From January 1, 2024 |
| `endDate` | `2024-12-31T23:59:59Z` | To December 31, 2024 |
| `minReviewScore` | `7` | Minimum rating 7 |
| `maxReviewScore` | `10` | Maximum rating 10 |
| `page` | `1` | First page |
| `limit` | `10` | 10 items per page |
| `sortBy` | `createdAt` | Sort by creation date |
| `sortOrder` | `desc` | Most recent first |

---

## Complete cURL Command

```bash
curl -X GET "http://localhost:3000/journals?sport=607f1f77bcf86cd799439011&sessionType=2%20Handed%20Pickup&matchType=Competitive&category=607f1f77bcf86cd799439012&skill=607f1f77bcf86cd799439013&startDate=2024-01-01T00:00:00Z&endDate=2024-12-31T23:59:59Z&minReviewScore=7&maxReviewScore=10&page=1&limit=10&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Expected Response (200 OK)

```json
{
  "message": "Journals retrieved successfully",
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "date": "2024-06-15T10:30:00.000Z",
      "sport": {
        "_id": "607f1f77bcf86cd799439011",
        "name": "Yoga",
        "image": "https://s3.amazonaws.com/bucket/yoga.jpg"
      },
      "sessionType": "2 Handed Pickup",
      "matchType": "Competitive",
      "matchResult": "Win",
      "opponent": "Sarah Johnson",
      "clubOrTeam": "Downtown Yoga Studio",
      "category": {
        "_id": "607f1f77bcf86cd799439012",
        "name": "Beginner"
      },
      "skills": [
        {
          "_id": "607f1f77bcf86cd799439013",
          "name": "Core Strength"
        },
        {
          "_id": "607f1f77bcf86cd799439014",
          "name": "Flexibility"
        }
      ],
      "personalFeedback": {
        "rating": 9,
        "text": "Had an amazing session today! Really felt the burn in my core and my flexibility improved a lot. Can't wait for the next class."
      },
      "peerFeedback": {
        "rating": 8,
        "text": "You were great in class! Your form was really good, especially in the downward dog position. We should practice together more often!",
        "friend": {
          "_id": "64ff8c0576e9700012345670",
          "name": "Emily Chen",
          "email": "emily.chen@example.com",
          "profilePicture": "https://s3.amazonaws.com/bucket/emily-profile.jpg"
        }
      },
      "coachFeedback": {
        "rating": 7,
        "text": "Good improvement on your breathing technique. Try to engage your core more during transitions. Next time, focus on the vinyasa flow - you have good potential!",
        "coach": {
          "_id": "64ff8c0576e9700012345671",
          "name": "Michael Rodriguez",
          "email": "coach.michael@example.com",
          "profilePicture": "https://s3.amazonaws.com/bucket/coach-michael.jpg"
        }
      },
      "media": [
        "https://s3.amazonaws.com/bucket/yoga-session-video.mp4",
        "https://s3.amazonaws.com/bucket/yoga-session-photo1.jpg",
        "https://s3.amazonaws.com/bucket/yoga-session-photo2.jpg"
      ],
      "videoUrl": "https://s3.amazonaws.com/bucket/yoga-session-video.mp4",
      "reviewScore": 8.0,
      "isPublic": true,
      "user": {
        "_id": "64ff8c0576e9700012345672",
        "name": "John Mitchell",
        "email": "john.mitchell@example.com",
        "profilePicture": "https://s3.amazonaws.com/bucket/john-profile.jpg"
      },
      "createdAt": "2024-06-15T10:30:00.000Z",
      "updatedAt": "2024-06-16T14:22:15.000Z"
    },
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "date": "2024-05-20T14:45:00.000Z",
      "sport": {
        "_id": "607f1f77bcf86cd799439011",
        "name": "Yoga",
        "image": "https://s3.amazonaws.com/bucket/yoga.jpg"
      },
      "sessionType": "2 Handed Pickup",
      "matchType": "Competitive",
      "matchResult": "Draw",
      "opponent": "Marcus Thompson",
      "clubOrTeam": "Wellness Center",
      "category": {
        "_id": "607f1f77bcf86cd799439012",
        "name": "Beginner"
      },
      "skills": [
        {
          "_id": "607f1f77bcf86cd799439013",
          "name": "Core Strength"
        }
      ],
      "personalFeedback": {
        "rating": 8,
        "text": "Solid performance today. Maintained good balance throughout the session. Need to work on hold duration."
      },
      "peerFeedback": {
        "rating": 9,
        "text": "Impressive strength today! You held the poses much longer than last week.",
        "friend": {
          "_id": "64ff8c0576e9700012345673",
          "name": "Lisa Wang",
          "email": "lisa.wang@example.com",
          "profilePicture": "https://s3.amazonaws.com/bucket/lisa-profile.jpg"
        }
      },
      "coachFeedback": {
        "rating": 7,
        "text": "Nice progress on core engagement. Remember to maintain steady breathing in challenging poses.",
        "coach": {
          "_id": "64ff8c0576e9700012345671",
          "name": "Michael Rodriguez",
          "email": "coach.michael@example.com",
          "profilePicture": "https://s3.amazonaws.com/bucket/coach-michael.jpg"
        }
      },
      "media": [
        "https://s3.amazonaws.com/bucket/yoga-session-video2.mp4"
      ],
      "videoUrl": "https://s3.amazonaws.com/bucket/yoga-session-video2.mp4",
      "reviewScore": 8.0,
      "isPublic": true,
      "user": {
        "_id": "64ff8c0576e9700012345672",
        "name": "John Mitchell",
        "email": "john.mitchell@example.com",
        "profilePicture": "https://s3.amazonaws.com/bucket/john-profile.jpg"
      },
      "createdAt": "2024-05-20T14:45:00.000Z",
      "updatedAt": "2024-05-21T09:15:30.000Z"
    },
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "date": "2024-04-10T08:00:00.000Z",
      "sport": {
        "_id": "607f1f77bcf86cd799439011",
        "name": "Yoga",
        "image": "https://s3.amazonaws.com/bucket/yoga.jpg"
      },
      "sessionType": "2 Handed Pickup",
      "matchType": "Competitive",
      "matchResult": "Loss",
      "opponent": "David Park",
      "clubOrTeam": "Fitness First",
      "category": {
        "_id": "607f1f77bcf86cd799439012",
        "name": "Beginner"
      },
      "skills": [
        {
          "_id": "607f1f77bcf86cd799439013",
          "name": "Core Strength"
        },
        {
          "_id": "607f1f77bcf86cd799439014",
          "name": "Flexibility"
        }
      ],
      "personalFeedback": {
        "rating": 7,
        "text": "Challenging session today. Opponent was very skilled. Good learning experience though. Felt a bit tired but pushed through."
      },
      "peerFeedback": null,
      "coachFeedback": {
        "rating": 7,
        "text": "You gave it a good effort. Study your opponent's technique - notice how they transitioned smoothly? Practice that.",
        "coach": {
          "_id": "64ff8c0576e9700012345671",
          "name": "Michael Rodriguez",
          "email": "coach.michael@example.com",
          "profilePicture": "https://s3.amazonaws.com/bucket/coach-michael.jpg"
        }
      },
      "media": [],
      "videoUrl": null,
      "reviewScore": 7.0,
      "isPublic": true,
      "user": {
        "_id": "64ff8c0576e9700012345672",
        "name": "John Mitchell",
        "email": "john.mitchell@example.com",
        "profilePicture": "https://s3.amazonaws.com/bucket/john-profile.jpg"
      },
      "createdAt": "2024-04-10T08:00:00.000Z",
      "updatedAt": "2024-04-10T16:45:20.000Z"
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## Response Field Breakdown

### Top Level
- `message` - Status message
- `data` - Array of journal entries
- `pagination` - Pagination metadata

### Each Journal Entry Contains:
- **Basic Info**
  - `_id` - Journal unique identifier
  - `date` - Session date/time (ISO format)
  - `createdAt` - When journal was created
  - `updatedAt` - Last update time

- **Sport & Session Details**
  - `sport` - Sport object with name and image
  - `sessionType` - Type of session (e.g., "2 Handed Pickup")
  - `matchType` - Type of match (e.g., "Competitive")
  - `matchResult` - Result (Win/Loss/Draw)
  - `opponent` - Opponent name
  - `clubOrTeam` - Team/club name

- **Categories & Skills**
  - `category` - Category object with ID and name
  - `skills` - Array of skill objects with ID and name

- **Feedback (3 Types)**
  - `personalFeedback` - Your rating (0-10) and comments
  - `peerFeedback` - Peer's rating, comment, and profile (can be null)
  - `coachFeedback` - Coach's rating, comment, and profile (can be null)

- **Media & Score**
  - `media` - Array of video/image URLs
  - `videoUrl` - First video URL (convenience field)
  - `reviewScore` - Average of all available ratings

- **Visibility & User**
  - `isPublic` - Public/private flag
  - `user` - User profile with name, email, picture

---

## Different Filter Combinations

### 1. Only Sport Filter
```
http://localhost:3000/journals?sport=607f1f77bcf86cd799439011&page=1&limit=10
```

### 2. Sport + Date Range
```
http://localhost:3000/journals?sport=607f1f77bcf86cd799439011&startDate=2024-01-01T00:00:00Z&endDate=2024-06-30T23:59:59Z&page=1&limit=10
```

### 3. Score Range Only
```
http://localhost:3000/journals?minReviewScore=8&maxReviewScore=10&page=1&limit=10
```

### 4. Session Type + Match Type
```
http://localhost:3000/journals?sessionType=2%20Handed%20Pickup&matchType=Competitive&page=1&limit=10
```

### 5. Category + Skills
```
http://localhost:3000/journals?category=607f1f77bcf86cd799439012&skill=607f1f77bcf86cd799439013&page=1&limit=10
```

### 6. Recent Sessions Only (Last 30 Days)
```
http://localhost:3000/journals?startDate=2024-08-31T00:00:00Z&endDate=2024-09-30T23:59:59Z&page=1&limit=10
```

### 7. High-Rated Sessions Only
```
http://localhost:3000/journals?minReviewScore=8&page=1&limit=10
```

### 8. Sort Oldest First
```
http://localhost:3000/journals?sortBy=createdAt&sortOrder=asc&page=1&limit=10
```

### 9. View Another User's Journals
```
http://localhost:3000/journals?userId=64ff8c0576e9700012345672&page=1&limit=10
```

### 10. Get 50 Items Per Page
```
http://localhost:3000/journals?page=1&limit=50&sortBy=createdAt&sortOrder=desc
```

---

## Key Points to Remember

✅ **Authentication Required** - Always include Bearer token in Authorization header
✅ **Pagination** - Default is page 1, limit 10
✅ **Date Format** - Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
✅ **URL Encoding** - Spaces are %20, colons are :
✅ **All Ratings** - 1-10 scale across all feedback types
✅ **Review Score** - Average of personal, peer, and coach ratings (whichever are provided)
✅ **Null Values** - Peer/Coach feedback can be null if not provided
✅ **User Privacy** - Only own journals shown by default, or public journals if userId provided

---

## Testing Steps

1. **Get your token** - Login first
2. **Get dropdown options** - Call `/dropdowns/journals-filters`
3. **Copy real IDs** - Use actual sport/category/skill IDs
4. **Build URL** - Replace placeholder IDs
5. **Add Bearer token** - In Authorization header
6. **Send request** - Test in Postman or cURL
7. **Verify response** - Check pagination and data fields
