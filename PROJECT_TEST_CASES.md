# CyberRange Project - Comprehensive Test Documentation

## 1. Test Strategy
**Objective:**
To ensure the CyberRange platform is robust, secure, and functionally correct across all microservices, frontend interfaces, and simulation orchestrations. The goal is to deliver a stable learning environment for students and a reliable management console for administrators.

**Scope:**
- **Frontend:** React/Next.js application (Student Dashboard, Admin Panel, Scenario UI).
- **Backend:** NestJS Microservices (Gateway, User, Scenario, Simulation).
- **Infrastructure:** Kubernetes Cluster (Pod lifecycle, Networking, Autoscaling).
- **Security:** Authentication, Authorization, and Container Isolation.

**Tools:**
- **Unit/Integration:** Jest
- **E2E/Functional:** Katalon Studio / Playwright
- **API Testing:** Postman / Insomnia
- **Load Testing:** k6 / JMeter
- **Bug Tracking:** Jira / GitHub Issues

**Environment:**
- **Development:** Local Docker/Minikube setup.
- **Staging:** Mirror of production with mocked simulation limits.
- **Production:** Live K8s cluster.

---

## 2. Test Plan
**Roadmap:**
1.  **Unit Testing Phase:** Validate individual service methods and components.
2.  **Integration Testing Phase:** Verify Gateway <-> Microservice communication and DB persistence.
3.  **System Testing:** End-to-end user flows (Register -> Launch Scenario -> Complete -> Score).
4.  **UAT (User Acceptance Testing):** Validation by non-dev stakeholders.

**Schedule (Sample):**
- **Week 1:** Unit & Integration tests for Auth & User services.
- **Week 2:** Simulation orchestration & K8s integration tests.
- **Week 3:** Frontend E2E flows & Dashboard visualization.
- **Week 4:** Security & Load testing + Bug fixes.

**Criteria for Success:**
- 100% Pass rate for Critical/Blocker test cases.
- >90% Pass rate for High priority test cases.
- Zero open Critical defects.
- Code coverage > 70%.

---

## 3. Test Scenarios (Functional & Non-Functional)

### 3.1 Authentication & Session (AUTH)
| ID | Title | Description | Priority |
|----|-------|-------------|----------|
| **TC-AUTH-01** | User Registration | Register a new student/trainee account. | Critical |
| **TC-AUTH-02** | Login Success | Authenticate with valid credentials. | Critical |
| **TC-AUTH-03** | Login Failure | Authenticate with invalid credentials. | High |
| **TC-AUTH-04** | JWT Validation | Access protected route with valid/invalid token. | High |
| **TC-AUTH-05** | Role-Based Access | Student attempt to access `/admin` page. | Medium |

### 3.2 Student Dashboard (DASH)
| ID | Title | Description | Priority |
|----|-------|-------------|----------|
| **TC-DASH-01** | Completion Rate | Calculate percentage of completed vs total scenarios. | Medium |
| **TC-DASH-02** | Recent Activity | List latest scenario attempts and simulations. | Low |
| **TC-DASH-03** | Recommended Scenarios| Filter scenarios not yet completed by the user. | Low |
| **TC-DASH-04** | Active Simulations | Display currently running K8s simulation pods. | High |

### 3.3 Scenarios & Questionnaires (SCEN)
| ID | Title | Description | Priority |
|----|-------|-------------|----------|
| **TC-SCEN-01** | Command Validation | Input exact terminal command (e.g., `nmap -sV`). | Critical |
| **TC-SCEN-02** | Regex Match | Input command matching pattern (e.g., any `ping` cmd). | High |
| **TC-SCEN-03** | Hint System | Interacting with incorrect inputs multiple times. | Low |
| **TC-SCEN-04** | Unlock Simulation | Reach >= 90% score on questionnaire. | High |
| **TC-SCEN-05** | Progress Persistence| Start scenario, logout, and login again. | High |

### 3.4 Simulation Management (SIM)
| ID | Title | Description | Priority |
|----|-------|-------------|----------|
| **TC-SIM-01** | Launch Simulation | Start a scenario from the UI. | Critical |
| **TC-SIM-02** | Stop Simulation | Termination of a running simulation. | Critical |
| **TC-SIM-03** | Reset Simulation | Full purge and restart of scenario resources. | Medium |
| **TC-SIM-04** | Log Streaming | Viewing real-time pod logs in the browser. | High |
| **TC-SIM-05** | Perspective Toggle| Switch between Attacker and Victim logs. | Medium |

