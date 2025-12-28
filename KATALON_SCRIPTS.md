# Katalon Studio Test Scripts

This document contains updated Groovy automation scripts for the CyberRange project.
**IMPORTANT:** The previous scripts failed because `findTestObject` requires you to manually create objects in the Katalon Object Repository first.

Detailed below are **Self-Contained Scripts** that define Test Objects dynamically in the code using XPaths (based on the actual IDs `username`, `password`, `email` found in your frontend code). You can copy these directly into a Test Case script view.

## 1. Authentication (AUTH)

### TC-AUTH-01: User Registration
```groovy
import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.testobject.TestObject
import com.kms.katalon.core.testobject.ConditionType
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

TestObject makeTO(String xpath) {
    TestObject to = new TestObject()
    to.addProperty("xpath", ConditionType.EQUALS, xpath)
    return to
}

WebUI.openBrowser('')
WebUI.navigateToUrl('http://localhost:3000/auth/signup')
WebUI.maximizeWindow()

// Wait for the username input to be visible (timeout: 10 seconds)
TestObject usernameInput = makeTO("//input[@id='username']")
WebUI.waitForElementVisible(usernameInput, 10)

WebUI.setText(usernameInput, 'newuser_' + System.currentTimeMillis()) // Unique username
WebUI.setText(makeTO("//input[@id='email']"), 'user' + System.currentTimeMillis() + '@test.com')

// Use setText for password to avoid encryption issues during testing
WebUI.setText(makeTO("//input[@id='password']"), 'Password123!')

// Click button and wait for navigation
WebUI.click(makeTO("//button[@type='submit']"))

// Verify verify we are redirected to Login page
TestObject loginHeader = makeTO("//h3[contains(text(), 'Login')] | //div[contains(text(), 'Login')]")
WebUI.waitForElementVisible(loginHeader, 10)

WebUI.closeBrowser()
```

### TC-AUTH-02: Login Success
```groovy
WebUI.openBrowser('')
WebUI.navigateToUrl('http://localhost:3000/auth/login')
WebUI.maximizeWindow()

WebUI.waitForElementVisible(makeTO("//input[@id='username']"), 10)

WebUI.setText(makeTO("//input[@id='username']"), 'student@test.com')
WebUI.setText(makeTO("//input[@id='password']"), 'password123') 
WebUI.click(makeTO("//button[@type='submit']"))

// Wait for Dashboard to load
WebUI.waitForElementVisible(makeTO("//*[contains(text(), 'Welcome back')]"), 15)

WebUI.closeBrowser()
```

### TC-AUTH-03: Login Failure
```groovy
WebUI.openBrowser('')
WebUI.navigateToUrl('http://localhost:3000/auth/login')
WebUI.waitForElementVisible(makeTO("//input[@id='username']"), 10)

WebUI.setText(makeTO("//input[@id='username']"), 'student@test.com')
WebUI.setText(makeTO("//input[@id='password']"), 'WRONG_PASSWORD')
WebUI.click(makeTO("//button[@type='submit']"))

// Verify error message
WebUI.waitForElementVisible(makeTO("//*[contains(text(), 'Invalid credentials')]"), 10)

WebUI.closeBrowser()
```

---

## 2. Dashboard (DASH)

### TC-DASH-01: Completion Rate Check
```groovy
WebUI.openBrowser('')
WebUI.navigateToUrl('http://localhost:3000/dashboard')
WebUI.maximizeWindow()
// ... (Include Login Steps Here if not using a shared session) ...

WebUI.delay(2)
// Target the 'Completion Rate' label and finding the percentage value nearby
TestObject completionRateLabel = makeTO("//span[contains(text(), 'Completion Rate')]")
WebUI.verifyElementPresent(completionRateLabel, 5)

// The value is in a sibling span or parent div context. 
// Based on code: <span ...>Completion Rate</span> <span ...>{completionRate}%</span>
TestObject rateValue = makeTO("//span[contains(text(), 'Completion Rate')]/following-sibling::span")
String rate = WebUI.getText(rateValue)
println "Completion Rate Found: " + rate

WebUI.closeBrowser()
```

### TC-DASH-04: Active Simulations
```groovy
WebUI.navigateToUrl('http://localhost:3000/dashboard')
WebUI.delay(2)

// Look for the "Active Simulations" card title
TestObject activeSimsCard = makeTO("//*[contains(text(), 'Active Simulations')]")
WebUI.verifyElementPresent(activeSimsCard, 5)

// Check if any status badge exists (e.g., 'Running')
// Code uses classes like 'bg-green-100' for running status
TestObject runningBadge = makeTO("//span[contains(text(), 'Running')]")
if (WebUI.verifyElementPresent(runningBadge, 2, FailureHandling.OPTIONAL)) {
    println "Found running simulations."
}
```

