# Performance Challenge Graph API

## Overview

The Performance Challenge Graph API provides a **single unified endpoint** to visualize an athlete's progress over time in Performance Challenges. It follows the same design principles as the main Performance Graph but displays results from challenges rather than exercises.

### Core Features
- **Single Endpoint**: One route with query parameters for all graph-related operations
- **Category Selection**: Choose from Strength, Power, Speed, or Endurance categories
- **Challenge Pack Navigation**: Browse challenge packs within each category
- **Challenge Selection**: Select specific challenges to view graph data
- **Time Filters**: View data for 7D, 30D, 90D, or All-Time periods
- **PB Tracking**: Personal bests are automatically marked with indicators
- **Dynamic Metrics**: Y-axis adapts based on challenge type (kg, reps, time, distance, calories)

---

## Endpoint

```
GET /system-user-challenges/graph
```

**Authentication:** Required (Bearer Token)

---

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No (default: "categories") | The type of data to retrieve. One of: `categories`, `packs`, `challenges`, `data`, `my-challenges`, `overview` |
| `categoryId` | ObjectId | When type=packs | The category ID to get packs for |
| `packId` | ObjectId | When type=challenges | The pack ID to get challenges for |
| `challengeId` | ObjectId | When type=data | The challenge ID to get graph data for |
| `timeFilter` | string | No (default: "30D") | Time range for graph data: `7D`, `30D`, `90D`, or `all` |
| `category` | string | No | Filter for type=my-challenges (e.g., "Strength", "Power") |

---

## Type Options

### 1. `type=categories` (Default)

Get all performance categories with their icons and color codes.

**Request:**
```
GET /system-user-challenges/graph?type=categories
```

**Response:**
```json
{
  "message": "Performance categories fetched successfully",
  "type": "categories",
  "data": [
    {
      "_id": "64abc123...",
      "name": "Strength",
      "image": "https://s3.../strength-icon.png",
      "color": "#FF0000",
      "direction": "up"
    },
    {
      "_id": "64abc124...",
      "name": "Power",
      "image": "https://s3.../power-icon.png",
      "color": "#FFA500",
      "direction": "up"
    },
    {
      "_id": "64abc125...",
      "name": "Speed",
      "image": "https://s3.../speed-icon.png",
      "color": "#0000FF",
      "direction": "down"
    },
    {
      "_id": "64abc126...",
      "name": "Endurance",
      "image": "https://s3.../endurance-icon.png",
      "color": "#00FF00",
      "direction": "up"
    }
  ]
}
```

**Color Scheme:**
| Category | Color | Hex Code |
|----------|-------|----------|
| Strength | Red | #FF0000 |
| Power | Orange | #FFA500 |
| Speed | Blue | #0000FF |
| Endurance | Green | #00FF00 |

---

### 2. `type=packs`

Get challenge packs for a specific category.

**Request:**
```
GET /system-user-challenges/graph?type=packs&categoryId=64abc124...
```

**Response:**
```json
{
  "message": "Challenge packs fetched successfully",
  "type": "packs",
  "categoryId": "64abc124...",
  "data": [
    {
      "_id": "64def123...",
      "name": "Barbell Power Pack",
      "image": "https://s3.../barbell-pack.png",
      "category": {
        "_id": "64abc124...",
        "name": "Power"
      }
    },
    {
      "_id": "64def124...",
      "name": "Olympic Lifting Pack",
      "image": "https://s3.../olympic-pack.png",
      "category": {
        "_id": "64abc124...",
        "name": "Power"
      }
    }
  ]
}
```

---

### 3. `type=challenges`

Get all challenges within a specific pack.

**Request:**
```
GET /system-user-challenges/graph?type=challenges&packId=64def123...
```

**Response:**
```json
{
  "message": "Challenges fetched successfully",
  "type": "challenges",
  "packId": "64def123...",
  "data": [
    {
      "_id": "64ghi123...",
      "title": "Power Clean Max",
      "description": "Lift the maximum weight for 1 rep",
      "levels": [
        { "badge": "Bronze", "value": "60" },
        { "badge": "Silver", "value": "80" },
        { "badge": "Gold", "value": "100" },
        { "badge": "Platinum", "value": "120" }
      ],
      "category": { "_id": "64abc124...", "name": "Power" },
      "format": { "_id": "64fmt123...", "name": "Max Weight" },
      "categoryType": { "_id": "64def123...", "name": "Barbell Power Pack" }
    }
  ]
}
```