### 3.5 Attack Simulations (ATK)
| ID | Title | Description | Priority |
|----|-------|-------------|----------|
| **TC-ATK-01** | Credential Stuffing | Bot-sim cycles through `bot_attempts.csv` list. | High |
| **TC-ATK-02** | DDoS (HOIC) | Stress-test victim with 100+ threads. | High |
| **TC-ATK-03** | Reconnaissance | Infiltration-sim Stage 1 (Port scanning). | Medium |
| **TC-ATK-04** | Exploitation | Infiltration-sim Stage 2 (RCE Payload). | High |
| **TC-ATK-05** | Data Exfiltration | Infiltration-sim Stage 4 (Stealing DB dumps). | Critical |

### 3.6 ML & Defensive Logic (DEF)
| ID | Title | Description | Priority |
|----|-------|-------------|----------|
| **TC-DEF-01** | Sidecar Injection | Check pod spec of juice-shop after launch. | High |
| **TC-DEF-02** | Real-time Prediction| Trigger attack and check IDS status. | Critical |
| **TC-DEF-03** | Telemetry Viz | Monitor live charts during active simulation. | Medium |

### 3.7 Admin Dashboard (ADM)
| ID | Title | Description | Priority |
|----|-------|-------------|----------|
| **TC-ADM-01** | User Management | Admin lists all users in the system. | High |
| **TC-ADM-02** | Force Reset Pwd | Admin resets a student’s password via UI. | Medium |
| **TC-ADM-03** | Delete Student | Admin removes a user account. | High |
| **TC-ADM-04** | Cluster Health | View Kubernetes pod phases across simulation. | Medium |
| **TC-ADM-05** | Audit Trail | Review login history CSV/Database. | Low |

---

## 4. Test Case (Detailed Example)

**ID:** TC-SCEN-01 (Command Validation)
**Objective:** Verify that the terminal correctly accepts and validates specific user commands.

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to Scenario 1 | Scenario loads with terminal interface. | | |
| 2 | Click "Start Scenario" | Terminal becomes active, prompt appears. | | |
| 3 | Type `whoami` (Incorrect) | Terminal output: "Incorrect command. Try identifying network services." | | |
| 4 | Type `nmap -sV 10.0.0.5` | Terminal output: "Starting Nmap..." followed by success message. Progress bar increments. | | |
| 5 | Check Progress | Progress bar shows 25\% completion. | | |

---

## 5. Defect Triage Matrix

| Severity \ Priority | **P1 - Critical** | **P2 - High** | **P3 - Medium** | **P4 - Low** |
|---------------------|-------------------|---------------|-----------------|--------------|
| **S1 - Blocker**    | Immediate Fix     | Immediate Fix | N/A             | N/A          |
| **S2 - Critical**   | Next Release      | Next Release  | Next Release    | N/A          |
| **S3 - Major**      | Next Release      | Backlog       | Backlog         | Backlog      |
| **S4 - Minor**      | Backlog           | Backlog       | Backlog         | Won't Fix    |

**Definitions:**
- **Blocker:** System unusable, data loss, security breach.
- **Critical:** Core feature broken, no workaround.
- **Major:** Feature broken, workaround exists.
- **Minor:** UI/Cosmetic issue.

---

## 6. Sample Bug Report

**Defect ID:** BUG-102
**Title:** Progress not persisting after logout
**Status:** Open
**Severity:** S2 - Critical
**Priority:** P1 - Critical
**Reported By:** QA Lead
**Date:** 2025-12-28

**Description:**
When a user completes 50% of a scenario, logs out, and logs back in, their progress resets to 0%.

**Preconditions:**
1. User is registered and logged in.
2. User has started Scenario ID: `SQL-Injection-01`.

**Steps to Reproduce:**
1. Navigate to `/scenarios/sql-injection-01`.
2. Complete Step 1 and Step 2.
3. Verify progress bar shows 50%.
4. Click Logout.
5. Log back in with the same credentials.
6. Navigate back to `/scenarios/sql-injection-01`.