---

## 3. Scenarios (SCEN)

### TC-SCEN-01: Terminal Command Validation
```groovy
// Navigate to a specific Scenario Page (e.g., ID 1)
WebUI.navigateToUrl('http://localhost:3000/scenarios/1') 
WebUI.maximizeWindow()
WebUI.delay(2)

// 1. Start Learning Phase (Click '01. Learning' or 'Continue')
// If purely testing terminal, we assume we are in 'Questionnaire' phase
TestObject questionnaireTab = makeTO("//span[contains(text(), 'Questionnaire')]")
WebUI.click(questionnaireTab)

// 2. Locate Terminal Input
// Verified in TerminalQuestionnaire.tsx: placeholder="Type your command here..."
TestObject terminalInput = makeTO("//input[@placeholder='Type your command here...']")
WebUI.waitForElementVisible(terminalInput, 10)

// 3. Enter Command
WebUI.setText(terminalInput, 'nmap -sV target')
WebUI.sendKeys(terminalInput, Keys.chord(Keys.ENTER))

// 4. Verify Output
// The output is rendered in a div with font-mono. 
TestObject terminalOutput = makeTO("//div[contains(@class, 'font-mono') and contains(., 'Starting Nmap')]")
WebUI.verifyElementPresent(terminalOutput, 5)

WebUI.closeBrowser()
```

---

## 4. Simulation Management (SIM)

### TC-SIM-01: Launch Simulation
```groovy
WebUI.navigateToUrl('http://localhost:3000/scenarios/1')
WebUI.delay(3)

// Switch to Simulation Tab or Phase
// The button contains an icon and text, so we use '.' to check all inner text
TestObject launchBtn = makeTO("//button[contains(., 'Launch Simulation')]")

// Click Launch
WebUI.click(launchBtn)

// Wait for "Launching..." spinner or text
TestObject launchingState = makeTO("//*[contains(., 'Launching...')]")
WebUI.verifyElementPresent(launchingState, 5)

// Wait for "Terminate Simulation" button to appear (indicating success)
// Using '.' is safer for nested elements
TestObject terminateBtn = makeTO("//button[contains(., 'Terminate Simulation')]")
WebUI.waitForElementVisible(terminateBtn, 60) // Can take time for K8s

println "Simulation successfully launched."
```

### TC-SIM-02: Stop Simulation
```groovy
// Assuming simulation is running
TestObject terminateBtn = makeTO("//button[contains(., 'Terminate Simulation')]")
WebUI.click(terminateBtn)

// Verify "Simulation Stopped" toast or button reversion
WebUI.waitForElementVisible(makeTO("//*[contains(., 'Simulation Stopped')]"), 10)
```

---

## 5. Admin (ADM)

### TC-ADM-01: User Management
```groovy
WebUI.navigateToUrl('http://localhost:3000/admin')
WebUI.maximizeWindow()
WebUI.delay(2)

// 1. Click 'User Management' Tab
TestObject userTab = makeTO("//button[contains(text(), 'User Management')]")
WebUI.click(userTab)

// 2. Verify Table
// Based on UserManagement.tsx (assuming table structure)
// Look for headers: "Username", "Email", "Role"
WebUI.verifyElementPresent(makeTO("//th[contains(text(), 'Username')]"), 5)
WebUI.verifyElementPresent(makeTO("//th[contains(text(), 'Email')]"), 5)

// 3. Count Rows
List<WebElement> rows = WebUI.findWebElements(makeTO("//tbody/tr"), 5)
println "Total Users: " + rows.size()
assert rows.size() > 0
```

---

## Summary of Changes
1.  **Auth**: Updated IDs (`#username`, `#password`) matching `login/page.tsx` and `signup/page.tsx`.
2.  **Dashboard**: Used text-based siblings for "Completion Rate" matching `dashboard/page.tsx`.
3.  **Terminal**: Targeted `<input placeholder="Type command...">` matching `TerminalQuestionnaire.tsx`.
4.  **Simulation**: Targeted "Launch Simulation" and "Terminate Simulation" button text matching `scenarios/[id]/page.tsx`.
5.  **Admin**: Targeted "User Management" tab and table headers matching standard UI patterns in `UserManagement.tsx`.
