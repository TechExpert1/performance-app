# Badges API Documentation

## Overview
The Badges API provides a comprehensive achievement system that tracks and rewards user progress across three categories:
1. **Daily Usage & Streaks** - Consecutive training days
2. **Training Consistency (Weekly)** - Consecutive weeks with 4+ training days
3. **Goal Completion** - Number of completed goals

Each category has 4 tiers: **Bronze**, **Silver**, **Gold**, and **Platinum**.

## Features
- ✅ Single unified API endpoint returning all badge categories
- ✅ Automatic badge calculation via daily cron job (runs at 2:00 AM)
- ✅ Real-time progress tracking
- ✅ Automatic badge unlocking when criteria is met

## Database Models

### Badge
Stores all available badges in the system.

```typescript
{
  name: string;              // "Bronze", "Silver", "Gold", "Platinum"
  category: string;          // "daily_usage", "training_consistency", "goal_completion"
  description: string;       // Badge description
  criteria: number;          // Unlock criteria (e.g., 3 for 3-day streak)
  icon?: string;             // Optional icon URL
  tier: string;              // "bronze", "silver", "gold", "platinum"
  createdAt: Date;
  updatedAt: Date;
}
```

### User_Badge
Tracks individual user progress toward badges.

```typescript
{
  user: ObjectId;            // Reference to User
  badge: ObjectId;           // Reference to Badge
  isUnlocked: boolean;       // Whether badge is unlocked
  currentProgress: number;   // Current progress (e.g., 2 out of 3 days)
  unlockedAt?: Date;         // When badge was unlocked
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoint

### GET /badges

Get all badges for the authenticated user organized by category, with current progress and unlock status.

**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request:**
```
GET /badges
Authorization: Bearer eyJhbGc...
```

**Response:**
```json
{
  "message": "User badges fetched successfully",
  "data": {
    "lastUpdated": "2025-11-28",
    "dailyUsageAndStreaks": {
      "currentStreak": 5,
      "maxBadges": 4,
      "unlockedBadges": 2,
      "badges": [
        {
          "_id": "673a...",
          "name": "Bronze",
          "category": "daily_usage",
          "description": "3-Day Streak - Logged training 3 days in a row",
          "criteria": 3,
          "tier": "bronze",
          "isUnlocked": true,
          "currentProgress": 5,
          "unlockedAt": "2025-11-25T10:30:00.000Z"
        },
        {
          "_id": "673b...",
          "name": "Silver",
          "category": "daily_usage",
          "description": "7-Day Streak - One week of daily activity",
          "criteria": 7,
          "tier": "silver",
          "isUnlocked": false,
          "currentProgress": 5
        },
        {
          "_id": "673c...",
          "name": "Gold",
          "category": "daily_usage",
          "description": "30-Day Streak - One full month of daily logs",
          "criteria": 30,
          "tier": "gold",
          "isUnlocked": false,
          "currentProgress": 5
        },
        {
          "_id": "673d...",
          "name": "Platinum",
          "category": "daily_usage",
          "description": "100-Day Streak - 100 consecutive training days",
          "criteria": 100,
          "tier": "platinum",
          "isUnlocked": false,
          "currentProgress": 5
        }
      ]
    },
    "trainingConsistency": {
      "currentConsecutiveWeeks": 3,
      "maxBadges": 4,
      "unlockedBadges": 1,
      "badges": [
        {
          "_id": "673e...",
          "name": "Bronze",
          "category": "training_consistency",
          "description": "2 Weeks Consistent - Trained 4+ days/week for 2 weeks",
          "criteria": 2,
          "tier": "bronze",
          "isUnlocked": true,
          "currentProgress": 3,
          "unlockedAt": "2025-11-22T08:15:00.000Z"
        },
        {
          "_id": "673f...",
          "name": "Silver",
          "category": "training_consistency",
          "description": "4 Weeks Consistent",
          "criteria": 4,
          "tier": "silver",
          "isUnlocked": false,
          "currentProgress": 3
        },
        {
          "_id": "6740...",
          "name": "Gold",
          "category": "training_consistency",
          "description": "12 Weeks Consistent",
          "criteria": 12,
          "tier": "gold",
          "isUnlocked": false,
          "currentProgress": 3
        },
        {
          "_id": "6741...",
          "name": "Platinum",
          "category": "training_consistency",
          "description": "52 Weeks Consistent - A full year of weekly training",
          "criteria": 52,
          "tier": "platinum",
          "isUnlocked": false,
          "currentProgress": 3
        }
      ]
    },
    "goalCompletion": {
      "totalGoalsCompleted": 2,
      "maxBadges": 4,
      "unlockedBadges": 1,
      "badges": [
        {
          "_id": "6742...",
          "name": "Bronze",
          "category": "goal_completion",
          "description": "First Goal Crushed",
          "criteria": 1,
          "tier": "bronze",
          "isUnlocked": true,
          "currentProgress": 2,
          "unlockedAt": "2025-11-20T14:00:00.000Z"
        },
        {
          "_id": "6743...",
          "name": "Silver",
          "category": "goal_completion",
          "description": "5 Goals Completed",
          "criteria": 5,
          "tier": "silver",
          "isUnlocked": false,
          "currentProgress": 2
        },
        {
          "_id": "6744...",
          "name": "Gold",
          "category": "goal_completion",
          "description": "10 Goals Completed",
          "criteria": 10,
          "tier": "gold",
          "isUnlocked": false,
          "currentProgress": 2
        },
        {
          "_id": "6745...",
          "name": "Platinum",
          "category": "goal_completion",
          "description": "20 Goals Completed",
          "criteria": 20,
          "tier": "platinum",
          "isUnlocked": false,
          "currentProgress": 2
        }
      ]
    }
  }
}
```

## Badge Categories & Criteria

### Daily Usage & Streaks
Tracks consecutive days of training activity.

| Tier | Criteria | Description |
|------|----------|-------------|
| Bronze | 3 days | Logged training 3 consecutive days |
| Silver | 7 days | One week of daily activity |
| Gold | 30 days | One full month of daily logs |
| Platinum | 100 days | 100 consecutive training days |

**Calculation Logic:**
- Counts unique training days from `Training_Calendar`
- Must have training today or yesterday to maintain active streak
- Calculates backwards from most recent training date

### Training Consistency (Weekly)
Tracks consecutive weeks with 4+ training days per week.

| Tier | Criteria | Description |
|------|----------|-------------|
| Bronze | 2 weeks | Trained 4+ days/week for 2 consecutive weeks |
| Silver | 4 weeks | 4 consecutive weeks of consistency |
| Gold | 12 weeks | 12 consecutive weeks of consistency |
| Platinum | 52 weeks | A full year of weekly training consistency |

**Calculation Logic:**
- Groups training sessions by week
- Counts only weeks with 4+ training days
- Must have a consistent week in current or previous week to maintain streak

### Goal Completion
Tracks total number of completed goals.

| Tier | Criteria | Description |
|------|----------|-------------|
| Bronze | 1 goal | First Goal Crushed |
| Silver | 5 goals | 5 Goals Completed |
| Gold | 10 goals | 10 Goals Completed |
| Platinum | 20 goals | 20 Goals Completed |

**Calculation Logic:**
- Counts `Attendance_Goal` records where `endDate` has passed
- Cumulative count (not streak-based)

## Automatic Badge Calculation

The system uses a cron job that runs **daily at 2:00 AM** to:
1. Initialize badges if not already created (one-time setup)
2. Calculate current metrics for all users:
   - Daily training streaks
   - Weekly consistency streaks
   - Goal completion counts
3. Update `User_Badge` records with current progress
4. Automatically unlock badges when criteria is met
5. Set `unlockedAt` timestamp when a badge is first unlocked

## Implementation Details

### Badge Initialization
On first API call or cron job run, the system automatically creates all 12 badges (3 categories × 4 tiers) in the database.

### Real-Time Calculation
When calling `GET /badges`, the API:
1. Authenticates the user via JWT token
2. Runs fresh calculations for the authenticated user
3. Updates badge progress in database
4. Returns current state with all badges organized by category

### Streak Logic
- **Daily Streak:** Broken if no training for 2+ consecutive days
- **Weekly Consistency:** Broken if last consistent week was 2+ weeks ago
- **Goal Completion:** Never decreases (cumulative)

## Testing the API

### 1. Start the Server
```bash
npm run dev
```

### 2. Call the Badges Endpoint
```bash
curl -X GET http://localhost:3000/badges \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Or using query parameter (legacy support):
```bash
curl -X GET http://localhost:3000/badges \
  -H "token: YOUR_JWT_TOKEN"
```

