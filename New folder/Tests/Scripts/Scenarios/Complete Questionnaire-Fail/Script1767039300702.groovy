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

WebUI.navigateToUrl('http://localhost:3000/scenarios')

WebUI.setText(findTestObject('Object Repository/Scenario/Questionnaire-fail/input_Username_username'), 'nader')

WebUI.setEncryptedText(findTestObject('Object Repository/Scenario/Questionnaire-fail/input_Password_password'), 'n+7DTJndE0qI+loUi7Fb3w==')

WebUI.sendKeys(findTestObject('Object Repository/Scenario/Questionnaire-fail/input_Password_password'), Keys.chord(Keys.ENTER))

WebUI.click(findTestObject('Object Repository/Scenario/Questionnaire-fail/button_View All Scenarios'))

WebUI.click(findTestObject('Object Repository/Scenario/Questionnaire-fail/button_Start Training'))

WebUI.click(findTestObject('Object Repository/Scenario/Questionnaire-fail/div_Logout_h-1.5 w-full rounded-full transi_477328'))

WebUI.click(findTestObject('Object Repository/Scenario/Questionnaire-fail/button_Continue to Practice'))

WebUI.click(findTestObject('Object Repository/Scenario/Questionnaire-fail/input__flex h-10 w-full rounded-md border b_a1e141'))

WebUI.setText(findTestObject('Object Repository/Scenario/Questionnaire-fail/input__flex h-10 w-full rounded-md border b_a1e141_1'), 
    'a')

WebUI.sendKeys(findTestObject('Object Repository/Scenario/Questionnaire-fail/input__flex h-10 w-full rounded-md border b_a1e141_1'), 
    Keys.chord(Keys.ENTER))

WebUI.click(findTestObject('Object Repository/Scenario/Questionnaire-fail/input__flex h-10 w-full rounded-md border b_a1e141_1'))

WebUI.setText(findTestObject('Object Repository/Scenario/Questionnaire-fail/input__flex h-10 w-full rounded-md border b_a1e141_2'), 
    'aa')

WebUI.setText(findTestObject('Object Repository/Scenario/Questionnaire-fail/input__flex h-10 w-full rounded-md border b_a1e141_3'), 
    'aas')

WebUI.click(findTestObject('Object Repository/Scenario/Questionnaire-fail/button_Submit Command'))

WebUI.click(findTestObject('Object Repository/Scenario/Questionnaire-fail/input__flex h-10 w-full rounded-md border b_a1e141_3'))

WebUI.setText(findTestObject('Object Repository/Scenario/Questionnaire-fail/input__flex h-10 w-full rounded-md border b_a1e141_4'), 
    'aasd')

WebUI.click(findTestObject('Object Repository/Scenario/Questionnaire-fail/button_Submit Command_1'))

WebUI.click(findTestObject('Object Repository/Scenario/Questionnaire-fail/html_CyberRangeCyberRangekatalonfont-family_dd8fd1'))

WebUI.setText(findTestObject('Object Repository/Scenario/Questionnaire-fail/input__flex h-10 w-full rounded-md border b_a1e141_5'), 
    'hydra -l admin -P passwords.txt ssh://192.168.1.10')

WebUI.click(findTestObject('Object Repository/Scenario/Questionnaire-fail/button_Submit Command_2'))

WebUI.click(findTestObject('Object Repository/Scenario/Questionnaire-fail/input__flex h-10 w-full rounded-md border b_a1e141'))

WebUI.setText(findTestObject('Object Repository/Scenario/Questionnaire-fail/input__flex h-10 w-full rounded-md border b_a1e141_6'), 
    'gobuster dir -u http://192.168.1.10 -w common.txt')

WebUI.click(findTestObject('Object Repository/Scenario/Questionnaire-fail/button_Submit Command_3'))

WebUI.closeBrowser()

