# Sport, Category & Skill Dropdown API Documentation

## Endpoints

### 1. GET /dropdowns/sports
**Purpose:** Get all sports with their categories and skills (nested structure)

**Query Parameters:** None required

**Response Structure:**
```json
{
  "data": [
    {
      "_id": "sport_001",
      "name": "Basketball",
      "sportsType": "Ball",
      "image": "https://example.com/basketball.jpg",
      "skillLevelSet": ["Beginner", "Intermediate", "Advanced"],
      "categories": [
        {
          "_id": "category_001",
          "name": "Offense",
          "sport": "sport_001",
          "skills": [
            {
              "_id": "skill_001",
              "name": "3-point shooting",
              "category": "category_001",
              "skillLevel": "Advanced",
              "description": "Master the art of shooting from beyond the 3-point line"
            },
            {
              "_id": "skill_002",
              "name": "Dribbling",
              "category": "category_001",
              "skillLevel": "Intermediate",
              "description": "Control the ball while moving"
            },
            {
              "_id": "skill_003",
              "name": "Passing",
              "category": "category_001",
              "skillLevel": "Beginner",
              "description": "Basic ball transfer between teammates"
            }
          ]
        },
        {
          "_id": "category_002",
          "name": "Defense",
          "sport": "sport_001",
          "skills": [
            {
              "_id": "skill_004",
              "name": "Man-to-man defense",
              "category": "category_002",
              "skillLevel": "Intermediate",
              "description": "Defensive strategy focusing on individual opponents"
            },
            {
              "_id": "skill_005",
              "name": "Zone defense",
              "category": "category_002",
              "skillLevel": "Intermediate",
              "description": "Defensive strategy focusing on area coverage"
            }
          ]
        },
        {
          "_id": "category_003",
          "name": "Physical",
          "sport": "sport_001",
          "skills": [
            {
              "_id": "skill_006",
              "name": "Vertical jump",
              "category": "category_003",
              "skillLevel": "Beginner",
              "description": "Improve jumping ability for rebounds and dunks"
            },
            {
              "_id": "skill_007",
              "name": "Speed and agility",
              "category": "category_003",
              "skillLevel": "Intermediate",
              "description": "Court movement and directional changes"
            }
          ]
        }
      ],
      "createdAt": "2025-09-01T10:00:00Z",
      "updatedAt": "2025-10-15T14:30:00Z"
    },
    {
      "_id": "sport_002",
      "name": "Football",
      "sportsType": "Ball",
      "image": "https://example.com/football.jpg",
      "skillLevelSet": ["Beginner", "Intermediate", "Advanced"],
      "categories": [
        {
          "_id": "category_004",
          "name": "Passing",
          "sport": "sport_002",
          "skills": [
            {
              "_id": "skill_008",
              "name": "Short pass accuracy",
              "category": "category_004",
              "skillLevel": "Beginner",
              "description": "Accurate short passes to nearby teammates"
            },
            {
              "_id": "skill_009",
              "name": "Long ball technique",
              "category": "category_004",
              "skillLevel": "Advanced",
              "description": "Long-range pass delivery over defenders"
            }
          ]
        },
        {
          "_id": "category_005",
          "name": "Shooting",
          "sport": "sport_002",
          "skills": [
            {
              "_id": "skill_010",
              "name": "Striking power",
              "category": "category_005",
              "skillLevel": "Intermediate",
              "description": "Powerful shots on goal"
            }
          ]
        }
      ],
      "createdAt": "2025-09-05T08:00:00Z",
      "updatedAt": "2025-10-10T12:15:00Z"
    }
  ]
}
```

---

### 2. GET /dropdowns/sports-skillLevel
**Purpose:** Same as `/dropdowns/sports` but with additional skill level information

**Query Parameters:** None required

**Response Structure:** Identical to `/dropdowns/sports`

---

## Using the Dropdown Data in Forms

### Example: Cascading Dropdowns in Frontend

#### Step 1: Fetch and Store Dropdown Data
```javascript
let sportsData = [];

async function loadDropdowns() {
  try {
    const response = await fetch('/dropdowns/sports');
    const result = await response.json();
    sportsData = result.data;
    
    // Populate sport dropdown
    populateSportDropdown(sportsData);
  } catch (error) {
    console.error('Error loading dropdowns:', error);
  }
}

function populateSportDropdown(sports) {
  const sportSelect = document.getElementById('sport');
  sports.forEach(sport => {
    const option = document.createElement('option');
    option.value = sport._id;
    option.textContent = sport.name;
    sportSelect.appendChild(option);
  });
}

loadDropdowns();
```

#### Step 2: Handle Sport Selection → Show Categories
```javascript
document.getElementById('sport').addEventListener('change', function(e) {
  const selectedSportId = e.target.value;
  const selectedSport = sportsData.find(s => s._id === selectedSportId);
  
  // Populate category dropdown
  populateCategoryDropdown(selectedSport.categories);
  
  // Clear skill dropdown
  document.getElementById('skill').innerHTML = '<option>Select Skill</option>';
});

function populateCategoryDropdown(categories) {
  const categorySelect = document.getElementById('category');
  categorySelect.innerHTML = '<option value="">Select Category</option>';
  
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category._id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
}
```

