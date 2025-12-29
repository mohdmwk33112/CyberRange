# Comprehensive Test Cases (UI/Black-Box Testing)

## 1. Authentication

| ID | Scenario | Description | Pre-requisites | Input | Execution Steps | Expected Behavior | Status |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **FE-Sign-01** | **User Signup - Successful** | Verify a new user can register via the Signup form. | User is on the Login page (or not logged in). | Username: "tester"<br>Email: "test@example.com"<br>Password: "Password1!" | 1. Navigate to http://localhost:3000/auth/login<br>2. Click "Sign up" link.<br>3. Enter valid details.<br>4. Click "Sign Up". | Form submits successfully.<br>User is redirected to Login/Dashboard.<br>Success toast appears. | Not tested |
| **FE-Sign-02** | **User Signup - Existing Email (Fail)** | Verify error when registering with an email that is already taken. | Email "test@example.com" already exists. | Username: "tester2"<br>Email: "test@example.com"<br>Password: "Password1!" | 1. Navigate to http://localhost:3000/auth/signup<br>2. Enter existing email and valid details.<br>3. Click "Sign Up". | User remains on page.<br>Error message "Email already exists" appears. | Not tested |
| **FE-Sign-03** | **User Signup - Invalid Input (Fail)** | Verify validation for invalid email or weak password. | None | Email: "invalid-email"<br>Password: "123" | 1. Navigate to http://localhost:3000/auth/signup<br>2. Enter invalid email and short password.<br>3. Click "Sign Up". | Form invalid feedback shown.<br>"Invalid email address" and "Password too short" errors appear.<br>Form does not submit. | Not tested |
| **FE-Login-01** | **User Login - Successful** | Verify a registered user can log in via the UI. | User account exists. | Username: "johndoe"<br>Password: "Password123!" | 1. Navigate to http://localhost:3000/auth/login<br>2. Enter valid credentials.<br>3. Click "Login". | Redirects to http://localhost:3000/dashboard<br>"Welcome" message visible. | Not tested |
| **FE-Login-02** | **User Login - Invalid Credentials (Fail)** | Verify error message on failed login. | None | Username: "johndoe"<br>Password: "WrongPassword" | 1. Navigate to http://localhost:3000/auth/login<br>2. Enter incorrect password.<br>3. Click "Login". | User remains on Login page.<br>Error message "Invalid credentials" appears. | Not tested |
| **FE-Login-03** | **User Login - Empty Fields (Fail)** | Verify behavior when fields are left empty. | None | Fields empty | 1. Navigate to http://localhost:3000/auth/login<br>2. Leave fields blank.<br>3. Click "Login". | User remains on page.<br>Validation errors "Required" appear under fields. | Not tested |

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
| **FE-Scen-01** | **View All Scenarios** | Verify list of scenarios loads correctly. | User logged in. | None | 1. Navigate to http://localhost:3000/scenarios | Grid/List of scenarios appears.<br>Titles and descriptions are visible. | Not tested |
| **FE-Scen-02** | **View Scenario Details** | Verify scenario specific details page. | Scenarios list loaded. | Click Scenario Card | 1. Click on a Scenario card. | Redirects to Scenrio Details page.<br>Instructions/Questionnaire visible. | Not tested |
| **FE-Scen-03** | **Complete Questionnaire - Pass** | Verify passing questionnaire unlocks simulation. | User on Questionnaire step. | Correct Answers | 1. Navigate to Scenario.<br>2. Answer correctly.<br>3. Click Submit. | "Questionnaire Passed" toast.<br>Simulation unlocks. | Not tested |
| **FE-Scen-04** | **Complete Questionnaire - Fail** | Verify failing questionnaire keeps simulation locked. | User on Questionnaire step. | Incorrect Answers | 1. Navigate to Scenario.<br>2. Answer incorrectly.<br>3. Click Submit. | Toast "Study More" appears.<br>Score < 90%.<br>Simulation stays locked. | Not tested |
| **FE-Scen-05** | **Reset Questionnaire** | Verify user can retry questionnaire. | User failed questionnaire. | Click "Retry" | 1. Click "Retry Questionnaire" button. | Form resets.<br>User can submit answers again. | Not tested |
| **FE-Sim-01** | **Launch Simulation - Success** | Verify successful simulation launch. | Simulation unlocked. | Click "Launch" | 1. Go to Simulation tab.<br>2. Click "Launch Simulation".<br>3. Wait for start. | "Simulation Starting" toast.<br>Consoles appear.<br>Status changes to "Running". | Not tested |
| **FE-Sim-02** | **Launch Simulation - Locked (Fail)** | Verify locked simulation cannot be started. | User has not passed questionnaire. | Attempt to click | 1. Go to Simulation tab (locked state).<br>2. Verify "Launch" button is disabled or hidden. | Lock icon visible.<br>Button disabled or prompts to take questionnaire. | Not tested |
| **FE-Sim-03** | **Stop Simulation** | Verify stopping a running simulation. | Simulation running. | Click "Terminate" | 1. Click "Terminate Simulation". | "Simulation Stopped" toast.<br>UI resets to initial state. | Not tested |
| **FE-Sim-04** | **Reset Simulation** | Verify resetting a running simulation. | Simulation running. | Click "Reset" | 1. Click "Reset Simulation". | Simulation restarts.<br>Console clears and reloads. | Not tested |
| **FE-Sim-05** | **Verify Victim Health** | Verify real-time health updates. | Simulation running (Victim deployed). | None | 1. Check "Victim Health" panel. | Health status (Green/Red) and metrics are displayed. | Not tested |
| **FE-Sim-06** | **Verify IDS Alerts** | Verify IDS alerts are received. | Simulation running (Attack happening). | None | 1. Check "IDS Alerts" panel.<br>2. Perform attack action. | Alerts appear in the feed.<br>Severity signals logic working. | Not tested |
| **FE-Sim-07** | **Interactive Terminal** | Verify terminal accepts input. | Simulation running. | Command: "ls" | 1. Focus on Terminal.<br>2. Type "ls" and Enter. | Terminal displays directory listing.<br>No UI errors. | Not tested |

