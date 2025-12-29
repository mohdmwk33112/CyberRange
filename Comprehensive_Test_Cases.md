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

## 2. User Profile

| ID | Scenario | Description | Pre-requisites | Input | Execution Steps | Expected Behavior | Status |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **FE-Profile-01** | **View Profile** | Verify user details are correctly displayed. | User is logged in. | None | 1. Navigate to http://localhost:3000/users/profile/&lt;id&gt; | Profile page loads with correct Username, Email, Role. | Not tested |
| **FE-Profile-02** | **Edit Profile - Success** | Verify user can update their username. | User on Profile page. | New Username: "UpdatedTester" | 1. Click "Edit Profile".<br>2. Enter new username.<br>3. Click "Save". | Toast "Profile Updated" appears.<br>New username displayed. | Not tested |
| **FE-Profile-03** | **Edit Profile - Invalid Error (Fail)** | Verify error when clearing required fields. | User on Edit Profile. | Username: "" (Empty) | 1. Click "Edit Profile".<br>2. Clear Username field.<br>3. Click "Save". | Save button disabled or Error toast appears.<br>Changes not saved. | Not tested |
| **FE-Profile-04** | **Change Password - Mismatch (Fail)** | Verify error when new password is too short. | User on Profile page. | Password: "short" | 1. Click "Change Password".<br>2. Enter "short" in field.<br>3. Click "Update". | Toast "Invalid Password" (min 6 chars) appears.<br>Request not sent. | Not tested |
| **FE-Profile-05** | **Delete Account** | Verify account deletion flow. | **Test account only**. | Confirmation | 1. Click "Delete Account".<br>2. Accept confirmation.<br>3. Verify redirect. | Redirected to Login.<br>Account deleted. | Not tested |

## 3. Scenarios & Simulation

| ID | Scenario | Description | Pre-requisites | Input | Execution Steps | Expected Behavior | Status |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **FE-Scen-01** | **Complete Questionnaire - Pass** | Verify passing questionnaire unlocks simulation. | User on Questionnaire step. | Correct Answers | 1. Navigate to Scenario.<br>2. Answer correctly.<br>3. Click Submit. | "Questionnaire Passed" toast.<br>Simulation unlocks. | Not tested |
| **FE-Scen-02** | **Complete Questionnaire - Fail** | Verify failing questionnaire keeps simulation locked. | User on Questionnaire step. | Incorrect Answers | 1. Navigate to Scenario.<br>2. Answer incorrectly.<br>3. Click Submit. | Toast "Study More" appears.<br>Score < 90%.<br>Simulation stays locked. | Not tested |
| **FE-Sim-01** | **Launch Simulation - Success** | Verify successful simulation launch. | Simulation unlocked. | Click "Launch" | 1. Go to Simulation tab.<br>2. Click "Launch Simulation".<br>3. Wait for start. | "Simulation Starting" toast.<br>Consoles appear. | Not tested |
| **FE-Sim-02** | **Launch Simulation - Locked (Fail)** | Verify locked simulation cannot be started. | User has not passed questionnaire. | Attempt to click | 1. Go to Simulation tab (locked state).<br>2. Verify "Launch" button is disabled or hidden. | Lock icon visible.<br>Button disabled or prompts to take questionnaire. | Not tested |
| **FE-Sim-03** | **Stop Simulation** | Verify stopping a running simulation. | Simulation running. | Click "Terminate" | 1. Click "Terminate Simulation". | "Simulation Stopped" toast.<br>UI resets. | Not tested |

## 4. Admin Dashboard

| ID | Scenario | Description | Pre-requisites | Input | Execution Steps | Expected Behavior | Status |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **FE-Admin-01** | **Access Admin - Authorized** | Verify Admin Dashboard loads for admin. | Role: 'admin' | None | 1. Log in as admin.<br>2. Go to http://localhost:3000/admin | Dashboard loads.<br>Admin content visible. | Not tested |
| **FE-Admin-02** | **Access Admin - Unauthorized (Fail)** | Verify non-admins are blocked. | Role: 'user' | None | 1. Log in as regular user.<br>2. Go to http://localhost:3000/admin | Redirected to Dashboard.<br>"Access Denied" toast appears. | Not tested |
| **FE-Admin-03** | **Cluster Refresh - Error (Fail)** | Verify handling of cluster connection failure. | Cluster service down/unreachable. | Click "Refresh" | 1. Admin Dashboard.<br>2. Click "Refresh State".<br>3. Simulate network error. | Toast "Refresh Failed" appears.<br>Error UI state shown on cards. | Not tested |
