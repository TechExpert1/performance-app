# Feedback Request System - Complete Implementation Guide

## Overview
The Feedback Request system allows users to request feedback from coaches or peers on their training sessions (reviews), and enables coaches/peers to provide structured feedback with ratings and comments.

## System Architecture

### Flow Diagram
```
User Creates Review with Coach/Peer IDs
        ↓
Review Service Creates Review + FeedbackRequest Records
        ↓
Coach/Peer Receives Notification
        ↓
Coach/Peer Views Feedback Request (GET /feedback-requests/received)
        ↓
Coach/Peer Submits Feedback (POST /feedback-requests/:id/submit)
        ↓
Feedback Updates Review Model
```

## Database Models

### FeedbackRequest Model
Located at: `src/models/Feedback_Request.ts`

```typescript
{
  requester: ObjectId (ref: User),        // User who created the review
  recipient: ObjectId (ref: User),        // Coach/Peer being asked for feedback
  review: ObjectId (ref: Review),         // The review being evaluated
  sport: ObjectId (ref: Sport),           // Sport type
  skills: [{
    skillId: ObjectId,
    skillModel: String                    // "Sport_Category_Skill" or "User_Sport_Category_Skill"
  }],
  status: String,                         // "pending" | "completed" | "declined"
  type: String,                           // "peer" | "coach"
  feedbackRating: Number,                 // 1-10 scale
  feedbackComment: String,                // Text feedback
  requestMessage: String,                 // Message with the request
  submittedAt: Date,                      // When feedback was submitted
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### 1. Create Feedback Request (Manual)
**Route:** `POST /feedback-requests`  
**Auth:** User (userAuth middleware)  
**Body:**
```json
{
  "recipientId": "65d4f8c9e1a2b3c4d5e6f7g8",
  "reviewId": "65d4f8c9e1a2b3c4d5e6f7g9",
  "sportId": "65d4f8c9e1a2b3c4d5e6f7ga",
  "type": "coach",
  "skills": [
    {
      "skillId": "65d4f8c9e1a2b3c4d5e6f7gb",
      "skillModel": "Sport_Category_Skill"
    }
  ],
  "requestMessage": "Please provide feedback on my session"
}
```

**Response (201):**
```json
{
  "message": "Feedback request created successfully",
  "data": {
    "_id": "65d4f8c9e1a2b3c4d5e6f7gc",
    "requester": "65d4f8c9e1a2b3c4d5e6f7g8",
    "recipient": "65d4f8c9e1a2b3c4d5e6f7gd",
    "review": "65d4f8c9e1a2b3c4d5e6f7g9",
    "sport": "65d4f8c9e1a2b3c4d5e6f7ga",
    "type": "coach",
    "status": "pending",
    "createdAt": "2025-11-03T10:30:00Z"
  }
}
```

### 2. Get Received Feedback Requests
**Route:** `GET /feedback-requests/received`  
**Auth:** User (userAuth middleware)  
**Query Params:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Response (200):**
```json
{
  "message": "Received feedback requests retrieved successfully",
  "data": [
    {
      "_id": "65d4f8c9e1a2b3c4d5e6f7gc",
      "sportType": "Basketball",
      "sportImage": "https://...",
      "memberName": "John Doe",
      "memberImage": "https://...",
      "type": "coach",
      "status": "pending",
      "skills": [
        {
          "_id": "65d4f8c9e1a2b3c4d5e6f7gb",
          "name": "Dribbling"
        }
      ],
      "createdAt": "2025-11-03T10:30:00Z",
      "requestMessage": "Please provide feedback"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

### 3. Get Sent Feedback Requests
**Route:** `GET /feedback-requests/sent`  
**Auth:** User (userAuth middleware)  
**Query Params:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Response (200):** Same structure as received, but shows requests YOU sent

### 4. Get Feedback Request Details
**Route:** `GET /feedback-requests/:id`  
**Auth:** User (userAuth middleware)  
**Authorization:** User must be requester or recipient

**Response (200):**
```json
{
  "message": "Feedback request details retrieved successfully",
  "data": {
    "_id": "65d4f8c9e1a2b3c4d5e6f7gc",
    "sportType": "Basketball",
    "sportImage": "https://...",
    "memberName": "John Doe",
    "memberImage": "https://...",
    "type": "coach",
    "status": "pending",
    "skills": [
      {
        "_id": "65d4f8c9e1a2b3c4d5e6f7gb",
        "name": "Dribbling"
      }
    ],
    "review": {
      "_id": "65d4f8c9e1a2b3c4d5e6f7g9",
      "sessionType": "Match",
      "media": ["https://..."],
      "rating": 8,
      "comment": "Great session!",
      "createdAt": "2025-11-03T09:00:00Z"
    },
    "createdAt": "2025-11-03T10:30:00Z"
  }
}
```

### 5. Submit Feedback on Request
**Route:** `POST /feedback-requests/:id/submit`  
**Auth:** User (userAuth middleware)  
**Authorization:** User must be the recipient  
**Body:**
```json
{
  "feedbackRating": 8,
  "feedbackComment": "Great technique! Work on your footwork."
}
```

**Response (200):**
```json
{
  "message": "Feedback submitted successfully",
  "data": {
    "_id": "65d4f8c9e1a2b3c4d5e6f7gc",
    "status": "completed",
    "rating": 8,
    "submittedAt": "2025-11-03T11:00:00Z"
  }
}
```

**Response (400):** Bad request
```json
{
  "status": false,
  "message": "Rating must be between 1 and 10"
}
```

**Response (403):** Forbidden
```json
{
  "status": false,
  "message": "Only the recipient can submit feedback"
}
```

## Integration with Review Creation

When a user creates a review with coach or peer feedback IDs, the system automatically:

1. **Create Review** - Normal review creation
2. **Create FeedbackRequest Records** - For each coach/peer specified:
   - Sets `requester` to review creator
   - Sets `recipient` to coach/peer ID
   - Sets `type` to "coach" or "peer"
   - Sets `status` to "pending"
3. **Create Notifications** - Notifies recipients

### Review Creation Body Example
```json
{
  "sessionType": "Match",
  "sport": "65d4f8c9e1a2b3c4d5e6f7ga",
  "skill": [
    {
      "skillId": "65d4f8c9e1a2b3c4d5e6f7gb",
      "skillModel": "Sport_Category_Skill"
    }
  ],
  "comment": "Great session with good performance",
  "coachFeedback.coach": "65d4f8c9e1a2b3c4d5e6f7gd",
  "peerFeedback.friend": "65d4f8c9e1a2b3c4d5e6f7ge"
}
```

This creates 2 FeedbackRequest records automatically.

## Feedback Submission Flow

When a recipient submits feedback:

1. **Update FeedbackRequest**:
   - Set `feedbackRating` and `feedbackComment`
   - Set `status` to "completed"
   - Set `submittedAt` timestamp

2. **Update Review Model**:
   - If type is "peer": Update `peerFeedback` object
   - If type is "coach": Update `coachFeedback` object
   - Stores feedback `rating` and `comment` permanently

3. **Return Success Response**

## Error Handling

| Status | Scenario |
|--------|----------|
| 201 | Feedback request created successfully |
| 200 | Feedback request retrieved or updated |
| 400 | Invalid input, missing required fields, already submitted |
| 403 | User not authorized to access request |
| 404 | Feedback request or review not found |
| 500 | Server error |

## Implementation Files

- **Model**: `src/models/Feedback_Request.ts`
- **Interface**: `src/interfaces/feedbackRequest.interface.ts`
- **Service**: `src/services/feedbackRequest.ts`
- **Controller**: `src/controllers/feedbackRequest.ts`
- **Routes**: `src/routes/feedbackRequest.ts`
- **Integration**: Modified `src/services/review.ts` to auto-create feedback requests
- **App**: Updated `src/index.ts` to register routes

## Testing Workflow

### Step 1: Create a Review with Coach/Peer
```bash
POST /reviews
Body: {
  "sessionType": "Match",
  "sport": "SPORT_ID",
  "coachFeedback.coach": "COACH_USER_ID",
  "peerFeedback.friend": "PEER_USER_ID"
}
```

### Step 2: Verify FeedbackRequests Were Created
```bash
GET /feedback-requests/received
# (Login as COACH_USER_ID or PEER_USER_ID)
# Should return feedback requests
```

### Step 3: View Request Details
```bash
GET /feedback-requests/REQUEST_ID
```

### Step 4: Submit Feedback
```bash
POST /feedback-requests/REQUEST_ID/submit
Body: {
  "feedbackRating": 8,
  "feedbackComment": "Good performance"
}
```

### Step 5: Verify Review Updated
```bash
GET /reviews/REVIEW_ID
# Check coachFeedback or peerFeedback object is populated
```

## Key Features

✅ **Automatic Creation** - FeedbackRequests created automatically when reviews are posted  
✅ **Pagination** - Received/Sent endpoints support page & limit  
✅ **Population** - All related data (user names, sport details, skills) populated  
✅ **Authorization** - Only requester/recipient can view request details  
✅ **Persistent Feedback** - Feedback stored in Review model permanently  
✅ **Type Safety** - Full TypeScript support with interfaces  
✅ **Error Handling** - Comprehensive error messages and status codes  
✅ **Dual Integration** - Works with auto-created requests and manual creation

