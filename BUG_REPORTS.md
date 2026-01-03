# Bug Reports - CyberRange Platform

## Bug #1: Duplicate Email Registration Allowed
**Status**: ✅ FIXED  
**Severity**: Medium  
**Date Reported**: 2025-12-29  
**Date Fixed**: 2025-12-29

### Description
Users were able to register multiple accounts using the same email address, leading to potential data inconsistency and security concerns.

### Steps to Reproduce
1. Navigate to `/auth/signup`
2. Register with email `test@example.com`
3. Logout
4. Attempt to register again with same email `test@example.com`
5. **Expected**: Error message preventing duplicate registration
6. **Actual**: Second account created successfully

### Root Cause
The `register` method in `backend/microservices/src/auth/auth.service.ts` did not check for existing emails before creating a new user.

### Resolution
1. **Backend Integration**: Implemented email uniqueness check in `AuthService`.
2. **Error Propagation**: Modified API Gateway to catch microservice exceptions and re-throw them with specific status codes (409 Conflict).
3. **Inline UI**: Updated the Signup form to extract the server error message and display it in a red alert box above the form fields, clearing it on re-submission.

### Files Modified
- `backend/microservices/src/auth/auth.service.ts`
- `backend/api-gateway/src/auth/auth.service.ts`
- `frontend/app/auth/signup/page.tsx`
- `frontend/features/auth/auth.hooks.ts`

---

## Bug #2: Completed Scenarios Redirect to Simulation Instead of Learning
**Status**: ✅ FIXED  
**Severity**: Low  
**Date Reported**: 2025-12-29  
**Date Fixed**: 2025-12-29

### Description
When a user completed a scenario and returned to it later, the page automatically redirected to the simulation phase instead of the learning phase, bypassing educational content.

### Steps to Reproduce
1. Complete a scenario (pass questionnaire with >90%)
2. Navigate away from the scenario
3. Return to the scenario page
4. **Expected**: Start at Learning phase
5. **Actual**: Redirected directly to Simulation phase

### Root Cause
In `frontend/app/scenarios/[id]/page.tsx`, the `useEffect` hook (line 61) set phase to `'simulation'` when `state.simulationUnlocked` was true.

### Resolution
Changed redirect logic to start at learning phase:
```typescript
if (state.simulationUnlocked) {
    setPhase('learning'); // Changed from 'simulation'
}
```

### Files Modified
- `frontend/app/scenarios/[id]/page.tsx`

---

## Bug #3: Questionnaire Not Loading/Gaps in Navigation
**Status**: ✅ FIXED  
**Severity**: Medium  
**Date Reported**: 2025-12-29  
**Date Fixed**: 2025-12-29

### Description
When users clicked navigation tabs or "Continue" buttons, content would sometimes fail to load or appear blank because the underlying step index didn't match the active phase.

### Steps to Reproduce
1. Start a scenario
2. Click "02. Questionnaire" from top navigation bar
3. **Expected**: Questionnaire loads with questions
4. **Actual**: Blank page, no questions shown

### Root Cause
Navigation relied on strict step index matching. If a user switched phases, the component often looked at the wrong index (e.g., trying to render questions from a learning step).

### Resolution
1. **Intelligent Tab Switching**: Updated navigation buttons to explicitly find the correct step index for the selected phase.
2. **Resilient Rendering**: Components now search the scenario steps array for fallback data if the current step doesn't match the expected phase.
3. **Defensive Checks**: Added null-handling to `TerminalQuestionnaire` to prevent rendering empty states.

### Files Modified
- `frontend/app/scenarios/[id]/page.tsx`
- `frontend/features/scenarios/components/TerminalQuestionnaire.tsx`

---

## Bug #4: Terminal Questionnaire Crash on Retake (`TypeError`)
**Status**: ✅ FIXED  
**Severity**: High  
**Date Reported**: 2025-12-29  
**Date Fixed**: 2025-12-29

### Description
Accessing "Retake Questionnaire" from the simulation phase caused an immediate crash: `TypeError: Cannot read properties of undefined (reading 'questionText')`.

### Steps to Reproduce
1. Complete questionnaire and unlock simulation.
2. Click "Retake Questionnaire to Improve Score".
3. **Result**: App crashes with TypeError.

### Root Cause
`handleResetQuestionnaire` hardcoded the step index to `0` while switching the phase to `'questionnaire'`. Since step `0` is a learning step, the questionnaire component received no questions and crashed.