---

### 4. `type=data`

Get graph data for a specific challenge with time filtering.

**Request:**
```
GET /system-user-challenges/graph?type=data&challengeId=64ghi123...&timeFilter=30D
```

**Response:**
```json
{
  "message": "Challenge graph data fetched successfully",
  "type": "data",
  "data": {
    "challenge": {
      "_id": "64ghi123...",
      "title": "Power Clean Max",
      "description": "Lift the maximum weight for 1 rep",
      "category": { "_id": "64abc124...", "name": "Power" },
      "format": { "_id": "64fmt123...", "name": "Max Weight" },
      "categoryType": { "_id": "64def123...", "name": "Barbell Power Pack" },
      "levels": [
        { "badge": "Bronze", "value": "60" },
        { "badge": "Silver", "value": "80" },
        { "badge": "Gold", "value": "100" },
        { "badge": "Platinum", "value": "120" }
      ]
    },
    "graphConfig": {
      "categoryName": "Power",
      "categoryColor": "#FFA500",
      "direction": "up",
      "xAxisLabel": "Date",
      "yAxisLabel": "Max Weight",
      "unit": "kg"
    },
    "timeFilter": "30D",
    "dataPoints": [
      {
        "date": "2025-10-15T10:30:00.000Z",
        "dateFormatted": "15 Oct 2025",
        "value": 95,
        "displayValue": "95 kg",
        "unit": "kg",
        "level": "Silver",
        "badge": "Silver",
        "isPB": false,
        "challengeName": "Power Clean Max",
        "tooltip": {
          "challengeName": "Power Clean Max",
          "result": "95 kg",
          "level": "Silver",
          "date": "15 Oct 2025"
        }
      },
      {
        "date": "2025-11-05T14:45:00.000Z",
        "dateFormatted": "05 Nov 2025",
        "value": 110,
        "displayValue": "110 kg",
        "unit": "kg",
        "level": "Platinum",
        "badge": "Platinum",
        "isPB": true,
        "challengeName": "Power Clean Max",
        "tooltip": {
          "challengeName": "Power Clean Max",
          "result": "110 kg",
          "level": "Platinum",
          "date": "05 Nov 2025"
        }
      }
    ],
    "summary": {
      "totalAttempts": 2,
      "personalBest": 110,
      "personalBestDisplay": "110 kg",
      "personalBestDate": "05 Nov 2025",
      "personalBestLevel": "Platinum",
      "average": 102.5,
      "latestAttempt": { ... }
    }
  }
}
```

---

### 5. `type=my-challenges`

Get all challenges the authenticated user has attempted.

**Request:**
```
GET /system-user-challenges/graph?type=my-challenges
GET /system-user-challenges/graph?type=my-challenges&category=Strength
```

**Response:**
```json
{
  "message": "User attempted challenges fetched successfully",
  "type": "my-challenges",
  "category": "Strength",
  "data": [
    {
      "challenge": {
        "_id": "64ghi124...",
        "title": "Back Squat Max Reps @ Bodyweight",
        "description": "Maximum reps at bodyweight",
        "category": { "_id": "64abc123...", "name": "Strength" },
        "format": { "_id": "64fmt124...", "name": "Max Reps" },
        "categoryType": { "_id": "64def125...", "name": "Classic Strength Pack" }
      },
      "attemptCount": 3,
      "lastAttempt": "2025-11-02T09:00:00.000Z",
      "lastAttemptFormatted": "02 Nov 2025"
    }
  ]
}
```

---

### 6. `type=overview`

Get complete category → pack → challenge hierarchy in a single request.

**Request:**
```
GET /system-user-challenges/graph?type=overview
```

