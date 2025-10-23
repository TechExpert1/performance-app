# Training Calendar Check-in & Status Update Endpoints

## 1. Check-in Request Endpoint

### Endpoint Details
- **HTTP Method:** `GET`
- **Route:** `/training-calander/:id/checkin-request`
- **Authentication:** Required (`userAuth` middleware)
- **Path Parameter:** `id` = Training Calendar ID

### Purpose
Submits a check-in request for a training session. Changes the training member's status to "pending", indicating they want to attend or have attended the training.

### Request Format
```
GET /training-calander/68931ee59584327f037cd04c/checkin-request
Authorization: Bearer <token>
```

### Query Parameters
None

### Response (Success - 201 Created)
```json
{
  "message": "Check-in request submitted",
  "data": {
    "_id": "training_member_001",
    "user": "user_001",
    "training": "68931ee59584327f037cd04c",
    "status": "pending",
    "createdAt": "2025-10-21T15:30:00.000Z",
    "updatedAt": "2025-10-21T15:30:00.000Z"
  }
}
```

### Response (Error - 401 Unauthorized)
```json
{
  "message": "Unauthorized user"
}
```

### Response (Error - 500)
```json
{
  "message": "Failed to check-in",
  "error": "Error message details"
}
```

### What It Does
- Looks up the authenticated user
- Finds or creates a Training_Member record linking the user to the training
- Sets the status to "pending" (user is requesting to attend)
- Returns the updated record

### Status Workflow
- Initial status when user is invited: `"approved"` (by gym owner/coach)
- After check-in request: `"pending"` (awaiting approval)
- After coach approval: `"approved"` or `"rejected"` (see endpoint 2)

---

## 2. Update Training Member Status Endpoint

### Endpoint Details
- **HTTP Method:** `GET` ⚠️ (Note: This should ideally be PATCH or POST, but it's implemented as GET)
- **Route:** `/training-calander/update-status/:id`
- **Authentication:** Required (`userAuth` middleware)
- **Path Parameter:** `id` = Training Member ID (NOT Training Calendar ID)
- **Query Parameter:** `status` = The new status value

### Purpose
Updates the status of a training member (approval/rejection of their check-in request). Only the coach or superAdmin can perform this action.

### Request Format
```
GET /training-calander/update-status/68932dfa16846598e4f2f9b3?status=rejected
Authorization: Bearer <token>
```

OR

```
GET /training-calander/update-status/68932dfa16846598e4f2f9b3?status=approved
Authorization: Bearer <token>
```

### Query Parameters
| Parameter | Type | Required | Values | Description |
|-----------|------|----------|--------|-------------|
| `status` | String | ✅ Yes | `"approved"`, `"rejected"` | New status for the training member |

### Response (Success - 200 OK)
```json
{
  "message": "Training status updated successfully",
  "data": {
    "_id": "68932dfa16846598e4f2f9b3",
    "user": {
      "_id": "user_001",
      "name": "John Athlete",
      "email": "john@example.com"
    },
    "training": "68931ee59584327f037cd04c",
    "status": "rejected",
    "createdAt": "2025-10-20T10:00:00.000Z",
    "updatedAt": "2025-10-21T16:00:00.000Z"
  }
}
```

### Response (Error - 401 Unauthorized)
```json
{
  "message": "Unauthorized"
}
```

### Response (Error - 403 Forbidden - Not Coach or Admin)
```json
{
  "message": "You are not authorized to update this training member status"
}
```

### Response (Error - 404 Not Found)
```json
{
  "message": "Training member not found"
}
```

### Authorization Logic
- Only the **coach** assigned to the training can approve/reject
- OR the **superAdmin** user can approve/reject any training member
- The user making the request must match the training's coach or have superAdmin role

---

## Workflow: Check-in & Approval Process

### Step 1: User Submits Check-in Request
```
GET /training-calander/68931ee59584327f037cd04c/checkin-request
Authorization: Bearer <user-token>
```
- Status changes from `"approved"` → `"pending"`
- Indicates user is ready to attend or has attended

### Step 2: Coach Approves or Rejects

#### Option A: Approve the check-in
```
GET /training-calander/update-status/68932dfa16846598e4f2f9b3?status=approved
Authorization: Bearer <coach-token>
```
- Status changes from `"pending"` → `"approved"`
- User is confirmed as attended

#### Option B: Reject the check-in
```
GET /training-calander/update-status/68932dfa16846598e4f2f9b3?status=rejected
Authorization: Bearer <coach-token>
```
- Status changes from `"pending"` → `"rejected"`
- User's attendance is not recorded

---

## How to Get the Required IDs

### Get Training Calendar ID (for check-in)
```
GET /training-calander
```
Response includes training calendar `_id`:
```json
{
  "data": [
    {
      "_id": "68931ee59584327f037cd04c",
      "trainingName": "Basketball Practice",
      ...
    }
  ]
}
```

### Get Training Member ID (for status update)
Call the check-in endpoint first, which returns the Training_Member object:
```json
{
  "data": {
    "_id": "68932dfa16846598e4f2f9b3",  // ← Use this for update-status
    "user": "user_001",
    "training": "68931ee59584327f037cd04c",
    "status": "pending"
  }
}
```

OR list all training members via the GET training calendar endpoint which populates members.

---

## Complete Example Flow

### 1. Athlete submits check-in for a training
```javascript
const trainingId = "68931ee59584327f037cd04c";

const checkInResponse = await fetch(
  `/training-calander/${trainingId}/checkin-request`,
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${athleteToken}`,
      'Content-Type': 'application/json'
    }
  }
);

