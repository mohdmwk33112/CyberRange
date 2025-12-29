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

WebUI.setText(findTestObject('Object Repository/Scenario/Page_CyberRange/input_Username_username'), 'nader')

WebUI.setEncryptedText(findTestObject('Object Repository/Scenario/Page_CyberRange/input_Password_password'), 'n+7DTJndE0qI+loUi7Fb3w==')

WebUI.click(findTestObject('Object Repository/Scenario/Page_CyberRange/button_Login'))

WebUI.click(findTestObject('Object Repository/Scenario/Page_CyberRange/button_View All Scenarios'))

WebUI.click(findTestObject('Object Repository/Scenario/Page_CyberRange/button_Start Training'))

WebUI.click(findTestObject('Object Repository/Scenario/Page_CyberRange/button_Continue to Practice'))

WebUI.click(findTestObject('Object Repository/Scenario/Page_CyberRange/input__flex h-10 w-full rounded-md border b_a1e141'))

WebUI.setText(findTestObject('Object Repository/Scenario/Page_CyberRange/input__flex h-10 w-full rounded-md border b_a1e141_1'), 
    'hping3 -S --flood -p 80 192.168.1.10')

WebUI.click(findTestObject('Object Repository/Scenario/Page_CyberRange/button_Submit Command'))

WebUI.click(findTestObject('Object Repository/Scenario/Page_CyberRange/input__flex h-10 w-full rounded-md border b_a1e141'))

WebUI.setText(findTestObject('Object Repository/Scenario/Page_CyberRange/input__flex h-10 w-full rounded-md border b_a1e141_2'), 
    'hping3 --udp --flood -p 53 192.168.1.10')

WebUI.click(findTestObject('Object Repository/Scenario/Page_CyberRange/button_Submit Command_1'))

WebUI.delay(1.5)

WebUI.closeBrowser()

