# Comprehensive Test Scenarios (UI/Black-Box Testing)

This document outlines the high-level test scenarios for the CyberRange platform, using the project's standard template.

## 1. Authentication
| S. No | TS ID | TEST SCENARIO | PRE CONDITION | POST CONDITION | PRIORITY | COMMENTS |
|:---|:---|:---|:---|:---|:---|:---|
| 1 | **TS-AUTH-01** | Verify successful user registration with valid credentials. | User is not logged in. | Redirected to Login page. Account created in DB. | High | Positive |
| 2 | **TS-AUTH-02** | Verify registration block when using an existing email address. | Email address already exists in the system. | User remains on Signup page. Error message displayed. | Medium | Negative |
| 3 | **TS-AUTH-03** | Verify form validation for invalid email formats and weak passwords. | Signup page open. | Form prevents submission. Inline errors shown. | Medium | Negative |
| 4 | **TS-AUTH-04** | Verify that signup is prohibited when mandatory fields are left empty. | Signup page open. | Submit button disabled or required markers shown. | Medium | Negative |
| 5 | **TS-AUTH-05** | Verify registration block when using an existing username. | Username already exists in the system. | User remains on Signup page. Error message displayed. | Medium | Negative |
| 6 | **TS-AUTH-06** | Verify successful user login with correct credentials. | User account exists. | Redirected to Dashboard. Session cookie/token set. | High | Positive |
| 7 | **TS-AUTH-07** | Verify login failure when providing an incorrect password. | User account exists. | Error toast shown. User stays on Login page. | High | Negative |
| 8 | **TS-AUTH-08** | Verify login failure when providing an unregistered username. | Username does not exist. | Error toast shown. User stays on Login page. | High | Negative |
| 9 | **TS-AUTH-10** | Verify session termination when JWT token is invalid/missing. | User is on a protected route. | Access revoked. Redirected to Login page. | High | Security |
| 10 | **TS-AUTH-11** | Verify that 'student' users cannot access admin routes. | User logged in as student. | Access Denied toast. Redirected to /dashboard. | High | Role-Based |

## 2. User Profile & Progress
| S. No | TS ID | TEST SCENARIO | PRE CONDITION | POST CONDITION | PRIORITY | COMMENTS |
|:---|:---|:---|:---|:---|:---|:---|
| 1 | **TS-PROF-01** | Verify that the user profile displays correct personal details. | User logged in. Profile page accessed. | Correct ID, Email, and Role visible. | Medium | Positive |
| 2 | **TS-PROF-02** | Verify that a user can successfully update their username. | User on Profile page. | Toast "Profile Updated". New name persists. | Medium | Positive |
| 3 | **TS-PROF-03** | Verify that updating a profile fails if required fields are empty. | Edit Profile mode active. | Changes not saved. Validation error shown. | Low | Negative |
| 4 | **TS-PROF-04** | Verify that a user can successfully change their password. | User on Profile page. | Toast "Password Updated". Old password invalid. | High | Security |
| 5 | **TS-PROF-05** | Verify rejected password updates due to security requirements. | Change Password modal open. | Error message "Invalid Password" shown. | Medium | Negative |
| 6 | **TS-PROF-06** | Verify that a user can successfully update their email. | User on Profile page. | Toast "Email Updated". New email visible. | Medium | Positive |
| 7 | **TS-PROF-07** | Verify rejected email updates if invalid or duplicate. | Edit Profile mode active. | Changes not saved. Error toast shown. | Medium | Negative |
| 8 | **TS-PROF-08** | Verify the end-to-end account deletion flow. | User on Profile page. | Session ended. Account removed from system. | Medium | Destructive |
| 9 | **TS-PROG-01** | Verify progress dashboard reflections of scores/levels. | User has completed scenarios. | Statistics updated in UI charts/cards. | Low | Positive |