**Expected Result:**
Progress bar should show 50%, and User should resume at Step 3.

**Actual Result:**
Progress bar shows 0%, and User is at Step 1.

**Environment:**
Staging, Chrome 120.0, Windows 11.

---

## 7. Software Release Notes
**Version:** v1.0.2-beta
**Release Date:** 2025-12-30

**Summary:**
This release focuses on stabilizing the progress persistence layer and updating the student dashboard UI.

**New Features:**
- Added `mx-auto` centering to Dashboard and Profile pages.
- Implemented global `Navbar` component.
- Added 3 new realistic scenarios to the database.

**Bug Fixes:**
- [FIXED] BUG-102: Progress now saves correctly to MongoDB on step completion.
- [FIXED] Landing page alignment issues in "Features" section.

**Known Issues:**
- Real-time logs may delay by 2-3 seconds under heavy load (ticket #405).

---

## 8. Status Report (Weekly)
**Project:** CyberRange
**Period:** Dec 22 - Dec 28
**Status:** GREEN

**Key Accomplishments:**
- Comprehensive test cases documented.
- Dashboard frontend integration completed.
- Progress persistence bug resolved.

**Upcoming Tasks (Next Week):**
- Execute Load Test on Simulation Service (`k6` script).
- Finalize Admin Dashboard User Management UI.

**Risks/Blockers:**
- None currently.

---

## 9. Test Summary Report
**Execution Date:** 2025-12-28
**Scope:** Functional Regression (Auth + Scenarios)

**Summary:**
| Total Cases | Passed | Failed | Blocked | Pass Rate |
|-------------|--------|--------|---------|-----------|
| 35          | 34     | 1      | 0       | 97%       |

**Failed Cases:**
- TC-SIM-04: Log Streaming showed Intermittent connection error (Simulated).

**Conclusion:**
Build is stable for Staging deployment. The failed case is non-blocking for core functionality.

---

## 10. Test Scripts (Katalon/Pseudo-code)

**Script ID:** KS-01-LoginFlow
**Feature:** Authentication

```groovy
import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

// 1. Open Browser
WebUI.openBrowser('')
WebUI.navigateToUrl('http://localhost:3000/auth/login')

// 2. Input Credentials
WebUI.setText(findTestObject('Object Repository/Page_Login/input_email'), 'student@test.com')
WebUI.setEncryptedText(findTestObject('Object Repository/Page_Login/input_password'), 'encrypted_password_here')

// 3. Click Login
WebUI.click(findTestObject('Object Repository/Page_Login/btn_login'))

// 4. Verify Dashboard
WebUI.verifyElementPresent(findTestObject('Object Repository/Page_Dashboard/h1_Welcome'), 5)
WebUI.verifyElementText(findTestObject('Object Repository/Page_Dashboard/h1_Welcome'), 'Welcome back, student!')

// 5. Close
WebUI.closeBrowser()
```

---

## 11. Test Execution Reports
(Generated Instance Example)

**Execution ID:** EXEC-20251228-001
**Tester:** Wael
**Time:** 20:30 UTC

**Results:**
- **[PASS]** TC-AUTH-01: User Registration
- **[PASS]** TC-AUTH-02: Login Success
- **[PASS]** TC-DASH-01: Completion Rate
- **[PASS]** TC-SCEN-01: Command Validation
- **[FAIL]** TC-SIM-04: Log Streaming
    - *Note:* Connection timeout after 5000ms.

---

## 12. Documentation
**Overview:**
This documentation repository contains all artifacts related to the Quality Assurance of CyberRange. Use the `Test Scripts` in the `katalon/` directory to run automated suites.

**User Manual for Executing Tests:**
1.  **Prerequisites:** Install Katalon Studio, Node.js, and Java JDK.
2.  **Configuration:** Update `Profiles/default` in Katalon with your correct `BaseURL` (e.g., `http://localhost:3000`).
3.  **Running:**
    - Open `CyberRange.prj`.
    - Select `Test Suites/RegressionSuite`.
    - Click `Run` (Chrome/Firefox).
4.  **Reporting:**
    - After execution, navigate to `Reports/` folder.
    - Open `HTML` report to view pass/fail metrics.
