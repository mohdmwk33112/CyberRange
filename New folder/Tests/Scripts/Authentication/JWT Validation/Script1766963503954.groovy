import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import static com.kms.katalon.core.testobject.ObjectRepository.findWindowsObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import com.kms.katalon.core.cucumber.keyword.CucumberBuiltinKeywords as CucumberKW
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testng.keyword.TestNGBuiltinKeywords as TestNGKW
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.windows.keyword.WindowsBuiltinKeywords as Windows
import internal.GlobalVariable as GlobalVariable
import org.openqa.selenium.Keys as Keys

WebUI.openBrowser('')

// --- Step 1: Initial Access Attempt (No Token) ---
// Attempt to access a protected route directly
WebUI.navigateToUrl('http://localhost:3000/dashboard')

WebUI.waitForPageLoad(5)

// The landing page fix (Bug #10) might show the landing page or redirect to login
// Based on current logic, if not authenticated, accessing /dashboard should redirect to /auth/login
WebUI.verifyMatch(WebUI.getUrl(), '.*auth/login.*', true)

// --- Step 2: Login to Generate valid JWT ---
WebUI.setText(findTestObject('SignIn/input_Username_username'), 'mohd331122')

WebUI.setEncryptedText(findTestObject('SignIn/input_Password_password'), 'YlrQdmzYnHQ5SIFTXOUNtg==')

WebUI.click(findTestObject('SignIn/button_Login'))

// --- IMPROVED: Wait for redirection to Dashboard or Admin ---
boolean isRedirected = false
for (int i = 0; i < 15; i++) {
    String currentUrl = WebUI.getUrl()
    if (currentUrl.contains('dashboard') || currentUrl.contains('admin')) {
        isRedirected = true
        break
    }
    WebUI.delay(1)
}

if (!isRedirected) {
    WebUI.comment('Login failed or redirection too slow. Current URL: ' + WebUI.getUrl())
    // Optional: Check if error message is visible
    if (WebUI.verifyTextPresent('Login failed', false, FailureHandling.OPTIONAL)) {
        WebUI.comment('Found "Login failed" error toast.')
    }
}

// Final verification of redirection
WebUI.verifyMatch(WebUI.getUrl(), '.*(dashboard|admin).*', true)

// --- Step 3: JWT Tampering / Removal ---
// Our app uses Zustand with localStorage persistence (auth-storage)
// We simulate a session expiration or token deletion
WebUI.comment('Simulating session expiration by clearing localStorage...')

WebUI.executeJavaScript('localStorage.removeItem(\'auth-storage\')', [])

// Refresh the page
WebUI.refresh()

WebUI.waitForPageLoad(5)

// --- Step 4: Final Verification ---
// The app should detect the missing token and redirect back to login
WebUI.verifyMatch(WebUI.getUrl(), '.*auth/login.*', true)

WebUI.comment('JWT Validation Test Passed: Access denied after token removal.')

WebUI.closeBrowser()

