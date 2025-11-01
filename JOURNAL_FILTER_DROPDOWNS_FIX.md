# Fix: Journal Filter Dropdowns 500 Error

## Problem

Getting 500 error when calling `/dropdowns/journals-filters`:
```json
{
  "message": "Error fetching journal filter dropdowns",
  "error": "require is not defined"
}
```

## Root Cause

The code was using CommonJS `require()` in an ES6 module:

```typescript
const SportCategorySkill = require("../models/Sport_Category_Skill.js").default;
```

In ES6 modules (which TypeScript compiles to), `require()` is not available. Must use ES6 import syntax.

## Solution

### Changed: `src/controllers/dropdownData.ts`

**Before:**
```typescript
import { Request, Response } from "express";
import Sports from "../models/Sports.js";
import ChallengeCategoryExercise from "../models/Challenge_Category_Exercise.js";
import Review from "../models/Review.js";
import SportCategory from "../models/Sport_Category.js";

// ... later in function ...
const SportCategorySkill = require("../models/Sport_Category_Skill.js").default;
```

**After:**
```typescript
import { Request, Response } from "express";
import Sports from "../models/Sports.js";
import ChallengeCategoryExercise from "../models/Challenge_Category_Exercise.js";
import Review from "../models/Review.js";
import SportCategory from "../models/Sport_Category.js";
import SportCategorySkill from "../models/Sport_Category_Skill.js";

// ... later in function ...
const skills = await SportCategorySkill.find()
  .select("_id name")
  .lean();
```

## Changes Made

1. ✅ Added `SportCategorySkill` import at top of file
2. ✅ Removed dynamic `require()` statement from function body
3. ✅ Code now uses imported model directly

## Test

```bash
curl -X GET http://localhost:3000/dropdowns/journals-filters
```

Expected response:
```json
{
  "message": "Journal filter dropdowns fetched successfully",
  "data": {
    "sports": [...],
    "sessionTypes": [...],
    "matchTypes": [...],
    "categories": [...],
    "skills": [...]
  }
}
```

## Build Status

✅ **TypeScript Compilation: SUCCESSFUL**

```
> tsc
(no errors, no warnings)
```

## Why This Happens

**ES6 Modules:**
- Use `import` / `export` syntax
- Run in strict mode
- Don't have `require()` available
- Tree-shakeable and better performance

**CommonJS Modules:**
- Use `require()` / `module.exports`
- Have `require()` at runtime
- Older Node.js standard

TypeScript compiles to ES6 modules, so all imports must use `import` syntax.

## Prevention

- ✅ Always use `import` statements at the top of files
- ✅ Never use `require()` in ES6 modules
- ✅ Let TypeScript compiler enforce this

Files affected: 1
- `src/controllers/dropdownData.ts`

Status: **FIXED** ✅
