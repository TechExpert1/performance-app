# PRYMO – Match Type Logging API

## Overview

This document describes the API for logging match/sparring sessions for **BJJ (Brazilian Jiu-Jitsu)** and **Boxing** sports.

## Endpoint

**POST** `/reviews`  
**PATCH** `/reviews/:id`

## Flow Structure

```
Tap "+" → Log Match → Select Sport → Select Match Type
```

---

## 1. BJJ COMPETITION

### Required Fields

| Field | Type | Description | Values |
|-------|------|-------------|--------|
| `sessionType` | string | Session type | `"Match Type"` |
| `sport` | ObjectId | Sport ID | BJJ sport ID |
| `matchType` | string | Type of match | `"Competition"` |
| `matchResult` | string | Result | `"Win"`, `"Loss"`, `"Draw"` |
| `methodOfVictory` | string | How victory was achieved | `"Submission"`, `"Points"`, `"Advantage"`, `"Referee Decision"`, `"Opponent Disqualified"` |
| `opponent` | string | Opponent name | Manual text entry |

### Conditional Fields

#### If `methodOfVictory` = "Submission"
| Field | Type | Description | Values |
|-------|------|-------------|--------|
| `submissionUsed` | string | Submission technique | `"Armbar"`, `"Triangle Choke"`, `"Rear Naked Choke"`, `"Guillotine"`, `"Kimura"`, `"Americana"`, `"Ankle Lock"`, `"Kneebar"`, `"Wrist Lock"`, `"Toe Hold"`, `"Bow and Arrow Choke"`, `"North-South Choke"`, `"Ezekiel Choke"`, `"Calf Slicer"`, `"Other"` |
| `submissionCustom` | string | Custom submission (if Other) | Manual text entry |

#### If `methodOfVictory` = "Points" or "Advantage"
| Field | Type | Description | Range |
|-------|------|-------------|-------|
| `yourScore` | number | Your points | 0-50 |
| `opponentScore` | number | Opponent points | 0-50 |

### Optional Fields

| Field | Type | Description | Values |
|-------|------|-------------|--------|
| `matchDuration` | string | Match duration | `"5 min"`, `"6 min"`, `"7 min"`, `"8 min"`, `"10 min"`, `"Other"` |
| `matchDurationCustom` | number | Custom duration in minutes (if Other) | Number |
| `giNoGi` | string | Gi or No-Gi | `"Gi"`, `"No-Gi"` |
| `beltDivision` | string | Belt division | `"White"`, `"Blue"`, `"Purple"`, `"Brown"`, `"Black"` |
| `bjjWeightClass` | string | Weight class | `"Rooster (<57.5kg)"`, `"Light Feather (<64kg)"`, `"Feather (<70kg)"`, `"Light (<76kg)"`, `"Middle (<82.3kg)"`, `"Medium-Heavy (<88.3kg)"`, `"Heavy (<94.3kg)"`, `"Super Heavy (<100.5kg)"`, `"Ultra Heavy (>100.5kg)"` |
| `videoUrl` | string | Video upload (30 sec max) | URL |
| `notes` | string | Notes/Reflection | Text |
| `rating` | number | Performance rating | 1-10 |

---

## 2. BJJ ROLL / SPARRING

### Required Fields

| Field | Type | Description | Values |
|-------|------|-------------|--------|
| `sessionType` | string | Session type | `"Match Type"` |
| `sport` | ObjectId | Sport ID | BJJ sport ID |
| `matchType` | string | Type of match | `"Roll/Sparring"` or `"Roll / Sparring"` |
| `matchResult` | string | Result | `"Win"`, `"Loss"`, `"Draw"` |
| `methodOfVictory` | string | How victory was achieved | `"Submission"`, `"Points"`, `"No Result / Flow Roll"` |

### Conditional Fields

#### If `methodOfVictory` = "Submission"
| Field | Type | Description | Values |
|-------|------|-------------|--------|
| `submissionUsed` | string | Submission technique | Same as Competition list |
| `submissionCustom` | string | Custom submission (if Other) | Manual text entry |

#### If `methodOfVictory` = "Points"
| Field | Type | Description | Range |
|-------|------|-------------|-------|
| `yourScore` | number | Your points | 0-50 (scroll selector) |
| `opponentScore` | number | Opponent points | 0-50 (scroll selector) |

### Tag Opponent Feature

| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| `tagFriend` | ObjectId | Tagged opponent (gym member) | Creates mirrored entry for opponent with flipped result and score |

**Note:** When a user tags an opponent:
- A mirrored entry is automatically created for the opponent
- The result is flipped (Win ↔ Loss, Draw stays Draw)
- Scores are swapped
- Opponent can add their own reflection but cannot edit the result

### Optional Fields

| Field | Type | Description | Values |
|-------|------|-------------|--------|
| `rollDuration` | string | Roll duration | `"3 min"`, `"5 min"`, `"6 min"`, `"8 min"`, `"Other"` |
| `rollDurationCustom` | number | Custom duration in minutes (if Other) | Number |
| `giNoGi` | string | Gi or No-Gi | `"Gi"`, `"No-Gi"` |
| `videoUrl` | string | Video upload (30 sec max) | URL |
| `notes` | string | Notes/Reflection | Text |

---

## 3. BOXING COMPETITION

### Required Fields

| Field | Type | Description | Values |
|-------|------|-------------|--------|
| `sessionType` | string | Session type | `"Match Type"` |
| `sport` | ObjectId | Sport ID | Boxing sport ID |
| `matchType` | string | Type of match | `"Competition"` |
| `opponent` | string | Opponent name | Manual text entry |
| `eventName` | string | Event name | Manual text entry |
| `matchResult` | string | Result | `"Win"`, `"Loss"`, `"Draw"` |
| `boxingVictoryMethod` | string | Victory method | `"KO"`, `"TKO"`, `"Points Decision"`, `"Referee Stoppage"`, `"Corner Stoppage"`, `"Opponent Disqualified"` |

### Conditional Fields

#### If `boxingVictoryMethod` = "Points Decision"
| Field | Type | Description | Values |
|-------|------|-------------|--------|
| `decisionType` | string | Decision type | `"Unanimous"`, `"Split"`, `"Majority"`, `"Other"` |
| `roundsFought` | number | Rounds fought | 1-12 |

#### If `boxingVictoryMethod` = "KO" or "TKO"
| Field | Type | Description | Range |
|-------|------|-------------|-------|
| `roundOfStoppage` | number | Round of stoppage | 1-12 |
| `timeOfStoppageMinutes` | number | Minutes | 0-3 |
| `timeOfStoppageSeconds` | number | Seconds | 0-59 |

### Optional Fields

| Field | Type | Description | Values |
|-------|------|-------------|--------|
| `boxingWeightClass` | string | Weight class | `"Minimumweight"`, `"Light Flyweight"`, `"Flyweight"`, `"Super Flyweight"`, `"Bantamweight"`, `"Super Bantamweight"`, `"Featherweight"`, `"Super Featherweight"`, `"Lightweight"`, `"Super Lightweight"`, `"Welterweight"`, `"Super Welterweight"`, `"Middleweight"`, `"Super Middleweight"`, `"Light Heavyweight"`, `"Cruiserweight"`, `"Heavyweight"`, `"Super Heavyweight"` |
| `rating` | number | Performance rating | 1-10 |
| `requestPeerFeedback` | boolean | Request peer feedback | Auto-ON if teammate tagged |
| `requestCoachReview` | boolean | Request coach review | true/false |
| `coachToReview` | ObjectId | Coach to review | Coach user ID |
| `videoUrl` | string | Video upload (30 sec max) | URL |
| `notes` | string | Notes/Reflection | Text |

---

## 4. BOXING SPARRING

### Required Fields

| Field | Type | Description | Values |
|-------|------|-------------|--------|
| `sessionType` | string | Session type | `"Match Type"` |
| `sport` | ObjectId | Sport ID | Boxing sport ID |
| `matchType` | string | Type of match | `"Sparring"` |
| `opponent` | string | Opponent name | Tag teammate or manual entry |
| `roundsSparred` | number | Rounds sparred | 1-12 |
| `timePerRound` | string | Time per round | `"1 min"`, `"2 min"`, `"3 min"`, `"4 min"`, `"5 min"`, `"Other"` |

### Conditional Fields

| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| `timePerRoundCustom` | number | Custom time per round (if Other) | In minutes |
| `gymName` | string | Gym name | Auto-filled if opponent is tagged |

### Optional Fields

