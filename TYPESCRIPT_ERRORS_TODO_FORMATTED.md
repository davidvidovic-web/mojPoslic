# TypeScript Errors - TODO List

**Total Errors: 16 across 6 files**

---

## 📋 Error Summary

### ✅ Priority 1: Critical Type Mismatches
- [ ] **File 1:** `src/hooks/queries/useApplications.ts` (1 error)
- [ ] **File 2:** `src/hooks/use-ai-job-matching.ts` (1 error)
- [ ] **File 3:** `src/hooks/use-realtime-analytics.ts` (5 errors)

### ✅ Priority 2: Chat Hook Issues
- [ ] **File 4:** `src/hooks/use-supabase-realtime-chat-backup.ts` (2 errors)
- [ ] **File 5:** `src/hooks/use-supabase-realtime-chat-fixed.ts` (2 errors)
- [ ] **File 6:** `src/hooks/use-supabase-realtime-chat-postgres.ts` (5 errors)

---

## 🔧 Detailed Error Breakdown

### 1️⃣ `src/hooks/queries/useApplications.ts` - Line 71
**Error Type:** Type mismatch on `.insert()` call  
**Issue:** Missing required properties in `applicationData`
- Missing: `applicant_email`, `applicant_name`, `job_category_name`, `job_city_name`, and 3 more

**Fix Strategy:** Cast `applicationData` to `as any` or add missing properties

```typescript
// Current (line 71):
.insert([applicationData])

// Fix Option 1:
.insert([applicationData as any])

// Fix Option 2: Add missing properties to applicationData
```

---

### 2️⃣ `src/hooks/use-ai-job-matching.ts` - Line 257
**Error Type:** Property 'split' does not exist on type 'never'  
**Issue:** TypeScript narrowing issue with conditional type check

```typescript
// Current (line 257):
const userSkills = (typeof userProfile.skills === 'string' ? userProfile.skills.split(',') : userProfile.skills) || []

// Fix:
const userSkills = (typeof userProfile.skills === 'string' 
  ? (userProfile.skills as string).split(',') 
  : userProfile.skills) || []
```

---

### 3️⃣ `src/hooks/use-realtime-analytics.ts` - Lines 190, 195, 198
**Error Count:** 5 errors  
**Issues:**
- Line 190 (x2): Cannot apply `+` operator to `unknown` and `number`
- Line 195 (x2): `unknown` not assignable to `number`, property 'size' doesn't exist on `unknown`
- Line 198: Type mismatch with `views: unknown` vs `views: number`

```typescript
// Line 190 - Current:
.sort((a, b) => (b.views + b.applications * 2) - (a.views + a.applications * 2))

// Fix:
.sort((a, b) => ((b.views as number) + b.applications * 2) - ((a.views as number) + a.applications * 2))

// Line 195 - Current:
uniqueViews: Object.values(uniqueJobViews).reduce((sum, set) => sum + set.size, 0)

// Fix:
uniqueViews: Object.values(uniqueJobViews).reduce((sum, set) => sum + (set as Set<any>).size, 0)

// Line 198 - Current:
topPerformingJobs: topJobs

// Fix: Cast topJobs elements
topPerformingJobs: topJobs.map(job => ({ ...job, views: job.views as number }))
```

---

### 4️⃣ `src/hooks/use-supabase-realtime-chat-backup.ts`
**Error Count:** 2 errors

#### Error 1 - Line 56:
**Issue:** `useRef` expects an argument but got none

```typescript
// Current:
const typingTimeoutRef = useRef<NodeJS.Timeout>()

// Fix:
const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
```

#### Error 2 - Line 112:
**Issue:** Type mismatch - `message_type: string` vs `message_type: "text" | "image" | "file"`

```typescript
// Current:
setMessages(data || [])

// Fix:
setMessages((data || []) as Message[])
```

---

### 5️⃣ `src/hooks/use-supabase-realtime-chat-fixed.ts`
**Error Count:** 2 errors

#### Error 1 - Line 129:
**Issue:** Same as chat-backup - `message_type` string literal mismatch

```typescript
// Current:
setMessages(data || [])

// Fix:
setMessages((data || []) as Message[])
```

#### Error 2 - Lines 198-200:
**Issue:** Type inference issue in setState callback with union type

```typescript
// Current:
setMessages(prev => prev.map(msg =>
  msg.id === tempMessage.id ? data : msg
))

// Fix:
setMessages(prev => prev.map(msg =>
  msg.id === tempMessage.id ? (data as Message) : msg
))
```

---

### 6️⃣ `src/hooks/use-supabase-realtime-chat-postgres.ts`
**Error Count:** 5 errors

#### Error 1 - Line 122:
**Issue:** `deleted_by_users` not in message type definition

```typescript
// Current:
.update({ deleted_by_users: deletedBy })

// Fix:
.update({ deleted_by_users: deletedBy } as any)
```

#### Error 2 - Line 151:
**Issue:** `hidden_for_users` doesn't exist on conversation type

```typescript
// Current:
const hiddenFor = conversation?.hidden_for_users || []

// Fix:
const hiddenFor = (conversation as any)?.hidden_for_users || []
```

#### Error 3 - Line 157:
**Issue:** `hidden_for_users` not in conversation update type

```typescript
// Current:
.update({ hidden_for_users: hiddenFor })

// Fix:
.update({ hidden_for_users: hiddenFor } as any)
```

#### Error 4 - Line 193:
**Issue:** Same as line 122 - `deleted_by_users` not in message type

```typescript
// Current:
.update({ deleted_by_users: deletedBy })

// Fix:
.update({ deleted_by_users: deletedBy } as any)
```

#### Error 5 - Line 240:
**Issue:** `hidden_for_users` property access on typed conversation object

```typescript
// Current:
const hiddenForUsers = conv.hidden_for_users || []

// Fix:
const hiddenForUsers = (conv as any).hidden_for_users || []
```

**Note:** These properties are missing from Supabase generated types. Consider:
- Updating Supabase schema and regenerating types
- Creating extended type definitions
- Using `as any` casts as temporary solution

---

## 🎯 Recommended Fix Order

1. **✅ useApplications.ts** - Quick cast fix (1 line)
2. **✅ use-ai-job-matching.ts** - Type assertion (1 line)
3. **✅ use-realtime-analytics.ts** - Add type guards/assertions (3 locations)
4. **✅ Chat backup & fixed hooks** - Batch fix (4 locations total)
5. **✅ use-supabase-realtime-chat-postgres.ts** - Schema fix or type extensions (5 locations)

**Total Fix Time Estimate:** 15-20 minutes

---

## 📝 Implementation Checklist

- [ ] Fix useApplications.ts line 71
- [ ] Fix use-ai-job-matching.ts line 257
- [ ] Fix use-realtime-analytics.ts lines 190, 195, 198
- [ ] Fix use-supabase-realtime-chat-backup.ts lines 56, 112
- [ ] Fix use-supabase-realtime-chat-fixed.ts lines 129, 198-200
- [ ] Fix use-supabase-realtime-chat-postgres.ts lines 122, 151, 157, 193, 240
- [ ] Run `npx tsc --noEmit` to verify all fixes
- [ ] Consider regenerating Supabase types for proper type safety

---

## 💡 Notes

- Most errors stem from Supabase generated types being incomplete
- `as any` casts are temporary - should be replaced with proper types after migration
- Consider adding these missing fields to Supabase schema:
  - `deleted_by_users` on messages table
  - `hidden_for_users` on conversations table
  - Proper `message_type` enum constraint
