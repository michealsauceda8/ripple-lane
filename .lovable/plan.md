
# Fix Promotional Banner and Quick Actions Card

## Overview
This plan addresses four issues:
1. Quick Actions card styling in dark mode
2. Promotional banner z-index conflict with sticky navigation
3. Promotional banner should trigger on dashboard entry
4. Make the promotional banner slightly larger while remaining responsive

---

## Issue 1: Quick Actions Dark Mode Styling

**Problem**: The quick actions card uses `glass-card` class which has a light background that doesn't adapt well to dark mode.

**Solution**: Replace `glass-card` with `glass-card dark:glass-card-dark` or create a theme-aware card style.

**File**: `src/pages/Dashboard.tsx`

**Change**:
```tsx
// Line 36: Update the Quick Actions card class
// FROM:
<div className="glass-card p-6">

// TO:
<div className="glass-card dark:bg-card dark:border-border p-6">
```

---

## Issue 2: Z-Index Clash - Banner Under Navigation

**Problem**: 
- Landing page header (`Header.tsx`) uses `z-50`
- BonusBanner backdrop and modal also use `z-50`
- This causes the banner to appear at the same level or under the nav

**Solution**: Increase the BonusBanner z-index to `z-[60]` (higher than 50) so it appears above everything.

**File**: `src/components/promotional/BonusBanner.tsx`

**Changes**:
```tsx
// Line 68: Update backdrop z-index
// FROM:
className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"

// TO:
className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"

// Line 77: Update modal container z-index
// FROM:
className="fixed inset-0 z-50 flex items-center justify-center p-4"

// TO:
className="fixed inset-0 z-[60] flex items-center justify-center p-4"
```

---

## Issue 3: Show Banner on Dashboard Entry

**Problem**: Banner only triggers on session start (homepage) or auth (login/register), not when user navigates to dashboard.

**Solution**: 
1. Add a new trigger type `"dashboard"` to the BonusBanner component
2. Add BonusBanner to the DashboardLayout with the dashboard trigger
3. Use sessionStorage with a dashboard-specific key so it shows once per session when entering dashboard

**File 1**: `src/components/promotional/BonusBanner.tsx`

**Changes**:
```tsx
// Update interface to include 'dashboard' trigger
interface BonusBannerProps {
  trigger?: 'session' | 'auth' | 'dashboard';
}

// Add DASHBOARD_KEY constant
const DASHBOARD_KEY = 'xrpvault_bonus_banner_dashboard';

// Update useEffect to handle 'dashboard' trigger
if (trigger === 'dashboard') {
  const dashboardShown = sessionStorage.getItem(DASHBOARD_KEY);
  if (dashboardShown) return;
  
  const timer = setTimeout(() => {
    setIsOpen(true);
    sessionStorage.setItem(DASHBOARD_KEY, 'true');
  }, 800);
  
  return () => clearTimeout(timer);
}
```

**File 2**: `src/components/dashboard/DashboardLayout.tsx`

**Changes**:
```tsx
// Import BonusBanner
import BonusBanner from '@/components/promotional/BonusBanner';

// Add BonusBanner inside the component return, before the closing div
<BonusBanner trigger="dashboard" />
```

---

## Issue 4: Make Banner Larger but Responsive

**Problem**: Current banner has `max-w-md` (28rem / 448px) which feels small.

**Solution**: Increase to `max-w-lg` (32rem / 512px) or `max-w-xl` (36rem / 576px) and adjust padding.

**File**: `src/components/promotional/BonusBanner.tsx`

**Changes**:
```tsx
// Line 79: Increase max-width
// FROM:
<div className="relative w-full max-w-md overflow-hidden rounded-3xl">

// TO:
<div className="relative w-full max-w-lg sm:max-w-xl overflow-hidden rounded-3xl">

// Line 84: Increase padding
// FROM:
<div className="relative m-[2px] rounded-[22px] bg-gradient-to-b from-[hsl(210,50%,12%)] to-[hsl(210,60%,8%)] p-6 sm:p-8">

// TO:
<div className="relative m-[2px] rounded-[22px] bg-gradient-to-b from-[hsl(210,50%,12%)] to-[hsl(210,60%,8%)] p-6 sm:p-10">

// Increase icon size (line 123)
// FROM:
className="mx-auto w-20 h-20 rounded-2xl..."

// TO:
className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-2xl..."

// Increase headline size (line 146)
// FROM:
className="text-3xl sm:text-4xl font-bold text-white mb-2"

// TO:
className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3"

// Increase bonus text size (line 158-159)
// FROM:
className="text-5xl sm:text-6xl font-extrabold..."

// TO:
className="text-5xl sm:text-6xl md:text-7xl font-extrabold..."
```

---

## Summary of Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Add dark mode background to Quick Actions card |
| `src/components/promotional/BonusBanner.tsx` | Increase z-index to z-[60], add 'dashboard' trigger, make banner larger |
| `src/components/dashboard/DashboardLayout.tsx` | Import and render BonusBanner with dashboard trigger |

---

## Expected Outcome
- Quick Actions card will have proper dark background in dark mode
- Promotional banner will always appear above the navigation bar
- Banner will display once per session when user enters dashboard
- Banner will be noticeably larger while remaining fully responsive on mobile