## 3. Scenarios & Simulation
| S. No | TS ID | TEST SCENARIO | PRE CONDITION | POST CONDITION | PRIORITY | COMMENTS |
|:---|:---|:---|:---|:---|:---|:---|
| 1 | **TS-SCEN-01** | Verify list of training scenarios loads and displays correctly. | User logged in. | Scenarios grid visible with titles/desc. | High | Positive |
| 2 | **TS-SCEN-02** | Verify scenario specific details and questionnaire load. | Scenarios list visible. | Redirected to details. UI elements active. | High | Positive |
| 3 | **TS-SCEN-03** | Verify questionnaire pass unlocks associated simulation. | User on questionnaire. | "Questionnaire Passed". Simulation tab active. | High | Logic |
| 4 | **TS-SCEN-04** | Verify questionnaire failure keeps simulation locked. | User on questionnaire. | "Study More" toast. Simulation stays locked. | High | Negative |
| 5 | **TS-SCEN-05** | Verify functionality to retry a failed questionnaire. | Questionnaire failed. | Form reset. Input fields cleared/enabled. | Medium | Positive |
| 6 | **TS-SIM-01** | Verify successful launch and initialization of a simulation. | Questionnaire passed. | Consoles appear. Status set to "Running". | High | Integration |
| 7 | **TS-SIM-02** | Verify launch prevention without passing questionnaire. | User hasn't attempted questionnaire. | Launch button disabled/hidden. Lock icon on. | High | Negative |
| 8 | **TS-SIM-03** | Verify termination and reset of a running simulation. | Simulation is "Running". | Resources cleaned. UI reset to start state. | Medium | Cleanup |

## 4. Admin Dashboard
| S. No | TS ID | TEST SCENARIO | PRE CONDITION | POST CONDITION | PRIORITY | COMMENTS |
|:---|:---|:---|:---|:---|:---|:---|
| 1 | **FE-Admin-01** | Verify authorized admins can access Admin Operations (Access Admin-Authorized). | User logged in as 'admin'. | Admin dashboard items (K8s, Users) visible. | High | Positive |
| 2 | **FE-Admin-02** | Verify blocked access for non-admin users (Access Admin - Unauthorized (Fail)). | User logged in as 'student'. | Navigates to /admin -> Redirected to home. | High | Security |
| 3 | **FE-Admin-03** | Verify monitoring of cluster health and pod details (View Cluster Health and Expand Pods). | Admin dashboard open. | Pod cards show status/ready state. Labels visible. | Medium | Metrics |
| 4 | **FE-Admin-04** | Verify UI resilience when cluster connection fails (Cluster Refresh - Error (Fail)). | Backend health service down. | Error card shown with "Retry" option. | Low | Negative |
| 5 | **FE-Admin-05** | Verify viewing list of users and their expanded details (List Users and Expand Details). | Multiple users in DB. | Table rows expand to show ID/Joined Date. | Medium | Positive |
| 6 | **FE-Admin-06** | Verify admin can delete a user account (Delete User). | User to be deleted exists. | User row removed. Success toast appears. | Medium | Destructive |
| 7 | **FE-Admin-07** | Verify visibility and accuracy of system audit logs (View Audit Logs). | Activity (Logins) recorded. | Activity table populated with timestamp/user. | Medium | Audit |
| 8 | **FE-Admin-08** | Verify admin's ability to force-reset a user's password (Reset User Password). | Target user exists. | User's credentials updated in backend. | Medium | Positive |
| 9 | **FE-Admin-09** | Verify prevention of administrative account deletion (Delete Admin (Prevention) (Fail)). | User is an 'admin'. | Delete button disabled in User Management. | High | Protection |
| 10 | **FE-Admin-10** | Verify constraints on the admin password reset tool (Reset Password - Validation (Fail)). | Password reset modal open. | Error on short password. Submission blocked. | Medium | Negative |
| 11 | **FE-Admin-11** | Verify cancel functionality in administrative modals (Delete User - Cancel Action). | Delete/Reset modal open. | Modal closed. No state change performed. | Low | Integrity |
| 12 | **FE-Admin-12** | Verify UI behavior when audit logs are empty (View Audit Logs - No Activity). | No records in audit DB. | "No records found" placeholder visible. | Low | UX |

## 5. General & Navigation
| S. No | TS ID | TEST SCENARIO | PRE CONDITION | POST CONDITION | PRIORITY | COMMENTS |
|:---|:---|:---|:---|:---|:---|:---|
| 1 | **TS-NAV-01** | Verify navigation menu responsiveness (Mobile/Desktop). | Responsive testing active. | Hamburger menu toggles. Grid layout shifts. | Medium | UI/UX |
| 2 | **TS-NAV-02** | Verify 404 error page for non-existent routes. | Invalid URL entered. | Custom 404 UI visible. "Go Home" button active. | Low | UX |