### 3. Expected Behavior
- First call initializes all badges automatically
- Returns user's current progress across all categories
- Shows which badges are unlocked
- Displays current progress toward locked badges

## Integration Notes

### Prerequisites
- User must have `Training_Calendar` entries to earn daily/weekly badges
- User must have `Attendance_Goal` entries to earn goal completion badges

### Cron Job Schedule
The badge calculation runs automatically every day at 2:00 AM server time. To change this schedule, modify the cron expression in `src/cronJobs/badge.ts`:

```typescript
// Current: Daily at 2:00 AM
cron.schedule("0 2 * * *", ...)

// Examples:
// Every hour: "0 * * * *"
// Every 6 hours: "0 */6 * * *"
// Daily at midnight: "0 0 * * *"
```

## Files Created

1. **Models:**
   - `src/models/Badge.ts` - Badge definitions
   - `src/models/User_Badge.ts` - User badge progress

2. **Interfaces:**
   - `src/interfaces/badge.interface.ts` - TypeScript types

3. **Services:**
   - `src/services/badge.ts` - Business logic and calculations

4. **Controllers:**
   - `src/controllers/badge.ts` - Request handlers

5. **Routes:**
   - `src/routes/badge.ts` - API routes

6. **Cron Jobs:**
   - `src/cronJobs/badge.ts` - Automated daily calculations

## Future Enhancements

Potential additions to the badge system:
- Push notifications when badges are unlocked
- Social sharing of badge achievements
- Custom user-defined badges
- Leaderboards based on badge counts
- Badge expiry/renewal for seasonal challenges
- Bonus badges for special events
