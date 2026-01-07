# CyberRange Testing Documentation & Katalon User Manual

**Version:** 1.0  
**Date:** 2026-01-04  
**Project:** CyberRange Cybersecurity Training Platform

---

## Table of Contents

**Part I: Testing Documentation**
1. [Executive Summary](#1-executive-summary)
2. [Test Environment Configuration](#2-test-environment-configuration)
3. [Detailed Test Scenarios](#3-detailed-test-scenarios)
4. [Test Scripts Repository](#4-test-scripts-repository)
5. [Configuration Reference](#5-configuration-reference)
6. [Test Data Management](#6-test-data-management)

**Part II: Katalon Studio User Manual**
7. [Getting Started with Katalon](#7-getting-started-with-katalon)
8. [Executing Tests](#8-executing-tests)
9. [Test Suite Organization](#9-test-suite-organization)
10. [Troubleshooting Guide](#10-troubleshooting-guide)
11. [Quick Reference](#11-quick-reference)

---

# Part I: Testing Documentation

## 1. Executive Summary

### 1.1 Project Overview

CyberRange is a comprehensive cybersecurity training platform that combines:
- **Frontend**: Next.js 15 with React, Tailwind CSS, real-time WebSocket communication
- **Backend**: NestJS microservices architecture with MongoDB
- **Infrastructure**: Kubernetes-based simulation orchestration
- **ML/IDS**: XGBoost-powered intrusion detection system

### 1.2 Testing Objectives

- Ensure secure authentication and authorization (JWT, RBAC)
- Validate simulation accuracy and reliability
- Guarantee system stability under load
- Maintain comprehensive audit trails

### 1.3 Current Testing Status

| Metric | Value |
|--------|-------|
| **Total Test Cases** | 38 |
| **Automated (Katalon)** | 11 (29%) |
| **Manual Tests** | 27 (71%) |
| **Test Pass Rate** | 100% |
| **Requirements Coverage** | 100% (22/22) |
| **Defects Identified** | 14 |
| **Defects Resolved** | 14 (100%) |

### 1.4 Testing Approach

- **Unit Testing**: Backend services, frontend components
- **Integration Testing**: API Gateway ↔ Microservices
- **System Testing**: End-to-end workflows
- **Security Testing**: Authentication, authorization, input validation
- **Performance Testing**: Concurrent users, simulation load

---

## 2. Test Environment Configuration

### 2.1 Hardware Requirements

**Minimum Specifications:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB SSD

**Recommended for Testing:**
- CPU: 8 cores
- RAM: 16GB
- Storage: 100GB SSD

### 2.2 Software Requirements

| Component | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18.x+ | Frontend & Backend runtime |
| **MongoDB** | 6.0+ | Database |
| **Docker Desktop** | Latest | Containerization |
| **Kubernetes** | 1.28+ | Orchestration (Minikube/Cloud) |
| **Katalon Studio** | 9.x | UI automation |
| **Chrome** | 120+ | Browser testing |
| **Firefox** | 120+ | Browser testing |
| **Edge** | 120+ | Browser testing |

### 2.3 Environment Setup

#### Development Environment
```bash
# Clone repository
git clone https://github.com/mohdmwk33112/CyberRange.git
cd CyberRange

# Backend setup
cd backend/microservices && npm install
cd ../api-gateway && npm install

# Frontend setup
cd ../../frontend && npm install

# Start MongoDB (local)
mongod --dbpath ./data/db

# Start services
npm run dev  # In each service directory
```

#### Katalon Test Project Location
- **Path**: `d:\Work\University\Semester 7\CS425\Project\CyberRange\New folder\Tests`
- **Project File**: `Tests.prj`

### 2.4 Test URLs

| Environment | Base URL |
|-------------|----------|
| **Development** | `http://localhost:3000` |
| **Test** | `http://test.cyberrange.local:3000` |
| **Staging** | `https://staging.cyberrange.com` |

---

## 3. Detailed Test Scenarios

### 3.1 Authentication & Authorization (11 Test Cases)

#### FE-Sign-01: User Signup - Successful
- **Priority**: Critical | **Status**: Automated (Katalon)
- **Description**: Verify new user registration
- **Preconditions**: User not logged in
- **Test Data**: 
  - Username: `tester` (unique)
  - Email: `test@example.com` (unique)
  - Password: `Password1!`
- **Steps**:
  1. Navigate to `/auth/signup`
  2. Enter valid credentials
  3. Click "Sign Up"
- **Expected**: Redirect to login page, success toast appears

#### FE-Sign-02: Signup - Existing Email (Fail)
- **Priority**: Critical | **Status**: Automated (Katalon)
- **Expected**: Error "Email already exists", remain on signup page

#### FE-Sign-03: Signup - Invalid Input (Fail)
- **Priority**: High | **Status**: Automated (Katalon)
- **Test Data**: Email: `invalid`, Password: `123`
- **Expected**: Inline validation errors, form blocked

#### FE-Sign-04: Signup - Empty Fields (Fail)
- **Priority**: High | **Status**: Automated (Katalon)
- **Expected**: "Required" indicators shown

#### FE-Sign-05: Signup - Existing Username (Fail)
- **Priority**: High | **Status**: Manual
- **Expected**: Error "Username already taken"

#### FE-Login-01: Login Success
- **Priority**: Critical | **Status**: Automated (Katalon)
- **Test Data**: Valid credentials
- **Expected**: Redirect to `/dashboard`, session established

#### FE-Login-02: Login - Invalid Credentials (Fail)
- **Priority**: High | **Status**: Automated (Katalon)
- **Expected**: Error toast "Invalid credentials"

#### FE-Login-03: Login - Invalid Username (Fail)
- **Priority**: High | **Status**: Automated (Katalon)

#### FE-Login-04: Login - Empty Fields (Fail)
- **Priority**: High | **Status**: Automated (Katalon)

#### FE-AUTH-01: JWT Validation
- **Priority**: High | **Status**: Automated (Katalon)
- **Steps**:
  1. Clear localStorage `auth-storage`
  2. Refresh page
- **Expected**: Auto redirect to login

#### FE-AUTH-02: Role-Based Access
- **Priority**: High | **Status**: Automated (Katalon)
- **Steps**: Student navigates to `/admin`
- **Expected**: Redirect to `/dashboard`, "Access Denied" toast

### 3.2 User Profile & Progress (10 Test Cases)

#### FE-Profile-01 to FE-Profile-08
- Profile viewing, username/email/password updates, account deletion
- **Status**: Manual testing

#### FE-Prog-01: View Progress
- Display training progress with scores/levels

#### FE-Prog-02: View Active Simulations
- Show running simulations with "Running" status

### 3.3 Scenarios & Questionnaires (8 Test Cases)

#### FE-Scen-01: View All Scenarios
- **Priority**: High | **Status**: Automated
- **Expected**: Grid/list of scenarios with titles and descriptions

#### FE-Scen-02: View Scenario Details
- **Expected**: Redirect to scenario page with instructions

#### FE-Scen-03: Complete Questionnaire - Pass
- **Test Data**: Correct answers (≥90% score)
- **Expected**: "Questionnaire Passed" toast, simulation unlocks

#### FE-Scen-04: Complete Questionnaire - Fail
- **Test Data**: Incorrect answers (<90% score)
- **Expected**: "Study More" toast, simulation locked

#### FE-Scen-05: Reset Questionnaire
- **Expected**: Form resets, retry allowed

### 3.4 Simulation Management (8 Test Cases)

#### FE-Sim-01: Launch Simulation - Success
- **Priority**: Critical | **Status**: Automated
- **Steps**:
  1. Navigate to Simulation tab
  2. Click "Launch Simulation"
  3. Wait for start
- **Expected**: "Simulation Starting" toast, consoles appear, status "Running"

#### FE-Sim-02: Launch Simulation - Locked (Fail)
- **Expected**: Button disabled or hidden

#### FE-Sim-03: Stop Simulation
- **Steps**: Click "Terminate Simulation"
- **Expected**: "Simulation Stopped" toast, UI resets

### 3.5 Admin Dashboard (7 Test Cases)

#### FE-Admin-01: Access Admin - Authorized
- **Priority**: Critical | **Status**: Automated
- **Preconditions**: Role = 'admin'
- **Expected**: Dashboard UI visible, K8s pods displayed

#### FE-Admin-02: Access Admin - Unauthorized (Fail)
- **Preconditions**: Role = 'student'
- **Expected**: Redirect to `/dashboard`, "Access Denied" toast

#### FE-Admin-03 to FE-Admin-07
- Cluster health, pod expansion, user management, deletion, audit logs
- **Mix of automated and manual**

---

## 4. Test Scripts Repository

### 4.1 Katalon Project Structure

```
New folder/Tests/
├── Test Cases/
│   ├── Authentication/ (12 test cases)
│   ├── Admin Dashboard/ (7 test cases)
│   ├── Profile/ (9 test cases)
│   ├── Scenarios/ (5 test cases)
│   ├── Simulation/ (3 test cases)
│   └── ...
├── Test Suites/
│   ├── Authentication.ts
│   ├── Admin Dashboard.ts
│   ├── Profile.ts
│   └── ...
├── Object Repository/
├── Keywords/
├── Profiles/
│   └── default.glbl
└── Tests.prj
```

### 4.2 Complete Katalon Scripts

#### Helper Function (Use in All Scripts)

```groovy
import com.kms.katalon.core.testobject.TestObject
import com.kms.katalon.core.testobject.ConditionType
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

// Dynamic TestObject creator
TestObject makeTO(String xpath) {
    TestObject to = new TestObject()
    to.addProperty("xpath", ConditionType.EQUALS, xpath)
    return to
}
```

#### TC-AUTH-01: User Registration

```groovy
WebUI.openBrowser('')
WebUI.navigateToUrl('http://localhost:3000/auth/signup')
WebUI.maximizeWindow()

// Wait for page load
TestObject usernameInput = makeTO("//input[@id='username']")
WebUI.waitForElementVisible(usernameInput, 10)

// Enter unique credentials
WebUI.setText(usernameInput, 'newuser_' + System.currentTimeMillis())
WebUI.setText(makeTO("//input[@id='email']"), 'user' + System.currentTimeMillis() + '@test.com')
WebUI.setText(makeTO("//input[@id='password']"), 'Password123!')

// Submit
WebUI.click(makeTO("//button[@type='submit']"))

// Verify redirect to login
TestObject loginHeader = makeTO("//h3[contains(text(), 'Login')] | //div[contains(text(), 'Login')]")
WebUI.waitForElementVisible(loginHeader, 10)

WebUI.closeBrowser()
```

#### TC-AUTH-02: Login Success

```groovy
WebUI.openBrowser('')
WebUI.navigateToUrl('http://localhost:3000/auth/login')
WebUI.maximizeWindow()

WebUI.waitForElementVisible(makeTO("//input[@id='username']"), 10)

WebUI.setText(makeTO("//input[@id='username']"), 'student@test.com')
WebUI.setText(makeTO("//input[@id='password']"), 'password123')
WebUI.click(makeTO("//button[@type='submit']"))

// Verify dashboard
WebUI.waitForElementVisible(makeTO("//*[contains(text(), 'Welcome back')]"), 15)

WebUI.closeBrowser()
```

#### TC-AUTH-03: Login Failure

```groovy
WebUI.openBrowser('')
WebUI.navigateToUrl('http://localhost:3000/auth/login')
WebUI.waitForElementVisible(makeTO("//input[@id='username']"), 10)

WebUI.setText(makeTO("//input[@id='username']"), 'student@test.com')
WebUI.setText(makeTO("//input[@id='password']"), 'WRONG_PASSWORD')
WebUI.click(makeTO("//button[@type='submit']"))

// Verify error
WebUI.waitForElementVisible(makeTO("//*[contains(text(), 'Invalid credentials')]"), 10)

WebUI.closeBrowser()
```

#### TC-SCEN-01: Terminal Command Validation

```groovy
WebUI.navigateToUrl('http://localhost:3000/scenarios/1')
WebUI.maximizeWindow()
WebUI.delay(2)

// Navigate to Questionnaire
TestObject questionnaireTab = makeTO("//span[contains(text(), 'Questionnaire')]")
WebUI.click(questionnaireTab)

// Locate terminal input
TestObject terminalInput = makeTO("//input[@placeholder='Type your command here...']")
WebUI.waitForElementVisible(terminalInput, 10)

// Enter command
WebUI.setText(terminalInput, 'nmap -sV target')
WebUI.sendKeys(terminalInput, Keys.chord(Keys.ENTER))

// Verify output
TestObject terminalOutput = makeTO("//div[contains(@class, 'font-mono') and contains(., 'Starting Nmap')]")
WebUI.verifyElementPresent(terminalOutput, 5)

WebUI.closeBrowser()
```

#### TC-SIM-01: Launch Simulation

```groovy
WebUI.navigateToUrl('http://localhost:3000/scenarios/1')
WebUI.delay(3)

TestObject launchBtn = makeTO("//button[contains(., 'Launch Simulation')]")
WebUI.click(launchBtn)

// Wait for launching state
TestObject launchingState = makeTO("//*[contains(., 'Launching...')]")
WebUI.verifyElementPresent(launchingState, 5)

// Wait for running state
TestObject terminateBtn = makeTO("//button[contains(., 'Terminate Simulation')]")
WebUI.waitForElementVisible(terminateBtn, 60)

println "Simulation successfully launched."
```

#### TC-SIM-02: Stop Simulation

```groovy
TestObject terminateBtn = makeTO("//button[contains(., 'Terminate Simulation')]")
WebUI.click(terminateBtn)

WebUI.waitForElementVisible(makeTO("//*[contains(., 'Simulation Stopped')]"), 10)
```

#### TC-ADM-01: User Management

```groovy
WebUI.navigateToUrl('http://localhost:3000/admin')
WebUI.maximizeWindow()
WebUI.delay(2)

// Click User Management tab
TestObject userTab = makeTO("//button[contains(text(), 'User Management')]")
WebUI.click(userTab)

// Verify table headers
WebUI.verifyElementPresent(makeTO("//th[contains(text(), 'Username')]"), 5)
WebUI.verifyElementPresent(makeTO("//th[contains(text(), 'Email')]"), 5)

// Count users
List<WebElement> rows = WebUI.findWebElements(makeTO("//tbody/tr"), 5)
println "Total Users: " + rows.size()
assert rows.size() > 0
```

### 4.3 XPath Selectors Reference

| Element | XPath | Page |
|---------|-------|------|
| Username Input | `//input[@id='username']` | Login, Signup |
| Email Input | `//input[@id='email']` | Signup |
| Password Input | `//input[@id='password']` | Login, Signup |
| Submit Button | `//button[@type='submit']` | Forms |
| Terminal Input | `//input[@placeholder='Type your command here...']` | Scenario |
| Launch Button | `//button[contains(., 'Launch Simulation')]` | Simulation |
| Terminate Button | `//button[contains(., 'Terminate Simulation')]` | Simulation |

---

## 5. Configuration Reference

### 5.1 Katalon Profiles

**Location**: `New folder/Tests/Profiles/default.glbl`

**Global Variables**:
```groovy
GlobalVariable.baseURL = 'http://localhost:3000'
GlobalVariable.adminEmail = 'admin@test.com'
GlobalVariable.adminPassword = 'admin123'
GlobalVariable.studentEmail = 'student@test.com'
GlobalVariable.studentPassword = 'password123'
GlobalVariable.timeout = 10
```

### 5.2 Browser Configuration

- **Default Browser**: Chrome
- **Supported**: Chrome, Firefox, Edge
- **Headless Mode**: Available for CI/CD
- **WebDriver**: Auto-updated by Katalon

### 5.3 Test Suite Configuration

Each test suite (.ts file) contains:
- Test case selection
- Execution order
- Retry configuration
- Email notifications setup

---

## 6. Test Data Management

### 6.1 Test Users

| Role | Username | Email | Password | Purpose |
|------|----------|-------|----------|---------|
| Admin | `admin` | `admin@test.com` | `admin123` | Admin testing |
| Student | `student` | `student@test.com` | `password123` | Student flow testing |
| Test User | `tester` | `tester@test.com` | `Test123!` | General testing |

### 6.2 Database Seeding

**MongoDB Seed Script**:
```javascript
// seed.js
use cyberrange;

db.users.insertMany([
  {
    username: "admin",
    email: "admin@test.com",
    password: "$2b$10$...", // hashed
    role: "admin",
    createdAt: new Date()
  },
  {
    username: "student",
    email: "student@test.com",
    password: "$2b$10$...", // hashed
    role: "student",
    createdAt: new Date()
  }
]);
```

### 6.3 Cleanup Procedures

**After Each Test Run**:
```bash
# Remove test users created during tests
mongo cyberrange --eval "db.users.deleteMany({username: /^newuser_/})"

# Clear test sessions
mongo cyberrange --eval "db.sessions.deleteMany({})"
```

---

# Part II: Katalon Studio User Manual

## 7. Getting Started with Katalon

### 7.1 System Requirements

- **OS**: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **Memory**: 4GB RAM minimum (8GB recommended)
- **Java**: JDK 8 or higher
- **Browser**: Chrome, Firefox, or Edge

### 7.2 Installing Katalon Studio

1. **Download**:
   - Visit: https://katalon.com/download
   - Choose "Katalon Studio" (Free version available)
   - Download for your OS

2. **Install**:
   - **Windows**: Run `.exe` installer
   - **macOS**: Open `.dmg` and drag to Applications
   - **Linux**: Extract `.tar.gz` and run `katalon`

3. **Activate**:
   - Create free Katalon account
   - Launch Katalon Studio
   - Sign in with your account

### 7.3 Opening the CyberRange Project

1. Launch Katalon Studio
2. Click **File → Open Project**
3. Navigate to: `d:\Work\University\Semester 7\CS425\Project\CyberRange\New folder\Tests`
4. Select `Tests.prj`
5. Click **Open**

**Expected Structure**:
- Test Cases folder with 10 subdirectories
- Test Suites folder with 12 suites
- Object Repository with 148 objects
- Profiles, Keywords, Data Files

---

## 8. Executing Tests

### 8.1 Running Individual Test Cases

**Method 1: Test Cases Explorer**
1. Expand **Test Cases** folder
2. Navigate to test category (e.g., `Authentication`)
3. Right-click test case (e.g., `TC-AUTH-01`)
4. Select **Run** → **Chrome**

**Method 2: Script Editor**
1. Open test case by double-clicking
2. Click **Run** button (▶) in toolbar
3. Select browser from dropdown

### 8.2 Running Test Suites

1. Expand **Test Suites** folder
2. Double-click suite (e.g., `Authentication.ts`)
3. Review test cases list
4. Click **Run** button
5. Select browser(s)

**Test Suite Options**:
- **Run Collection**: Execute all tests sequentially
- **Parallel Execution**: Run multiple browsers simultaneously (Enterprise)
- **Retry Failed Tests**: Auto-retry on failure

### 8.3 Browser Selection

Available browsers:
- **Chrome** (Recommended for development)
- **Firefox**
- **Edge**
- **Headless Chrome** (For CI/CD)

**To configure**:
1. Click Run dropdown
2. Select browser
3. For headless: Tools → Execution Preferences → Chrome (Headless)

### 8.4 Viewing Real-Time Execution

During test execution:
- **Log Viewer**: Bottom panel shows step-by-step logs
- **Browser Window**: Watch automation in real-time
- **Status Bar**: Shows progress (X/Y tests passed)

### 8.5 Reading Test Reports

**After Execution**:
1. Reports tab opens automatically
2. View summary: Pass/Fail/Error counts
3. Click failed test for details
4. View screenshots of failures
5. Export as HTML/PDF

**Report Location**: `New folder/Tests/Reports/YYYYMMDD_HHMMSS/`

---

## 9. Test Suite Organization

### 9.1 Authentication Test Suite

**File**: `Test Suites/Authentication.ts`  
**Test Cases**: 11  
**Coverage**: Signup, Login, JWT validation, RBAC

**Included Tests**:
- FE-Sign-01 to FE-Sign-05: Registration flows
- FE-Login-01 to FE-Login-04: Login variations
- FE-AUTH-01, FE-AUTH-02: Security validations

**Execution Time**: ~5-7 minutes

**Prerequisites**:
- CyberRange frontend running on localhost:3000
- MongoDB running and seeded
- Clean test database state

### 9.2 Admin Dashboard Test Suite

**File**: `Test Suites/Admin Dashboard.ts`  
**Test Cases**: 7  
**Coverage**: Admin access, user management, audit logs

**Included Tests**:
- FE-Admin-01 to FE-Admin-07

**Execution Time**: ~4-6 minutes

**Prerequisites**:
- Admin user exists in database
- Kubernetes cluster running (for cluster health tests)

### 9.3 Other Test Suites

| Suite | Test Cases | Focus | Runtime |
|-------|-----------|-------|---------|
| **Profile.ts** | 9 | User profile CRUD | 6-8 min |
| **Scenarios.ts** | 5 | Scenario viewing, questionnaires | 4-5 min |
| **Simulation.ts** | 5 | Simulation lifecycle | 8-10 min |

### 9.4 Regression Test Suite

**Recommended Execution**:
- After each code merge
- Before production deployment
- Weekly scheduled runs

**All Suites Combined**: ~30-40 minutes

---

## 10. Troubleshooting Guide

### 10.1 Common Errors

#### Error: "Element not found"

**Cause**: XPath selector not matching page element

**Solutions**:
1. Check if page loaded completely:
   ```groovy
   WebUI.delay(2) // Add before interaction
   WebUI.waitForPageLoad(10)
   ```
2. Verify XPath using Chrome DevTools:
   - Right-click element → Inspect
   - Console: `$x("//input[@id='username']")`
3. Update XPath if UI changed

#### Error: "Timeout waiting for element"

**Cause**: Element takes longer to appear

**Solution**:
```groovy
// Increase timeout
WebUI.waitForElementVisible(myElement, 20) // 20 seconds

// Or use explicit wait
WebUI.waitForElementPresent(myElement, 15)
```

#### Error: "WebDriver not found"

**Cause**: Browser driver outdated

**Solution**:
1. **Tools** → **Update WebDrivers**
2. Select browsers to update
3. Click **Update**
4. Restart Katalon

#### Error: "Unable to open browser"

**Cause**: Browser version mismatch

**Solution**:
1. Update browser to latest version
2. Update WebDriver (see above)
3. Try different browser

### 10.2 Best Practices

1. **Use Waits Instead of Delays**:
   ```groovy
   // Bad
   WebUI.delay(5)
   
   // Good
   WebUI.waitForElementVisible(element, 10)
   ```

2. **Close Browsers**:
   Always add `WebUI.closeBrowser()` at the end

3. **Unique Test Data**:
   ```groovy
   // Use timestamps for uniqueness
   def uniqueEmail = 'user' + System.currentTimeMillis() + '@test.com'
   ```

4. **Clean State**:
   Clear cookies/storage between tests:
   ```groovy
   WebUI.deleteAllCookies()
   WebUI.executeJavaScript("localStorage.clear()", null)
   ```

### 10.3 Getting Help

- **Katalon Docs**: https://docs.katalon.com
- **Community Forum**: https://forum.katalon.com
- **Project Issues**: Check `BUG_REPORTS.md` in repository

---

## 11. Quick Reference

### 11.1 5-Minute Setup

```bash
# 1. Start services
mongod --dbpath ./data/db  # Terminal 1
cd backend/microservices && npm run dev  # Terminal 2
cd backend/api-gateway && npm run dev    # Terminal 3
cd frontend && npm run dev               # Terminal 4

# 2. Open Katalon Studio
# 3. Open project: Tests.prj
# 4. Run Test Suite: Authentication
```

### 11.2 Common Commands Cheat Sheet

| Action | Katalon Code |
|--------|--------------|
| Open browser | `WebUI.openBrowser('')` |
| Navigate | `WebUI.navigateToUrl('http://...')` |
| Click element | `WebUI.click(testObject)` |
| Type text | `WebUI.setText(testObject, 'text')` |
| Verify element | `WebUI.verifyElementPresent(testObject, timeout)` |
| Wait for element | `WebUI.waitForElementVisible(testObject, timeout)` |
| Close browser | `WebUI.closeBrowser()` |

### 11.3 Pre-Execution Checklist

- [ ] All services running (Frontend, Backend, MongoDB)
- [ ] Test database seeded with users
- [ ] Katalon Studio WebDrivers updated
- [ ] Browser versions up to date
- [ ] No conflicting tests running

---

## Appendix

### A. Related Documentation

- [Test Strategy](file:///d:/Work/University/Semester%207/CS425/Project/CyberRange/Test_Strategy.md) - Comprehensive strategy document
- [Bug Reports](file:///d:/Work/University/Semester%207/CS425/Project/CyberRange/BUG_REPORTS.md) - All 14 resolved defects
- [Comprehensive Test Cases](file:///d:/Work/University/Semester%207/CS425/Project/CyberRange/Comprehensive_Test_Cases.md) - Detailed test case matrix
- [Katalon Scripts](file:///d:/Work/University/Semester%207/CS425/Project/CyberRange/KATALON_SCRIPTS.md) - Original script documentation

### B. Contact Information

**QA Team Lead**: [Your Name]  
**Email**: qa@cyberrange.project  
**Documentation Version**: 1.0  
**Last Updated**: 2026-01-04