### Resolution
1. Updated `handleResetQuestionnaire` to find the dynamic index of the questionnaire step.
2. Added defensive checks in `TerminalQuestionnaire.tsx` to handle undefined questions gracefully.

---

## Bug #5: Weak Password Security (Missing Complexity)
**Status**: ✅ FIXED  
**Severity**: Medium  
**Date Reported**: 2025-12-29  
**Date Fixed**: 2025-12-29

### Description
The platform allowed weak passwords (minimum 6 simple characters), which does not meet security best practices.

### Resolution
1. **Frontend**: Updated Zod schema to require 8-20 characters, 1 uppercase, 1 lowercase, and 1 number.
2. **Backend**: Implemented regex validation in `AuthService` to enforce rules at the API level.
3. **UI**: Added a requirement hint under the password entry field.

---

## Bug #6: Destructive Questionnaire Retake
**Status**: ✅ FIXED  
**Severity**: Low  
**Date Reported**: 2025-12-29  
**Date Fixed**: 2025-12-29

### Description
Choosing to retake the questionnaire to improve a score would reset the user's progress in the backend, locking the simulation again even if the user had already passed.

### Resolution
Modified `handleResetQuestionnaire` to skip the backend reset if the user has already unlocked the simulation, allowing "Practice Mode" without losing access.

---

## Bug #7: Unauthorized Access to Protected Routes
**Status**: ✅ FIXED (Previously)  
**Severity**: Critical  
**Date Reported**: Prior to 2025-12-29  
**Date Fixed**: Prior to 2025-12-29

### Description
Users could access protected routes (`/dashboard`, `/scenarios`, `/scenarios/[id]`) without authentication by directly entering the URL in the browser.

### Steps to Reproduce
1. Ensure you are logged out
2. Navigate directly to `http://localhost:3000/dashboard`
3. **Expected**: Redirect to login page
4. **Actual**: Dashboard page accessible without authentication

### Root Cause
Protected pages lacked client-side authentication checks and redirects. The pages were server-rendered without verifying user authentication state.

### Resolution
Added authentication guards to protected pages using a `ProtectedRoute` component and `useAuthStore` logic.

### Files Modified
- `frontend/app/dashboard/page.tsx`
- `frontend/app/scenarios/page.tsx`
- `frontend/app/scenarios/[id]/page.tsx`
- `frontend/app/admin/page.tsx`
- `frontend/app/users/profile/[id]/page.tsx`

---

## Bug #8: Incorrect Admin Redirection
**Status**: ✅ FIXED  
**Severity**: Low  
**Date Reported**: 2025-12-30  
**Date Fixed**: 2025-12-30

### Description
Accessing `http://localhost:3000/admin` while not logged in incorrectly redirected users to the student dashboard (`/dashboard`) instead of the login page (`/auth/login`).

### Steps to Reproduce
1. Ensure you are completely logged out (clear local storage).
2. Navigate directly to `http://localhost:3000/admin`.
3. **Expected**: Redirected to `/auth/login`.
4. **Actual**: Redirected to `/dashboard`.

### Root Cause
The redirection logic in `frontend/app/admin/page.tsx` only checked `isAuthenticated()` using the token. If the user object was missing but a stale token existed, it defaulted to the dashboard redirect instead of the login redirect.

### Resolution
Updated the authentication guard to verify both token presence and the existence of the user object:
```typescript
if (!isAuthenticated() || !user) {
    router.push('/auth/login');
}
```

---

## Bug #9: User Join Date "N/A" in Admin Dashboard
**Status**: ✅ FIXED  
**Severity**: Low  
**Date Reported**: 2025-12-30  
**Date Fixed**: 2025-12-30

### Description
In the Admin Dashboard's User Management tab, expanding a user row showed "N/A" for the "Joined Date" for all users.

### Steps to Reproduce
1. Log in as Admin.
2. Go to User Management tab.
3. Expand any user row.
4. **Actual**: Joined Date shows "N/A".

### Root Cause
The `UserSchema` in `backend/microservices/src/auth/user.model.ts` did not have `timestamps: true` enabled, so Mongoose was not recording the `createdAt` and `updatedAt` fields.