#### Step 3: Handle Category Selection → Show Skills
```javascript
document.getElementById('category').addEventListener('change', function(e) {
  const categoryId = e.target.value;
  
  // Find the selected category from sportsData
  let selectedCategory = null;
  for (let sport of sportsData) {
    selectedCategory = sport.categories.find(c => c._id === categoryId);
    if (selectedCategory) break;
  }
  
  if (selectedCategory) {
    populateSkillDropdown(selectedCategory.skills);
  }
});

function populateSkillDropdown(skills) {
  const skillSelect = document.getElementById('skill');
  skillSelect.innerHTML = '<option value="">Select Skill</option>';
  
  skills.forEach(skill => {
    const option = document.createElement('option');
    option.value = skill._id;
    option.textContent = `${skill.name} (${skill.skillLevel})`;
    skillSelect.appendChild(option);
  });
}
```

#### Step 4: Collect Form Data
```javascript
function getFormData() {
  return {
    date: document.getElementById('date').value,
    trainingName: document.getElementById('trainingName').value,
    sport: document.getElementById('sport').value,
    category: document.getElementById('category').value,
    skill: document.getElementById('skill').value,
    startTime: document.getElementById('startTime').value,
    finishTime: document.getElementById('finishTime').value,
    trainingScope: document.getElementById('trainingScope').value || 'self',
    note: document.getElementById('note').value
  };
}

async function submitTraining() {
  const formData = getFormData();
  
  try {
    const response = await fetch('/training-calander', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    console.log('Training created:', result);
  } catch (error) {
    console.error('Error creating training:', error);
  }
}
```

---

## Sample Form HTML

```html
<form onsubmit="submitTraining(); return false;">
  
  <div>
    <label for="date">Training Date:</label>
    <input type="datetime-local" id="date" required>
  </div>

  <div>
    <label for="trainingName">Training Name:</label>
    <input type="text" id="trainingName" placeholder="e.g., Morning Basketball Practice">
  </div>

  <div>
    <label for="sport">Sport:</label>
    <select id="sport" required>
      <option value="">Select Sport</option>
    </select>
  </div>

  <div>
    <label for="category">Category:</label>
    <select id="category">
      <option value="">Select Category</option>
    </select>
  </div>

  <div>
    <label for="skill">Skill:</label>
    <select id="skill">
      <option value="">Select Skill</option>
    </select>
  </div>

  <div>
    <label for="startTime">Start Time:</label>
    <input type="time" id="startTime">
  </div>

  <div>
    <label for="finishTime">End Time:</label>
    <input type="time" id="finishTime">
  </div>

  <div>
    <label for="trainingScope">Training Scope:</label>
    <select id="trainingScope">
      <option value="self">Personal</option>
      <option value="gym">Gym</option>
    </select>
  </div>

  <div>
    <label for="note">Notes:</label>
    <textarea id="note" placeholder="Additional notes..."></textarea>
  </div>

  <button type="submit">Create Training</button>

</form>
```

---

## Payload Structure for POST /training-calander

Based on dropdown selection:

```json
{
  "date": "2025-10-25T10:00:00Z",
  "trainingName": "Morning Basketball Practice",
  "sport": "sport_001",           // From dropdown
  "category": "category_001",     // From dropdown
  "skill": "skill_001",           // From dropdown
  "startTime": "10:00",           // User input or form
  "finishTime": "11:30",          // User input or form
  "trainingScope": "self",        // Form selection
  "note": "Focus on 3-point shooting"
}
```

---

## Data Field Descriptions

### Sport Object
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique sport identifier - **use this for `sport` in POST payload** |
| `name` | String | Sport name (e.g., "Basketball", "Football") |
| `sportsType` | String | Category type (e.g., "Ball", "Individual") |
| `image` | String | Sport image URL |
| `skillLevelSet` | Array | Available skill levels for this sport |
| `categories` | Array | Nested sport categories |

### Category Object (nested in Sport)
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique category identifier - **use this for `category` in POST payload** |
| `name` | String | Category name (e.g., "Offense", "Defense", "Physical") |
| `sport` | ObjectId | Reference to parent sport |
| `skills` | Array | Nested skills within this category |

### Skill Object (nested in Category)
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique skill identifier - **use this for `skill` in POST payload** |
| `name` | String | Skill name (e.g., "3-point shooting", "Dribbling") |
| `category` | ObjectId | Reference to parent category |
| `skillLevel` | String | Difficulty level (Beginner, Intermediate, Advanced) |
| `description` | String | Detailed skill description |

---

## Key Extraction Examples

### Extract just sport names for a simple dropdown
```javascript
const sportNames = sportsData.map(sport => ({
  id: sport._id,
  label: sport.name
}));
// Output: [{id: "sport_001", label: "Basketball"}, ...]
```

### Extract all categories for a specific sport
```javascript
function getCategoriesByActivityType(sportName) {
  const sport = sportsData.find(s => s.name === sportName);
  return sport ? sport.categories : [];
}

// Usage
const basketballCategories = getCategoriesByActivityType("Basketball");
// Output: [{_id: "category_001", name: "Offense", skills: [...]}, ...]
```

### Extract all skills for a specific category
```javascript
function getSkillsByCategory(categoryId) {
  for (let sport of sportsData) {
    const category = sport.categories.find(c => c._id === categoryId);
    if (category) return category.skills;
  }
  return [];
}

// Usage
const offenseSkills = getSkillsByCategory("category_001");
// Output: [{_id: "skill_001", name: "3-point shooting", ...}, ...]
```

---

## Important Notes

✅ **Use `_id` values** from the dropdown response when creating a training calendar

✅ **Cascading selection** is recommended: Sport → Category → Skill

✅ **All three fields are optional** when creating a training (none are required)

✅ **Skills include skill level** which can be displayed to users for context

✅ **Sport image URLs** can be displayed in the UI for better UX

⚠️ **Sport/Category/Skill relationship is hierarchical** - not all categories exist for all sports

⚠️ **Skills contain descriptions** which can be shown in tooltips or info sections