| Field | Type | Description | Values |
|-------|------|-------------|--------|
| `boxingWeightClass` | string | Weight class (optional) | Same as Competition list |
| `rating` | number | Performance rating | 1-10 |
| `videoUrl` | string | Video upload (30 sec max) | URL |
| `notes` | string | Notes/Reflection | Text |

---

## Example Requests

### BJJ Competition - Win by Submission

```json
{
  "sessionType": "Match Type",
  "sport": "64abc123def456",
  "matchType": "Competition",
  "matchResult": "Win",
  "methodOfVictory": "Submission",
  "submissionUsed": "Rear Naked Choke",
  "matchDuration": "6 min",
  "giNoGi": "Gi",
  "beltDivision": "Blue",
  "bjjWeightClass": "Feather (<70kg)",
  "opponent": "John Doe",
  "notes": "Great match, caught him transitioning from side control."
}
```

### BJJ Roll/Sparring with Tagged Opponent

```json
{
  "sessionType": "Match Type",
  "sport": "64abc123def456",
  "matchType": "Roll/Sparring",
  "matchResult": "Win",
  "methodOfVictory": "Points",
  "yourScore": 8,
  "opponentScore": 4,
  "rollDuration": "5 min",
  "giNoGi": "No-Gi",
  "tagFriend": "64xyz789abc123",
  "notes": "Good flow today, worked on guard passing."
}
```

### Boxing Competition - Win by KO

```json
{
  "sessionType": "Match Type",
  "sport": "64def456ghi789",
  "matchType": "Competition",
  "matchResult": "Win",
  "opponent": "Mike Smith",
  "eventName": "Amateur Boxing Championship 2024",
  "boxingVictoryMethod": "KO",
  "roundOfStoppage": 3,
  "timeOfStoppageMinutes": 1,
  "timeOfStoppageSeconds": 47,
  "boxingWeightClass": "Welterweight",
  "rating": 9,
  "requestCoachReview": true,
  "coachToReview": "64coach123abc",
  "notes": "Best performance of my career!"
}
```

### Boxing Sparring

```json
{
  "sessionType": "Match Type",
  "sport": "64def456ghi789",
  "matchType": "Sparring",
  "opponent": "Training Partner",
  "roundsSparred": 6,
  "timePerRound": "3 min",
  "boxingWeightClass": "Middleweight",
  "rating": 7,
  "notes": "Worked on head movement and counterpunching."
}
```

---

## Database Schema Updates

The following fields were added to the Review model:

### BJJ-Specific Fields
- `methodOfVictory` - Method of victory
- `matchDuration` / `matchDurationCustom` - Competition match duration
- `rollDuration` / `rollDurationCustom` - Roll/Sparring duration
- `submissionUsed` / `submissionCustom` - Submission details
- `yourScore` / `opponentScore` - Score tracking
- `giNoGi` - Gi or No-Gi toggle
- `beltDivision` - Belt division
- `bjjWeightClass` - BJJ weight class

### Boxing-Specific Fields
- `eventName` - Event name
- `boxingVictoryMethod` - Victory method (KO, TKO, etc.)
- `decisionType` - Decision type for points decision
- `roundsFought` - Rounds fought in competition
- `roundOfStoppage` / `timeOfStoppageMinutes` / `timeOfStoppageSeconds` - KO/TKO details
- `boxingWeightClass` - Boxing weight class
- `timePerRound` / `timePerRoundCustom` - Sparring round time
- `roundsSparred` - Rounds sparred
- `gymName` - Gym name for sparring

### Common Fields
- `tagFriend` - Tagged opponent (for mirrored entries)
- `requestPeerFeedback` - Toggle for peer feedback request
- `requestCoachReview` - Toggle for coach review request
- `coachToReview` - Selected coach for review
- `videoUrl` / `videoThumbnail` - Video upload
- `notes` - Notes/Reflection

---

## Notes

1. **Mirrored Entries**: When a BJJ Roll/Sparring session has a tagged opponent (`tagFriend`), the system automatically creates a mirrored entry for that opponent with:
   - Flipped result (Win ↔ Loss)
   - Swapped scores
   - Empty notes (opponent can add their own)
   - Notification sent to the tagged opponent

2. **Coach Review Request**: If only one coach is assigned to the user, it should be auto-selected on the frontend.

3. **Peer Feedback**: Auto-toggle ON if a teammate is tagged.

4. **Video Upload**: Maximum 30 seconds.