**Response:**
```json
{
  "message": "Graph overview fetched successfully",
  "type": "overview",
  "data": [
    {
      "_id": "64abc123...",
      "name": "Strength",
      "image": "https://s3.../strength-icon.png",
      "color": "#FF0000",
      "direction": "up",
      "packs": [
        {
          "_id": "64def125...",
          "name": "Classic Strength Pack",
          "image": "https://s3.../classic-pack.png",
          "challenges": [
            {
              "_id": "64ghi124...",
              "title": "Back Squat Max Reps @ Bodyweight",
              "description": "Maximum reps at bodyweight",
              "format": { "_id": "64fmt124...", "name": "Max Reps" },
              "levels": [...],
              "attemptCount": 3,
              "hasAttempts": true
            }
          ],
          "totalChallenges": 5,
          "attemptedChallenges": 3
        }
      ],
      "totalPacks": 2,
      "totalChallenges": 10,
      "attemptedChallenges": 5
    },
    ...
  ]
}
```

---

## Example Usage Flows

### Flow 1: Step-by-Step Navigation

```
1. GET /system-user-challenges/graph?type=categories
   → Select "Power" (id: 64abc124...)

2. GET /system-user-challenges/graph?type=packs&categoryId=64abc124...
   → Select "Barbell Power Pack" (id: 64def123...)

3. GET /system-user-challenges/graph?type=challenges&packId=64def123...
   → Select "Power Clean Max" (id: 64ghi123...)

4. GET /system-user-challenges/graph?type=data&challengeId=64ghi123...&timeFilter=30D
   → Display line graph with data points
```

### Flow 2: Quick Access via Overview

```
1. GET /system-user-challenges/graph?type=overview
   → Navigate through nested structure to select challenge

2. GET /system-user-challenges/graph?type=data&challengeId={id}&timeFilter=7D
   → Display graph
```

### Flow 3: User's Previously Attempted Challenges

```
1. GET /system-user-challenges/graph?type=my-challenges&category=Strength
   → Shows challenges user has logged results for

2. GET /system-user-challenges/graph?type=data&challengeId={id}&timeFilter=all
   → Display all-time graph
```

---

## Metric Display by Category

| Category | Challenge Format | Y-Axis Metric | Graph Direction | Tooltip Example |
|----------|-----------------|---------------|-----------------|-----------------|
| Strength | Max Weight / Max Reps / Reps in Set Time | kg / Reps | Upwards (↑ = better) | 02 Nov – Back Squat @ BW – 18 Reps (Gold) |
| Power | Max Weight / Max Reps in 1 Minute | kg / Reps | Upwards (↑ = better) | 05 Nov – Power Clean – 110 kg (Platinum) |
| Speed | Fastest Time for Set Distance | Seconds | Downwards (↓ = faster) | 30 Oct – 40 m Sprint – 5.05 s (Gold) |
| Endurance | Fastest Time / Max Distance / Max Calories | Time / Distance / Calories | Up or Down depending on format | 03 Nov – 20 min Row – 5.3 km (Silver) |

---

## Error Responses

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 | Unauthorized | User not authenticated |
| 422 | categoryId is required when type=packs | Missing required categoryId |
| 422 | packId is required when type=challenges | Missing required packId |
| 422 | challengeId is required when type=data | Missing required challengeId |
| 422 | Invalid category ID | The provided category ID format is invalid |
| 422 | Invalid pack ID | The provided pack ID format is invalid |
| 422 | Invalid challenge ID | The provided challenge ID format is invalid |
| 422 | Challenge not found | The specified challenge does not exist |
| 422 | Invalid type | Must be one of: categories, packs, challenges, data, my-challenges, overview |

---

## Frontend Implementation Notes

### Graph Type
- Line Graph with connected data points

### Axis Configuration
- **X-Axis**: Date of completion (adapts to selected time filter)
- **Y-Axis**: Performance metric (adapts to challenge type)

### PB Indicators
- Display a star icon (⭐) on data points marked with `isPB: true`
- Highlight the PB data point in the category color

### Tooltips
When hovering/tapping a data point, display:
```
{challengeName}
• Result: {result}
• Level: {level}
• Date: {date}
```

### Time Filter UI
- Provide toggle buttons: **7D | 30D | 90D | All-Time**
- Default to 30D

---

## Summary

The Performance Challenge Graph API enables athletes to:

1. ✅ Track improvement over time in individual challenges
2. ✅ Visualize PB progress across the four core performance domains
3. ✅ Maintain consistency with the layout and logic of the main Performance Graph
4. ✅ Easily identify trends, peaks, and areas for improvement
5. ✅ Switch between different time filters (7D, 30D, 90D, All-Time)
6. ✅ View tooltips with result, level achieved, and date for each data point