const checkInData = await checkInResponse.json();
const trainingMemberId = checkInData.data._id; // Save this for step 2
// trainingMemberId = "68932dfa16846598e4f2f9b3"
```

### 2. Coach approves the check-in
```javascript
const statusUpdateResponse = await fetch(
  `/training-calander/update-status/${trainingMemberId}?status=approved`,
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${coachToken}`,
      'Content-Type': 'application/json'
    }
  }
);

const statusData = await statusUpdateResponse.json();
console.log('Status updated:', statusData.data.status); // "approved"
```

### 3. (Alternative) Coach rejects the check-in
```javascript
const rejectResponse = await fetch(
  `/training-calander/update-status/${trainingMemberId}?status=rejected`,
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${coachToken}`,
      'Content-Type': 'application/json'
    }
  }
);

const rejectData = await rejectResponse.json();
console.log('Status rejected:', rejectData.data.status); // "rejected"
```

---

## Important Notes

⚠️ **HTTP Method Issue:** Both endpoints use `GET`, but:
- Check-in request (`/:id/checkin-request`) modifies data (status update) → should be `POST`
- Status update (`/update-status/:id`) modifies data → should be `PATCH` or `POST`
- In practice, they work with `GET`, but ideally should be updated to proper REST conventions

✅ **Authentication:** Both endpoints require the user to be authenticated (`userAuth` middleware)

✅ **Authorization:** Only coaches or superAdmin can update training member status

✅ **Status Values:** Only `"approved"` and `"rejected"` are valid status values

✅ **Training Member ID:** This is different from Training Calendar ID - it's the document linking a user to a training

⚠️ **Query Parameter:** The `status` parameter must be passed as a query string, not in the request body

---

## Status Possibilities

| Status | When Set | Meaning |
|--------|----------|---------|
| `approved` | Initial creation (when invited) | User is invited and approved to attend |
| `pending` | After check-in request | User has requested to attend, awaiting coach approval |
| `approved` | After coach approval | Coach has confirmed user's attendance |
| `rejected` | After coach rejection | Coach has rejected user's check-in |

---

## Curl Examples

### Check-in Request
```bash
curl -X GET "http://localhost:3000/training-calander/68931ee59584327f037cd04c/checkin-request" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json"
```

### Approve Status
```bash
curl -X GET "http://localhost:3000/training-calander/update-status/68932dfa16846598e4f2f9b3?status=approved" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json"
```

### Reject Status
```bash
curl -X GET "http://localhost:3000/training-calander/update-status/68932dfa16846598e4f2f9b3?status=rejected" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json"
```

