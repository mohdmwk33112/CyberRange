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

        // Infiltration Scenario with Learning + Questionnaire
        const infiltrationScenario = {
            slug: 'infiltration',
            title: 'Network Infiltration Attack',
            description: 'Learn and execute a sophisticated network infiltration attack',
            attackType: 'other',
            difficulty: 'hard',
            completionCriteria: 'Complete learning and score ≥90% on questionnaire',
            steps: [
                // STEP 1: Learning Phase
                {
                    stepOrder: 0,
                    stepType: 'learning',
                    title: 'Understanding Network Infiltration',
                    description: 'Learn how attackers infiltrate networks and the tools they use',
                    learningContent: {
                        objectives: [
                            'Understand the phases of a network infiltration attack',
                            'Learn reconnaissance techniques and tools',
                            'Master network scanning commands',
                        ],
                        theory: `# Network Infiltration Attacks

Network infiltration is a sophisticated attack where an attacker gains unauthorized access to a target network through multiple phases.

## Attack Phases

### 1. Reconnaissance
Gathering information about the target network, systems, and potential vulnerabilities.

**Common Tools:**
- \`nmap\` - Network scanner
- \`whois\` - Domain information
- \`dig\` - DNS queries

### 2. Scanning & Enumeration
Identifying live hosts, open ports, and running services.

### 3. Gaining Access
Exploiting vulnerabilities to gain initial foothold.`,
                        examples: [
                            {
                                title: 'Network Reconnaissance with Nmap',
                                description: 'Scan a target network to discover live hosts and open ports',
                                command: 'nmap -sV -p- 192.168.1.0/24',
                                output: `Starting Nmap scan...
Host 192.168.1.10 is up (0.001s latency)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.9
80/tcp   open  http    Apache 2.4.41`
                            },
                            {
                                title: 'Service Enumeration',
                                description: 'Identify specific service versions',
                                command: 'nmap -sV 192.168.1.10',
                                output: `PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.9p1`
                            },
                        ],
                        keyPoints: [
                            'Always start with passive reconnaissance before active scanning',
                            'nmap is the industry standard for network discovery',
                            'Service version information helps identify vulnerabilities',
                        ],
                        resources: [
                            {
                                title: 'Nmap Reference Guide',
                                url: 'https://nmap.org/book/man.html'
                            },
                        ]
                    }
                },
                // STEP 2: Questionnaire Phase
                {
                    stepOrder: 1,
                    stepType: 'questionnaire',
                    title: 'Execute Infiltration Commands',
                    description: 'Apply reconnaissance techniques by executing attack commands',
                    questions: [
                        {
                            questionOrder: 1,
                            questionText: 'Perform a network scan to discover live hosts in the 192.168.1.0/24 subnet:',
                            expectedCommand: 'nmap -sn 192.168.1.0/24',
                            validationType: 'regex',
                            validationPattern: '^nmap\\s+-sn\\s+192\\.168\\.1\\.0/24$',
                            caseSensitive: false,
                            points: 30,
                            hints: [
                                'Use nmap for network scanning',
                                'The -sn flag performs a ping scan',
                                'Specify the subnet in CIDR notation'
                            ],
                            successMessage: '✓ Network scan initiated! Discovering live hosts...',
                            errorMessage: '✗ Incorrect command. Review the nmap syntax.',
                            explanation: 'nmap -sn performs a ping scan to discover live hosts without port scanning.'
                        },
                        {
                            questionOrder: 2,
                            questionText: 'Scan target 192.168.1.10 for open ports and service versions:',
                            expectedCommand: 'nmap -sV 192.168.1.10',
                            validationType: 'contains',
                            validationPattern: 'nmap.*-sV.*192\\.168\\.1\\.10',
                            caseSensitive: false,
                            points: 35,
                            hints: [
                                'Use the -sV flag for service version detection',
                                'Target the specific IP address'
                            ],
                            successMessage: '✓ Service enumeration complete!',
                            errorMessage: '✗ Check the service detection flag.',
                            explanation: 'The -sV flag enables version detection.'
                        },
                        {
                            questionOrder: 3,
                            questionText: 'Run a vulnerability scan on the target:',
                            expectedCommand: 'nmap --script vuln 192.168.1.10',
                            validationType: 'regex',
                            validationPattern: '^nmap\\s+--script\\s+vuln\\s+192\\.168\\.1\\.10$',
                            caseSensitive: false,
                            points: 35,
                            hints: [
                                'Use nmap scripting engine (NSE)',
                                'The vuln script category checks for vulnerabilities'
                            ],
                            successMessage: '✓ Vulnerability scan complete!',
                            errorMessage: '✗ Review the NSE script syntax.',
                            explanation: 'The --script vuln option runs vulnerability detection scripts.'
                        }
                    ]
                },
            ],
        };

        // Bot Attack Scenario
        const botScenario = {
            slug: 'bot',
            title: 'Bot Attack Simulation',
            description: 'Learn and execute bot-driven attacks',
            attackType: 'brute-force',
            difficulty: 'medium',
            completionCriteria: 'Complete learning and score ≥90% on questionnaire',
            steps: [
                {
                    stepOrder: 0,
                    stepType: 'learning',
                    title: 'Understanding Bot Attacks',
                    description: 'Learn about automated bot attacks and credential stuffing',
                    learningContent: {
                        objectives: [
                            'Understand bot-driven attacks',
                            'Learn credential stuffing techniques',
                            'Master automated attack tools',
                        ],
                        theory: `# Bot Attacks

Bot attacks use automated scripts to perform malicious activities at scale.

## Common Bot Attack Types

### 1. Credential Stuffing
Using stolen credentials to gain unauthorized access.

### 2. Web Scraping
Extracting data from websites automatically.

### 3. Brute Force
Systematically trying passwords until finding the correct one.`,
                        examples: [
                            {
                                title: 'Using Hydra for Brute Force',
                                description: 'Automated password cracking tool',
                                command: 'hydra -l admin -P passwords.txt ssh://192.168.1.10',
                                output: 'Hydra v9.0 starting...\n[22][ssh] host: 192.168.1.10 login: admin password: admin123'
                            },
                        ],
                        keyPoints: [
                            'Bots can perform attacks at massive scale',
                            'Rate limiting is a key defense',
                            'CAPTCHA helps prevent automated attacks',
                        ],
                        resources: []
                    }
                },
                {
                    stepOrder: 1,
                    stepType: 'questionnaire',
                    title: 'Execute Bot Attack Commands',
                    description: 'Practice bot attack techniques',
                    questions: [
                        {
                            questionOrder: 1,
                            questionText: 'Launch a brute force attack against SSH on 192.168.1.10 with username "admin":',
                            expectedCommand: 'hydra -l admin -P passwords.txt ssh://192.168.1.10',
                            validationType: 'contains',
                            validationPattern: 'hydra.*admin.*ssh://192\\.168\\.1\\.10',
                            caseSensitive: false,
                            points: 50,
                            hints: [
                                'Use hydra for brute force attacks',
                                'Specify username with -l flag',
                                'Use -P for password file'
                            ],
                            successMessage: '✓ Brute force attack initiated!',
                            errorMessage: '✗ Check hydra syntax.',
                            explanation: 'Hydra is a powerful brute force tool supporting multiple protocols.'
                        },
                        {
                            questionOrder: 2,
                            questionText: 'Perform a web directory brute force on http://192.168.1.10:',
                            expectedCommand: 'gobuster dir -u http://192.168.1.10 -w wordlist.txt',
                            validationType: 'contains',
                            validationPattern: 'gobuster.*dir.*192\\.168\\.1\\.10',
                            caseSensitive: false,
                            points: 50,
                            hints: [
                                'Use gobuster for directory enumeration',
                                'Specify URL with -u flag',
                                'Use -w for wordlist'
                            ],
                            successMessage: '✓ Directory enumeration started!',
                            errorMessage: '✗ Review gobuster syntax.',
                            explanation: 'Gobuster finds hidden directories and files on web servers.'
                        }
                    ]
                },
            ],
        };

        // DDoS Scenario
        const ddosScenario = {
            slug: 'ddos',
            title: 'DDoS Attack Simulation',
            description: 'Learn and execute distributed denial of service attacks',
            attackType: 'other',
            difficulty: 'hard',
            completionCriteria: 'Complete learning and score ≥90% on questionnaire',
            steps: [
                {
                    stepOrder: 0,
                    stepType: 'learning',
                    title: 'Understanding DDoS Attacks',
                    description: 'Learn about distributed denial of service attacks',
                    learningContent: {
                        objectives: [
                            'Understand DDoS attack vectors',
                            'Learn traffic flooding techniques',
                            'Master stress testing tools',
                        ],
                        theory: `# DDoS Attacks

Distributed Denial of Service attacks overwhelm targets with traffic from multiple sources.

## Attack Types

### 1. Volume-Based Attacks
Saturate bandwidth with massive traffic.

### 2. Protocol Attacks
Exploit protocol weaknesses to consume resources.

### 3. Application Layer Attacks
Target web applications with seemingly legitimate requests.`,
                        examples: [
                            {
                                title: 'SYN Flood Attack',
                                description: 'Overwhelm with TCP SYN packets',
                                command: 'hping3 -S --flood -p 80 192.168.1.10',
                                output: 'HPING 192.168.1.10 (eth0 192.168.1.10): S set, 40 headers + 0 data bytes'
                            },
                        ],
                        keyPoints: [
                            'DDoS attacks use distributed botnets',
                            'Amplification attacks multiply traffic volume',
                            'Mitigation requires traffic filtering',
                        ],
                        resources: []
                    }
                },
                {
                    stepOrder: 1,
                    stepType: 'questionnaire',
                    title: 'Execute DDoS Commands',
                    description: 'Practice DDoS attack techniques',
                    questions: [
                        {
                            questionOrder: 1,
                            questionText: 'Launch a SYN flood attack on port 80 of 192.168.1.10:',
                            expectedCommand: 'hping3 -S --flood -p 80 192.168.1.10',
                            validationType: 'contains',
                            validationPattern: 'hping3.*-S.*--flood.*192\\.168\\.1\\.10',
                            caseSensitive: false,
                            points: 50,
                            hints: [
                                'Use hping3 for packet crafting',
                                '-S flag sends SYN packets',
                                '--flood sends packets as fast as possible'
                            ],
                            successMessage: '✓ SYN flood initiated!',
                            errorMessage: '✗ Check hping3 syntax.',
                            explanation: 'hping3 is a packet crafting tool for network testing.'
                        },
                        {
                            questionOrder: 2,
                            questionText: 'Perform a UDP flood on port 53 of 192.168.1.10:',
                            expectedCommand: 'hping3 --udp --flood -p 53 192.168.1.10',
                            validationType: 'contains',
                            validationPattern: 'hping3.*--udp.*--flood.*192\\.168\\.1\\.10',
                            caseSensitive: false,
                            points: 50,
                            hints: [
                                'Use --udp flag for UDP packets',
                                'Target DNS port 53',
                                'Use --flood for maximum speed'
                            ],
                            successMessage: '✓ UDP flood started!',
                            errorMessage: '✗ Review UDP flood syntax.',
                            explanation: 'UDP floods target stateless protocols like DNS.'
                        }
                    ]
                },
            ],
        };

        // Insert scenarios
        const scenarios = await ScenarioModel.insertMany([
            infiltrationScenario,
            botScenario,
            ddosScenario,
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
