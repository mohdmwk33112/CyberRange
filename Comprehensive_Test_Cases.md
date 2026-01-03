# Comprehensive Test Cases (UI/Black-Box Testing)

## 1. Authentication

| ID | Scenario | Description | Pre-requisites | Input | Execution Steps | Expected Behavior | Status |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **FE-Sign-01** | **User Signup - Successful** | Verify a new user can register via the Signup form. | User is not logged in. | Username: "tester"<br>Email: "test@example.com"<br>Password: "Password1!" | 1. Navigate to /auth/signup.<br>2. Enter valid details.<br>3. Click "Sign Up". | Navigates to Login page.<br>Success toast appears. | **Automated (Katalon)** |
| **FE-Sign-02** | **User Signup - Existing Email (Fail)** | Verify error when registering with an email that is already taken. | Email "test@example.com" exists. | Email: "test@example.com" | 1. Navigate to /auth/signup.<br>2. Enter existing email.<br>3. Click "Sign Up". | Error message "Email already exists" shown.<br>User remains on Signup page. | **Automated (Katalon)** |
| **FE-Sign-03** | **User Signup - Invalid Input (Fail)** | Verify validation for invalid email or weak password. | None | Email: "invalid"<br>Pass: "123" | 1. Navigate to /auth/signup.<br>2. Enter invalid inputs.<br>3. Click "Sign Up". | Inline validation errors shown.<br>Form blocked from submission. | **Automated (Katalon)** |
| **FE-Sign-04** | **User Signup - Empty Fields (Fail)** | Verify behavior when fields are left empty. | None | Fields empty | 1. Navigate to /auth/signup.<br>2. Click "Sign Up" without data. | "Required" indicators or toast appears.<br>User remains on Signup page. | **Automated (Katalon)** |
| **FE-Login-01** | **User Login - Successful** | Verify a registered user can log in via the UI. | User exists. | Valid Credentials | 1. Navigate to /auth/login.<br>2. Enter valid credentials.<br>3. Click "Login". | Redirected to /dashboard.<br>User session established. | **Automated (Katalon)** |
| **FE-Login-02** | **User Login - Invalid Credentials (Fail)** | Verify error message on failed login (Wrong Pass). | None | Wrong Password | 1. Navigate to /auth/login.<br>2. Enter wrong password.<br>3. Click "Login". | Error toast "Invalid credentials" appears.<br>User remains on Login page. | **Automated (Katalon)** |
| **FE-Login-03** | **User Login - Invalid Username (Fail)** | Verify error message on failed login (Wrong User). | None | Wrong Username | 1. Navigate to /auth/login.<br>2. Enter wrong username.<br>3. Click "Login". | Error toast "Invalid credentials" appears.<br>User remains on Login page. | **Automated (Katalon)** |
| **FE-Login-04** | **User Login - Empty Fields (Fail)** | Verify behavior when fields are left empty. | None | Fields empty | 1. Navigate to /auth/login.<br>2. Click "Login" without data. | Inline validation messages appear.<br>User remains on Login page. | **Automated (Katalon)** |
| **FE-AUTH-01** | **JWT Validation** | Verify session is dropped when token is missing/invalid. | User logged in. | Clear localStorage | 1. Clear 'auth-storage' from browser.<br>2. Refresh page. | Automatically redirected to Login.<br>Access to dashboard revoked. | **Automated (Katalon)** |
| **FE-AUTH-02** | **Role-Based Access** | Verify student cannot access admin area. | Role: 'student' | Navigate /admin | 1. Log in as student.<br>2. Navigate to /admin. | Redirected to /dashboard.<br>"Access Denied" toast shown. | **Automated (Katalon)** |

## 2. User Profile & Progress

| ID | Scenario | Description | Pre-requisites | Input | Execution Steps | Expected Behavior | Status |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **FE-Profile-01** | **View Profile** | Verify user details are correctly displayed. | User is logged in. | None | 1. Navigate to http://localhost:3000/users/profile/&lt;id&gt; | Profile page loads with correct Username, Email, Role. | Not tested |
| **FE-Profile-02** | **Edit Profile - Success** | Verify user can update their username. | User on Profile page. | New Username: "UpdatedTester" | 1. Click "Edit Profile".<br>2. Enter new username.<br>3. Click "Save". | Toast "Profile Updated" appears.<br>New username displayed. | Not tested |
| **FE-Profile-03** | **Edit Profile - Invalid Error (Fail)** | Verify error when clearing required fields. | User on Edit Profile. | Username: "" (Empty) | 1. Click "Edit Profile".<br>2. Clear Username field.<br>3. Click "Save". | Save button disabled or Error toast appears.<br>Changes not saved. | Not tested |
| **FE-Profile-04** | **Change Password - Mismatch (Fail)** | Verify error when new password is too short. | User on Profile page. | Password: "short" | 1. Click "Change Password".<br>2. Enter "short" in field.<br>3. Click "Update". | Toast "Invalid Password" (min 6 chars) appears.<br>Request not sent. | Not tested |
| **FE-Profile-05** | **Delete Account** | Verify account deletion flow. | **Test account only**. | Confirmation | 1. Click "Delete Account".<br>2. Accept confirmation.<br>3. Verify redirect. | Redirected to Login.<br>Account deleted. | Not tested |
| **FE-Prog-01** | **View Progress** | Verify user can view their training progress. | User has completed at least one scenario. | None | 1. Navigate to http://localhost:3000/progress | Progress dashboard loads showing scores/levels. | Not tested |
| **FE-Prog-02** | **View Active Simulations** | Verify user can see actively running simulations. | User has a running simulation. | None | 1. Navigate to Dashboard. | "Active Simulation" card is visible with "Running" status. | Not tested |

