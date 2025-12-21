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

        // Infiltration Scenario
        const infiltrationScenario = {
            slug: 'infiltration',
            title: 'Network Infiltration Simulation',
            description: 'Simulate a sophisticated infiltration attack on a target web application',
            attackType: 'other',
            difficulty: 'hard',
            completionCriteria: 'Complete the attacker job and capture flows',
            steps: [
                {
                    stepOrder: 0,
                    stepType: 'terminal',
                    title: 'Start Infiltration',
                    description: 'Trigger the infiltration attacker job',
                    expectedCommand: 'kubectl apply -f infiltration-sim.yaml',
                    validationType: 'regex',
                    validationPattern: '^kubectl apply.*',
                    terminalOutput: 'job.batch/infiltration-attacker created',
                    hints: ['Use kubectl to apply the manifest'],
                    isOptional: false,
                },
            ],
        };

        // Bot Scenario
        const botScenario = {
            slug: 'bot',
            title: 'Bot Attack Simulation',
            description: 'Simulate a bot-driven credential stuffing or scraping attack',
            attackType: 'brute-force',
            difficulty: 'medium',
            completionCriteria: 'Bot simulation completes successfully',
            steps: [
                {
                    stepOrder: 0,
                    stepType: 'terminal',
                    title: 'Run Bot',
                    description: 'Launch the bot simulation',
                    expectedCommand: 'kubectl apply -f bot-sim.yaml',
                    validationType: 'regex',
                    validationPattern: '^kubectl apply.*',
                    terminalOutput: 'job.batch/bot-attacker created',
                    hints: ['Launch the bot attacker job'],
                    isOptional: false,
                },
            ],
        };

        // DDoS Scenario
        const ddosScenario = {
            slug: 'ddos',
            title: 'DDoS Attack Simulation',
            description: 'Simulate a distributed denial of service attack on the target',
            attackType: 'other',
            difficulty: 'hard',
            completionCriteria: 'DDoS simulation completes and traffic is recorded',
            steps: [
                {
                    stepOrder: 0,
                    stepType: 'terminal',
                    title: 'Launch DDoS',
                    description: 'Trigger the DDoS attack job',
                    expectedCommand: 'kubectl apply -f ddos-sim.yaml',
                    validationType: 'regex',
                    validationPattern: '^kubectl apply.*',
                    terminalOutput: 'job.batch/ddos-attacker created',
                    hints: ['Run the ddos attacker job'],
                    isOptional: false,
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
