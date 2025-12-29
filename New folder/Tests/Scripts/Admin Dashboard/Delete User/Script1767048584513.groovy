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
import com.kms.katalon.core.testobject.ConditionType as ConditionType
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.windows.keyword.WindowsBuiltinKeywords as Windows
import internal.GlobalVariable as GlobalVariable
import org.openqa.selenium.Keys as Keys

// 1. Setup and Login
WebUI.openBrowser('')
WebUI.navigateToUrl('http://localhost:3000/auth/login')
WebUI.setText(findTestObject('Object Repository/input_Username_username'), 'admin')
WebUI.setEncryptedText(findTestObject('Object Repository/input_Password_password'), '/5S6MFFLcE4ZOg6V2jhgMg==')
WebUI.click(findTestObject('Object Repository/button_Login'))

// Wait for redirect to complete
WebUI.waitForPageLoad(5)

// 2. Navigate to User Management Tab
// Using contains(., '...') to find text even if it's wrapped or next to an icon
TestObject userTab = new TestObject().addProperty('xpath', ConditionType.EQUALS, "//button[@role='tab'][contains(., 'User Management')]")
WebUI.waitForElementClickable(userTab, 10)
WebUI.click(userTab)

// 3. Find and Click the LAST Delete User Button
// (//button[@title='Delete User'])[last()] targets the very last user in the list
TestObject lastDeleteBtn = new TestObject().addProperty('xpath', ConditionType.EQUALS, "(//button[@title='Delete User'])[last()]")
WebUI.waitForElementVisible(lastDeleteBtn, 10)
WebUI.click(lastDeleteBtn)

// 4. Handle the Custom Website Confirmation Modal
// Click the red 'Delete User' button in our custom Card modal
TestObject confirmDeleteBtn = new TestObject().addProperty('xpath', ConditionType.EQUALS, "//button[text()='Delete User' and contains(@class, 'bg-destructive')]")
WebUI.waitForElementVisible(confirmDeleteBtn, 5)
WebUI.click(confirmDeleteBtn)

// 5. Verification
WebUI.delay(2)
WebUI.verifyTextPresent('User deleted', false)
WebUI.closeBrowser()