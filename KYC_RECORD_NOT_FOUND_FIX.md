# 🔍 KYC Record Not Found - Troubleshooting Guide

## ⚠️ Problem
When accessing `/kyc-approval/{userId}`, you get: **"KYC record not found"**

---

## 🔧 Step-by-Step Debug

### Step 1: Check if KYC Records Exist

1. Go to: `http://localhost:5173/kyc-debug`
2. This page shows:
   - Your current user ID
   - All KYC records in the database
   - Direct links to approval pages
   - Copy buttons for IDs

**If no records show:**
- ❌ KYC hasn't been submitted yet
- ✅ Go to `/dashboard/kyc` and submit a test form

**If records show:**
- ✅ Records exist in database
- Copy the User ID from the debug page
- Go to: `/kyc-approval/{paste-user-id}`

---

### Step 2: Verify the User ID Format

Check that you're using the correct format:

**Correct (UUID format):**
```
http://localhost:5173/kyc-approval/550e8400-e29b-41d4-a716-446655440000
```

**Wrong (incomplete):**
```
http://localhost:5173/kyc-approval/550e84
http://localhost:5173/kyc-approval/user-123
```

Use the `/kyc-debug` page to get the exact ID.

---

### Step 3: Check Supabase Database Directly

If you still have issues, check the database manually:

1. Go to: https://app.supabase.com
2. Select your project
3. Go to: **SQL Editor** → **New Query**
4. Run this query:

```sql
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  status,
  created_at
FROM kyc_verifications
ORDER BY created_at DESC
LIMIT 10;
```

**Expected Result:**
- You should see your KYC records
- Note the `user_id` - that's what goes in the approval URL

---

### Step 4: Browser Console Debugging

1. Open the approval page that fails: `/kyc-approval/{userId}`
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Look for messages like:
   - ✅ "Sample user IDs in database:" - shows what IDs exist
   - ❌ "KYC Fetch Error:" - shows the database error

**Copy the exact user ID** from the console output and use it.

---

## 🎯 Common Issues & Fixes

### Issue: "User ID not provided"
**Cause:** URL is missing the userId parameter  
**Fix:** Make sure URL has format: `/kyc-approval/{userId}`

### Issue: "KYC record not found for user: [ID]"
**Cause:** That user ID doesn't have a KYC record  
**Fix:**
1. Go to `/kyc-debug`
2. Check if records exist
3. Use an ID from the debug page
4. Submit a new KYC if no records exist

### Issue: "Failed to load KYC data"
**Cause:** Database permission or connection issue  
**Fix:**
1. Check Supabase is connected
2. Verify `kyc_verifications` table exists
3. Check Row Level Security policies

### Issue: Can see records in debug page, but approval page won't load
**Cause:** Exact User ID copy/paste error  
**Fix:**
1. Go to `/kyc-debug`
2. Click the **Copy** button next to User ID
3. Manually add to URL: `/kyc-approval/{paste-here}`
4. Don't type it manually - copy/paste to avoid typos

---

## 🛠️ Testing Flow

### Complete Test Workflow

1. **Go to KYC form**
   ```
   http://localhost:5173/dashboard/kyc
   ```

2. **Submit test KYC**
   - Fill all fields
   - Upload documents (optional)
   - Click "Submit for Review"
   - See success message

3. **Check debug page**
   ```
   http://localhost:5173/kyc-debug
   ```
   - Verify record appears
   - Copy the User ID

4. **Visit approval page**
   ```
   http://localhost:5173/kyc-approval/{user-id-from-debug}
   ```

5. **Should see:**
   - ✅ All KYC details loaded
   - ✅ Status card shows
   - ✅ Approve/Reject buttons visible
   - ✅ Any documents listed

---

## 🔐 Database Queries for Investigation

### Check KYC for Specific User
```sql
SELECT * FROM kyc_verifications 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
```

### List All KYC Records
```sql
SELECT user_id, first_name, last_name, status, created_at 
FROM kyc_verifications
ORDER BY created_at DESC;
```

### Check if User Exists
```sql
SELECT id, email FROM auth.users 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

### Check RLS Policies
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'kyc_verifications';
```

---

## 📋 Checklist for Full Setup

- [ ] KYC form works at `/dashboard/kyc`
- [ ] Can submit test KYC successfully
- [ ] Debug page shows record at `/kyc-debug`
- [ ] User ID is in UUID format (with dashes)
- [ ] Can copy User ID from debug page
- [ ] Approval page loads with correct ID
- [ ] Can see all KYC details on approval page
- [ ] Can approve/reject and see database update

---

## 🆘 If All Else Fails

Run this to inspect the raw data:

```javascript
// In browser console on /kyc-debug page
// Find the approval link and extract the user ID
const link = document.querySelector('[href*="/kyc-approval"]')?.href
const userId = link?.split('/').pop()
console.log('User ID:', userId)

// Navigate to approval page
window.location.href = `/kyc-approval/${userId}`
```

Or check the browser network tab:
1. Go to `/kyc-approval/{userId}`
2. Press F12 → Network tab
3. Look for request to: `kyc_verifications` table
4. Check the error response

---

## 📚 Related Docs

- [KYC_APPROVAL_PORTAL.md](KYC_APPROVAL_PORTAL.md) - Full approval system guide
- [APPROVAL_SYSTEM_SETUP.md](APPROVAL_SYSTEM_SETUP.md) - Setup instructions
- [src/pages/KYCDebugPage.tsx](src/pages/KYCDebugPage.tsx) - Debug page code
- [src/pages/KYCApprovalPage.tsx](src/pages/KYCApprovalPage.tsx) - Approval page code

---

## ✅ Quick Links

| Action | Link |
|--------|------|
| **Debug Page** | `/kyc-debug` |
| **KYC Form** | `/dashboard/kyc` |
| **Telegram Test** | `/telegram-test` |
| **Supabase Dashboard** | https://app.supabase.com |

**Start here:** Go to `/kyc-debug` to see if records exist and get the correct User ID!
