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

WebUI.navigateToUrl('http://localhost:3000/auth/signup')

WebUI.setText(findTestObject('Object Repository/SignUp/signuptesting/Page_CyberRange/input_Username_username'), 'mohamed')

WebUI.setText(findTestObject('Object Repository/SignUp/signuptesting/Page_CyberRange/input_Email_email'), 'mohdemail.com')

WebUI.setEncryptedText(findTestObject('Object Repository/SignUp/signuptesting/Page_CyberRange/input_Password_password'), 
    'tzH6RvlfSTg=')

WebUI.click(findTestObject('Object Repository/SignUp/signuptesting/Page_CyberRange/button_Sign Up'))

WebUI.setText(findTestObject('Object Repository/SignUp/signuptesting/Page_CyberRange/input_Email_email'), 'mohd111@gmailcom')

WebUI.click(findTestObject('Object Repository/SignUp/signuptesting/Page_CyberRange/button_Sign Up'))

WebUI.setText(findTestObject('Object Repository/SignUp/signuptesting/Page_CyberRange/input_Email_email'), 'mohd@gmail.com')

WebUI.setEncryptedText(findTestObject('Object Repository/SignUp/signuptesting/Page_CyberRange/input_Password_password'), 
    'RigbBhfdqOBGNlJIWM1ClA==')

WebUI.click(findTestObject('Object Repository/SignUp/signuptesting/Page_CyberRange/button_Sign Up'))

WebUI.setEncryptedText(findTestObject('Object Repository/SignUp/signuptesting/Page_CyberRange/input_Password_password'), 
    'RigbBhfdqOAzyPoZeICXsA==')

WebUI.click(findTestObject('Object Repository/SignUp/signuptesting/Page_CyberRange/button_Sign Up'))

WebUI.setEncryptedText(findTestObject('Object Repository/SignUp/signuptesting/Page_CyberRange/input_Password_password'), 
    'RigbBhfdqOBe6YUDkwoVIA==')

WebUI.click(findTestObject('Object Repository/SignUp/signuptesting/Page_CyberRange/button_Sign Up'))

