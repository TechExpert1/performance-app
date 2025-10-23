# Training Calendar GET Endpoint Query Parameters

## Endpoint
```
GET /training-calander?page=1&limit=5&month=july&year=2025
```

---

## Query Parameters

### Pagination Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Number | ❌ No | - | Page number (starts at 1) |
| `limit` | Number | ❌ No | - | Number of results per page |

### Filtering Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `month` | String | ❌ No | - | Month name (lowercase, e.g., "july") |
| `year` | Number | ❌ No | - | Year (e.g., 2025) |
| `day` | - | ❌ **NO** | - | ❌ **NOT SUPPORTED** |
| `stats` | Boolean | ❌ No | "false" | Return grouped stats (requires `user` param) |
| `user` | ObjectId | ❌ No | - | User ID (used with `stats=true`) |
| `sport` | ObjectId | ❌ No | - | Filter by sport ID |
| `category` | ObjectId | ❌ No | - | Filter by category ID |
| `skill` | ObjectId | ❌ No | - | Filter by skill ID |
| `gym` | ObjectId | ❌ No | - | Filter by gym ID |
| `trainingScope` | String | ❌ No | - | Filter by scope ("self" or "gym") |
| `sortBy` | String | ❌ No | "createdAt" | Field to sort by |
| `sortOrder` | String | ❌ No | "desc" | Sort order ("asc" or "desc") |

---

## Answer to Your Question

### ❌ NO - There is NO `day` parameter

The API supports `month` and `year` parameters to filter trainings by month, but **there is no `day` parameter** to filter by a specific day.

### Supported Months (case-insensitive)
```
january, february, march, april, may, june,
july, august, september, october, november, december
```

---

## Example Requests

### 1. Get trainings for July 2025 with pagination
```
GET /training-calander?page=1&limit=5&month=july&year=2025
```

**Response:**
```json
{
  "message": "Paginated training calendar fetched",
  "data": [
    {
      "_id": "training_001",
      "date": "2025-07-15T10:00:00Z",
      "trainingName": "Basketball Practice",
      "sport": { "_id": "sport_001", "name": "Basketball" },
      "category": { "_id": "cat_001", "name": "Offense" },
      "skill": { "_id": "skill_001", "name": "3-point shooting" },
      "user": { "_id": "user_001", "name": "Coach John" },
      "trainingScope": "gym",
      "gym": "gym_001"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalPages": 3,
    "totalResults": 15
  }
}
```

---

### 2. Get all trainings for October 2025 (no pagination)
```
GET /training-calander?month=october&year=2025
```

**Response:**
```json
{
  "message": "All training calendars fetched",
  "data": [
    {
      "_id": "training_001",
      "date": "2025-10-05T14:00:00Z",
      "trainingName": "Football Training",
      ...
    },
    {
      "_id": "training_002",
      "date": "2025-10-12T15:30:00Z",
      "trainingName": "Speed & Agility Session",
      ...
    }
  ]
}
```

---

### 3. Get trainings filtered by sport (Basketball) with pagination
```
GET /training-calander?page=1&limit=10&month=july&year=2025&sport=sport_001
```

---

### 4. Get trainings for a specific gym
```
GET /training-calander?month=july&year=2025&gym=gym_001
```

---

### 5. Get trainings scoped to "gym" only
```
GET /training-calander?month=july&year=2025&trainingScope=gym
```

---

### 6. Get user's training stats (grouped by day and week)
```
GET /training-calander?stats=true&user=user_001
```

**Response:**
```json
{
  "message": "User's grouped training calendar (month & week)",
  "data": {
    "currentMonth": {
      "1": [],
      "2": [],
      "3": [
        {
          "_id": "training_001",
          "date": "2025-10-03T10:00:00Z",
          "trainingName": "Basketball"
        }
      ],
      "4": [],
      ...
    },
    "currentWeek": {
      "3": [{ "_id": "training_001", ... }],
      "4": [],
      ...
    },
    "skillPercentages": {
      "monthly": {
        "3-point shooting": 40,
        "Dribbling": 30,
        "Defense": 30
      },
      "weekly": {
        "3-point shooting": 100,
        "Dribbling": 0,
        "Defense": 0
      }
    }
  }
}
```

---

### 7. Sort trainings by date in ascending order
```
GET /training-calander?month=july&year=2025&sortBy=date&sortOrder=asc
```

---

### 8. Filter by category and skill
```
GET /training-calander?month=july&year=2025&category=category_001&skill=skill_001
```

---

## Workaround: Filter by Specific Day

Since there's **no `day` parameter**, here are your options:

### Option 1: Filter on the Frontend
Fetch all trainings for the month and filter by day on the client side:

```javascript
// Fetch all July 2025 trainings
const response = await fetch('/training-calander?month=july&year=2025');
const allTrainings = await response.json();

// Filter for a specific day (e.g., July 15)
const specificDay = 15;
const trainingsByDay = allTrainings.data.filter(training => {
  const trainingDate = new Date(training.date);
  return trainingDate.getDate() === specificDay;
});

console.log(`Trainings for July ${specificDay}:`, trainingsByDay);
```

### Option 2: Post-Process from Stats Endpoint
Use the `stats=true` endpoint which groups trainings by day:

```javascript
const response = await fetch('/training-calander?stats=true&user=user_001');
const { data } = await response.json();

// data.currentMonth has trainings grouped by day
const day15Trainings = data.currentMonth['15']; // Get trainings for day 15
```

### Option 3: Request a Feature
If you need server-side day filtering, consider requesting an API enhancement to add `day` parameter support.

---

## Complete Parameter Combination Examples

### Get August 2025 trainings for Basketball sport, paginated
```
GET /training-calander?page=1&limit=10&month=august&year=2025&sport=sport_001
```

### Get September 2025 gym trainings sorted by date (newest first)
```
GET /training-calander?page=1&limit=20&month=september&year=2025&trainingScope=gym&sortBy=date&sortOrder=desc
```

### Get December 2025 trainings for a specific gym and category
```
GET /training-calander?month=december&year=2025&gym=gym_001&category=category_001
```

---

## Important Notes

✅ **Month Parameter:** Use lowercase month names exactly as shown (january, february, etc.)

✅ **Year Format:** Use 4-digit year (e.g., 2025)

✅ **Pagination:** If both `page` and `limit` are provided, results are paginated. Without them, all results are returned.

✅ **Stats Mode:** When `stats=true`, the endpoint returns grouped data by day/week and skill percentages (requires `user` param)

❌ **No Day Parameter:** There is no day filtering parameter available

❌ **Dynamic Filters:** Other dynamic filters (sport, category, skill, gym) can be chained in the query string

⚠️ **Date Range:** Currently only supports filtering by entire month. For specific date ranges, you'd need to implement client-side filtering after fetching the data.

---

## Mongoose Query Logic (Backend)

```typescript
// If month and year provided:
if (month && year) {
  const monthIndex = monthMap[month.toLowerCase()]; // 0-11
  const numericYear = Number(year);
  if (monthIndex !== undefined && !isNaN(numericYear)) {
    startDate = dayjs()
      .year(numericYear)
      .month(monthIndex)
      .startOf("month")
      .toDate();
    endDate = dayjs()
      .year(numericYear)
      .month(monthIndex)
      .endOf("month")
      .toDate();
    query.date = { $gte: startDate, $lte: endDate };
  }
}

// Query is executed:
TrainingCalendar.find(query).populate(...).sort(...)
```

This means the API creates a date range for the entire month and queries documents within that range. **There is no day-level filtering built into the API.**