### Resolution
1. **Backend Schema Update**: Enabled `timestamps: true` in `UserSchema` to record `createdAt` for all new registrations.
2. **Frontend Robustness (ObjectId Fallback)**: Implemented a logic in `UserManagement.tsx` to extract the registration date from the first 8 characters of the MongoDB `_id` (Hex timestamp) if the `createdAt` field is missing. This ensures all existing users show a valid date.

### Files Modified
- `backend/microservices/src/auth/user.model.ts`
---

## Bug #10: Forced Dashboard Redirection from Landing Page
**Status**: ✅ FIXED  
**Severity**: Low  
**Date Reported**: 2026-01-03  
**Date Fixed**: 2026-01-03

### Description
Authenticated users were automatically redirected from the landing page (`/`) to the dashboard (`/dashboard`), preventing them from viewing the landing page content.

### Steps to Reproduce
1. Log in as any user.
2. Navigate directly to the base URL `http://localhost:3000/`.
3. **Actual**: Redirected to `/dashboard`.
4. **Expected**: Landing page is displayed.

### Root Cause
An `useEffect` hook in `frontend/app/page.tsx` was checking `isAuthenticated()` and calling `router.replace('/dashboard')` immediately on mount.

### Resolution
Removed the auto-redirection logic. The landing page now renders for all users, and the call-to-action buttons dynamically update to "Go to Dashboard" if the user is logged in.

### Files Modified
- `frontend/app/page.tsx`
---

## Bug #11: Missing Role-Based Redirection on Student Dashboard
**Status**: ✅ FIXED  
**Severity**: Low  
**Date Reported**: 2026-01-03  
**Date Fixed**: 2026-01-03

### Description
Administrators were able to access the student dashboard (`/dashboard`) by manually typing the URL, which showed them the student interface with admin data.

### Steps to Reproduce
1. Log in as an admin.
2. Manually navigate to `http://localhost:3000/dashboard`.
3. **Actual**: Admin sees the student dashboard.
4. **Expected**: Admin should be redirected to `/admin`.

### Root Cause
`frontend/app/dashboard/page.tsx` lacked an authentication and role-based redirect guard.

### Resolution
Implemented a `useEffect` hook in the dashboard page to check for authentication and user role. Admins are now automatically redirected to the administrative interface (`/admin`).

### Files Modified
- `frontend/app/dashboard/page.tsx`
---

## Bug #12: Accidental Logout on Unauthorized Access
**Status**: ✅ FIXED  
**Severity**: Medium  
**Date Reported**: 2026-01-03  
**Date Fixed**: 2026-01-03

### Description
Users were being logged out when attempting to access unauthorized routes (e.g., a student accessing `/admin`). Instead of just being redirected to their dashboard, the session was lost.

### Steps to Reproduce
1. Log in as a student.
2. Manually navigate to `http://localhost:3000/admin`.
3. **Actual**: Redirected to `/auth/login` and logged out.
4. **Expected**: Redirected to `/dashboard` with an "Access Denied" message, keeping the session.

### Root Cause
The authentication guard logic `if (!checkAuth() || !user)` was triggering a redirect to login if the `user` object hadn't finished hydrating from localStorage yet, even if the token was present.

### Resolution
Refined the guards in both `app/admin/page.tsx` and `app/dashboard/page.tsx` to explicitly wait for the `user` object to hydrate if a valid token is detected, before making role-based redirection decisions.

### Files Modified
- `frontend/app/admin/page.tsx`
- `frontend/app/dashboard/page.tsx`
---

## Bug #13: Missing Validation on User Profile Update
**Status**: ✅ FIXED  
**Severity**: Low  
**Date Reported**: 2026-01-03  
**Date Fixed**: 2026-01-03

### Description
The user profile update form allowed saving with empty username or email fields, which could lead to data inconsistency and a poor user experience.

### Steps to Reproduce
1. Navigate to the User Profile page.
2. Click "Edit Profile".
3. Remove all text from the "Username" or "Email" field.
4. Click "Save Changes".
5. **Actual**: The form attempts to save the empty fields.
6. **Expected**: Submitting empty required fields should be blocked, and an error message should be displayed.

### Root Cause
`frontend/app/users/profile/[id]/page.tsx` lacked client-side validation for empty strings before calling the update API.

### Resolution
Implemented a validation check in `handleUpdateProfile` that ensures both `username` and `email` are non-empty and that the email follows a basic format. Added `formErrors` state to display inline error messages and highlight problematic fields in red.

### Files Modified
- `frontend/app/users/profile/[id]/page.tsx`
