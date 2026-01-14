# Feedback Graph Data Format Update

## Summary
Updated the `/feedback-requests/graph` endpoint to return data in a standardized format compatible with chart libraries, with automatic daily averaging for multiple datapoints.

## Changes Made

### 1. Data Format Structure
The endpoint now returns data points with the following structure:
```typescript
{
  value: number,           // Main value for the graph (personalFeedback or peerFeedback)
  date: string,           // Formatted date (e.g., "1 Apr 2022")
  label?: string,         // Optional label for X-axis (added every 10th day)
  labelTextStyle?: {      // Optional styling for labels
    color: string,
    width: number
  },
  personalFeedback: number | null,
  peerFeedback: number | null,
  peerFeedbackCount: number,
  details: {
    matchType?: string,
    matchResult?: string,
    duration?: string,
    notes?: string,
    hasMedia: boolean
  }
}
```

### 2. Daily Averaging
- **Multiple datapoints per day** are now automatically averaged
- Groups all reviews by date (YYYY-MM-DD format)
- Calculates average `personalFeedback` and `peerFeedback` for each day
- Returns one datapoint per day instead of multiple entries

### 3. Label Generation
- Labels are automatically added every 10th datapoint
- Format: "10 Apr", "20 Apr", "30 Apr"
- Styled with lightgray color and 60px width

### 4. Value Priority
The `value` field is populated with:
1. Personal feedback average (if available)
2. Peer feedback average (if personal not available)
3. 0 (if neither available)

## Example Response

```json
{
  "message": "Feedback graph data fetched successfully",
  "data": {
    "sportId": "12345",
    "sessionType": "Skill Practice",
    "timeFilter": "30D",
    "summary": {
      "totalSessions": 30,
      "personalFeedback": {
        "count": 28,
        "average": 7.2,
        "best": 10
      },
      "peerFeedback": {
        "count": 25,
        "average": 6.8,
        "best": 9.5
      }
    },
    "dataPoints": [
      {
        "value": 160,
        "date": "1 Apr 2022",
        "personalFeedback": 160,
        "peerFeedback": 155,
        "peerFeedbackCount": 2,
        "details": {
          "matchType": "Skill Practice",
          "duration": "1 hour",
          "hasMedia": false
        }
      },
      {
        "value": 240,
        "date": "10 Apr 2022",
        "label": "10 Apr",
        "labelTextStyle": {
          "color": "lightgray",
          "width": 60
        },
        "personalFeedback": 240,
        "peerFeedback": 235,
        "peerFeedbackCount": 3,
        "details": {
          "matchType": "No-Gi Competition",
          "matchResult": "Win",
          "duration": "5:00",
          "hasMedia": true
        }
      }
    ]
  }
}
```

## Mock Data
Mock data has been updated to generate 30 days of sample data with:
- Random values between 140 and 390
- Labels every 10 days
- Varied match types, results, and details
- Proper averaging logic

## Endpoint Details
- **URL**: `{{baseUrl}}/feedback-requests/graph`
- **Method**: GET
- **Query Parameters**:
  - `sportId` (required)
  - `sessionType` (optional, default: "skill")
  - `timeFilter` (optional, default: "7D")
  - `mock` (optional, use "true" for mock data)

## Benefits
1. ✅ Compatible with charting libraries expecting `value` and `date` fields
2. ✅ Automatic daily averaging prevents duplicate X-axis labels
3. ✅ Periodic labels improve chart readability
4. ✅ Maintains backward compatibility with additional fields
5. ✅ Consistent data structure for both real and mock data