## 3. Scenarios & Simulation

| ID | Scenario | Description | Pre-requisites | Input | Execution Steps | Expected Behavior | Status |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **FE-Scen-01** | **View All Scenarios** | Verify list of scenarios loads correctly. | User logged in. | None | 1. Navigate to http://localhost:3000/scenarios | Grid/List of scenarios appears.<br>Titles and descriptions are visible. | **Automated (Katalon)** |
| **FE-Scen-02** | **View Scenario Details** | Verify scenario specific details page. | Scenarios list loaded. | Click Scenario Card | 1. Click on a Scenario card. | Redirects to Scenrio Details page.<br>Instructions/Questionnaire visible. | **Automated (Katalon)** |
| **FE-Scen-03** | **Complete Questionnaire - Pass** | Verify passing questionnaire unlocks simulation. | User on Questionnaire step. | Correct Answers | 1. Navigate to Scenario.<br>2. Answer correctly.<br>3. Click Submit. | "Questionnaire Passed" toast.<br>Simulation unlocks. | **Automated (Katalon)** |
| **FE-Scen-04** | **Complete Questionnaire - Fail** | Verify failing questionnaire keeps simulation locked. | User on Questionnaire step. | Incorrect Answers | 1. Navigate to Scenario.<br>2. Answer incorrectly.<br>3. Click Submit. | Toast "Study More" appears.<br>Score < 90%.<br>Simulation stays locked. | **Automated (Katalon)** |
| **FE-Scen-05** | **Reset Questionnaire** | Verify user can retry questionnaire. | User failed questionnaire. | Click "Retry" | 1. Click "Retry Questionnaire" button. | Form resets.<br>User can submit answers again. | **Automated (Katalon)** |
| **FE-Sim-01** | **Launch Simulation - Success** | Verify successful simulation launch. | Simulation unlocked. | Click "Launch" | 1. Go to Simulation tab.<br>2. Click "Launch Simulation".<br>3. Wait for start. | "Simulation Starting" toast.<br>Consoles appear.<br>Status changes to "Running". | **Automated (Katalon)** |
| **FE-Sim-02** | **Launch Simulation - Locked (Fail)** | Verify locked simulation cannot be started. | User has not passed questionnaire. | Attempt to click | 1. Go to Simulation tab (locked state).<br>2. Verify "Launch" button is disabled or hidden. | Lock icon visible.<br>Button disabled or prompts to take questionnaire. | **Automated (Katalon)** |
| **FE-Sim-03** | **Stop Simulation** | Verify stopping a running simulation. | Simulation running. | Click "Terminate" | 1. Click "Terminate Simulation". | "Simulation Stopped" toast.<br>UI resets to initial state. | **Automated (Katalon)** |

## 4. Admin Dashboard

| ID | Scenario | Description | Pre-requisites | Input | Execution Steps | Expected Behavior | Status |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **FE-Admin-01** | **Access Admin - Authorized** | Verify Admin Dashboard loads for admin. | Role: 'admin' | None | 1. Log in as admin.<br>2. Access /admin. | Dashboard UI visible.<br>K8s pods list displayed. | **Automated (Katalon)** |
| **FE-Admin-02** | **Access Admin - Unauthorized (Fail)** | Verify non-admins are blocked. | Role: 'student' | Navigate /admin | 1. Access /admin as student. | Redirected to /dashboard.<br>Access Denied toast appears. | **Automated (Katalon)** |
| **FE-Admin-03** | **View Cluster Health & Expand Pods** | Verify pod status display and details expansion. | Cluster active. | Click Pod Card | 1. Go to Admin Dashboard.<br>2. Click a Pod card. | Detailed labels and IP shown. | Not tested |
| **FE-Admin-04** | **Cluster Refresh - Error (Fail)** | Verify handling of cluster connection failure. | Cluster down. | Click Refresh | 1. Click Refresh button. | Error state shown on cards. | Not tested |
| **FE-Admin-05** | **List Users & Expand Details** | Verify admin can see and expand user details. | Multiple users. | Click User Row | 1. Go to User Management.<br>2. Click a user row. | Row expands.<br>Joined date and ID visible. | **Automated (Katalon)** |
| **FE-Admin-06** | **Delete User** | Verify admin can delete a user. | User exists. | Click Delete | 1. Click Delete button.<br>2. Confirm in custom dialog. | User disappears from list.<br>Success toast shown. | **Automated (Katalon)** |
| **FE-Admin-07** | **View Audit Logs** | Verify system audit logs are visible. | Activity exists. | Click Audit Tab | 1. Select Login Activity tab. | Table of system logs appears. | **Automated (Katalon)** |

## 5. General & Navigation

| ID | Scenario | Description | Pre-requisites | Input | Execution Steps | Expected Behavior | Status |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **FE-Nav-01** | **Responsive Navigation** | Verify menu works on mobile/desktop. | None | Resize Window | 1. Resize browser to mobile width.<br>2. Check for Hamburger menu.<br>3. Open menu. | Menu opens/closes correctly.<br>Links work. | Not tested |
| **FE-Nav-02** | **404 Page** | Verify 404 for invalid routes. | None | Invalid URL | 1. Navigate to http://localhost:3000/invalid-path | Custom 404 Error page is displayed.<br>"Go Home" button works. | Not tested |
