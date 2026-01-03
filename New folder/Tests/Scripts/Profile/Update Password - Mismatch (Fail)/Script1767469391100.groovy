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

WebUI.navigateToUrl('http://localhost:3000/auth/login')

WebUI.setText(findTestObject('Object Repository/Profile/input_Username_username'), 'ayadzewail')

WebUI.setEncryptedText(findTestObject('Object Repository/Profile/input_Password_password'), 'ctjkNZzQVZQqnpFh3PgUMg==')

WebUI.click(findTestObject('Object Repository/Profile/button_Login'))

WebUI.click(findTestObject('Object Repository/Profile/svg_Browse Scenarios_lucide lucide-user h-6 w-6'))

WebUI.click(findTestObject('Object Repository/Profile/button_Change Password'))

WebUI.setEncryptedText(findTestObject('Object Repository/Profile/input_New Password_flex h-10 w-full rounded_d228b6'), 'UjWHzyF6vE8=')

WebUI.setEncryptedText(findTestObject('Object Repository/Profile/input_New Password_flex h-10 w-full rounded_d228b6_1'), 
    '9GOtePQYp2c=')

WebUI.setEncryptedText(findTestObject('Object Repository/Profile/input_New Password_flex h-10 w-full rounded_d228b6_2'), 
    'G5ed2Ngh+RQ=')

WebUI.setEncryptedText(findTestObject('Object Repository/Profile/input_New Password_flex h-10 w-full rounded_d228b6_3'), 
    'Cwp8A+okQc4=')

WebUI.setEncryptedText(findTestObject('Object Repository/Profile/input_New Password_flex h-10 w-full rounded_d228b6_4'), 
    'lO3w8bfNEkI=')

WebUI.click(findTestObject('Object Repository/Profile/div_Update Password'))

WebUI.closeBrowser()