## 4. Admin Dashboard

| ID | Scenario | Description | Pre-requisites | Input | Execution Steps | Expected Behavior | Status |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **FE-Admin-01** | **Access Admin - Authorized** | Verify Admin Dashboard loads for admin. | Role: 'admin' | None | 1. Log in as admin.<br>2. Go to http://localhost:3000/admin | Dashboard loads.<br>Tabs (Health, Users, Audit) are visible. | Not tested |
| **FE-Admin-02** | **Access Admin - Unauthorized (Fail)** | Verify non-admins are blocked. | Role: 'user' | None | 1. Log in as regular user.<br>2. Go to http://localhost:3000/admin | Redirected to Dashboard.<br>"Access Denied" toast appears. | Not tested |
| **FE-Admin-03** | **View Cluster Health** | Verify pod status display. | Cluster running. | None | 1. Go to Admin > Health Tab. | Stats cards (Total, Healthy) populated.<br>Pods grid shows "Running" status. | Not tested |
| **FE-Admin-04** | **Cluster Refresh - Error (Fail)** | Verify handling of cluster connection failure. | Cluster service down/unreachable. | Click "Refresh" | 1. Admin Dashboard.<br>2. Click "Refresh State".<br>3. Simulate network error. | Toast "Refresh Failed" appears.<br>Error UI state shown on cards. | Not tested |
| **FE-Admin-05** | **List Users** | Verify admin can see all registered users. | Multiple users exist. | None | 1. Click "User Management" tab. | Table of users loads.<br>Usernames and Roles are visible. | Not tested |
| **FE-Admin-06** | **Delete User** | Verify admin can delete a user. | Target user exists. | Click "Delete" | 1. Locate user in list.<br>2. Click "Delete".<br>3. Confirm dialog. | User removed from list.<br>Success toast appears. | Not tested |
| **FE-Admin-07** | **View Audit Logs** | Verify system audit logs are visible. | Actions performed previously. | None | 1. Click "Login Activity" (Audit) tab. | List of logs (Login/Action) is displayed with timestamps. | Not tested |

## 5. General & Navigation

| ID | Scenario | Description | Pre-requisites | Input | Execution Steps | Expected Behavior | Status |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **FE-Nav-01** | **Responsive Navigation** | Verify menu works on mobile/desktop. | None | Resize Window | 1. Resize browser to mobile width.<br>2. Check for Hamburger menu.<br>3. Open menu. | Menu opens/closes correctly.<br>Links work. | Not tested |
| **FE-Nav-02** | **404 Page** | Verify 404 for invalid routes. | None | Invalid URL | 1. Navigate to http://localhost:3000/invalid-path | Custom 404 Error page is displayed.<br>"Go Home" button works. | Not tested |
