/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Scenario } from './scenario.model';
import { ScenarioState } from './scenario-state.model';
import { SimulationService } from '../simulation/simulation.service';
import { UserService } from '../user/user.service';

@Injectable()
export class ScenarioService {

    constructor(
        @InjectModel('Scenario') private readonly scenarioModel: Model<Scenario>,
        @InjectModel('ScenarioState') private readonly scenarioStateModel: Model<ScenarioState>,
        private readonly simulationService: SimulationService,
        private readonly userService: UserService,
    ) { }

    async createScenario(scenarioData: any): Promise<Scenario> {
        const newScenario = new this.scenarioModel(scenarioData);
        return await newScenario.save();
    }

    async getAllScenarios(): Promise<Scenario[]> {
        return await this.scenarioModel
            .find()
            .select('title description attackType difficulty completionCriteria createdAt')
            .sort({ createdAt: -1 })
            .lean()
            .exec() as any;
    }

    async getScenarioById(idOrSlug: string): Promise<Scenario> {
        let scenario;

        // Check if it's a valid ObjectId
        if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
            scenario = await this.scenarioModel.findById(idOrSlug).exec();
        }

        // If not found by ID or not an ID, try slug
        if (!scenario) {
            scenario = await this.scenarioModel.findOne({ slug: idOrSlug }).exec();
        }

        if (!scenario) {
            throw new NotFoundException(`Scenario with ID or slug "${idOrSlug}" not found`);
        }
        return scenario;
    }

    async validateTerminalCommand(
        userId: string,
        scenarioId: string,
        command: string,
    ): Promise<any> {
        // Get or create scenario state
        const state = await this.getOrCreateState(userId, scenarioId);
        const scenario = await this.getScenarioById(scenarioId);

        // Get current step
        const currentStepIndex = state.currentStep;
        if (currentStepIndex >= scenario.steps.length) {
            return {
                valid: false,
                message: 'All steps completed',
                completed: true,
            };
        }

        const currentStep = scenario.steps[currentStepIndex];

        // Validate it's a terminal step
        if (currentStep.stepType !== 'terminal') {
            return {
                valid: false,
                message: 'Current step is not a terminal command step',
                expectedType: 'web',
            };
        }

        // Validate command
        const isValid = this.validateCommand(
            command,
            currentStep.expectedCommand,
            currentStep.validationType,
            currentStep.validationPattern,
        );

        // Update attempt count
        state.attemptCount += 1;

        if (isValid) {
            // Mark step as completed
            state.completedSteps.push(currentStepIndex);
            state.currentStep += 1;

            // Calculate score (simple scoring: 100 points per step)
            state.score += 100;

            await state.save();

            return {
                valid: true,
                message: 'Command executed successfully',
                terminalOutput: currentStep.terminalOutput || 'Command executed.',
                nextStep: state.currentStep < scenario.steps.length ? scenario.steps[state.currentStep] : null,
                progress: {
                    currentStep: state.currentStep,
                    totalSteps: scenario.steps.length,
                    score: state.score,
                },
            };
        } else {
            await state.save();

            return {
                valid: false,
                message: 'Invalid command',
                hint: currentStep.hints && currentStep.hints.length > 0 ? currentStep.hints[0] : 'Try again',
                attemptCount: state.attemptCount,
            };
        }
    }

    async validateWebAction(
        userId: string,
        scenarioId: string,
        action: any,
    ): Promise<any> {
        // Get or create scenario state
        const state = await this.getOrCreateState(userId, scenarioId);
        const scenario = await this.getScenarioById(scenarioId);

        // Get current step
        const currentStepIndex = state.currentStep;
        if (currentStepIndex >= scenario.steps.length) {
            return {
                valid: false,
                message: 'All steps completed',
                completed: true,
            };
        }

        const currentStep = scenario.steps[currentStepIndex];

        // Validate it's a web step
        if (currentStep.stepType !== 'web') {
            return {
                valid: false,
                message: 'Current step is not a web action step',
                expectedType: 'terminal',
            };
        }

        // Validate action (simple comparison or pattern matching)
        const isValid = this.validateAction(action, currentStep.expectedAction);

        // Update attempt count
        state.attemptCount += 1;

        if (isValid) {
            // Mark step as completed
            state.completedSteps.push(currentStepIndex);
            state.currentStep += 1;

            // Calculate score
            state.score += 100;

            await state.save();

            return {
                valid: true,
                message: 'Action executed successfully',
                webResponse: currentStep.webResponse || { success: true },
                nextStep: state.currentStep < scenario.steps.length ? scenario.steps[state.currentStep] : null,
                progress: {
                    currentStep: state.currentStep,
                    totalSteps: scenario.steps.length,
                    score: state.score,
                },
            };
        } else {
            await state.save();

            return {
                valid: false,
                message: 'Invalid action',
                hint: currentStep.hints && currentStep.hints.length > 0 ? currentStep.hints[0] : 'Try again',
                attemptCount: state.attemptCount,
            };
        }
    }

    async getUserScenarioState(userId: string, scenarioId: string): Promise<ScenarioState> {
        const state = await this.scenarioStateModel
            .findOne({ userId, scenarioId })
            .exec();

        if (!state) {
            throw new NotFoundException('Scenario state not found. Start the scenario first.');
        }

        return state;
    }

    async updateScenarioState(userId: string, scenarioId: string, data: any): Promise<ScenarioState> {
        const state = await this.getOrCreateState(userId, scenarioId);

        Object.assign(state, data);
        return await state.save();
    }

    async completeScenario(userId: string, scenarioId: string): Promise<any> {
        const state = await this.getUserScenarioState(userId, scenarioId);
        const scenario = await this.getScenarioById(scenarioId);

        // Check if all steps are completed
        if (state.currentStep < scenario.steps.length) {
            throw new BadRequestException('Not all steps are completed');
        }

        state.status = 'completed';
        state.completedAt = new Date();
        await state.save();

        // Update User Progress
        await this.userService.updateProgress(userId, {
            scenarioId,
            status: 'completed',
            score: state.score,
            title: scenario.title,
            difficulty: scenario.difficulty,
            timestamp: new Date(),
        });

        return {
            message: 'Scenario completed successfully',
            state,
        };
    }

    async startScenario(scenarioId: string, userId: string): Promise<any> {
        const scenario = await this.getScenarioById(scenarioId);

        // Security check
        const state = await this.getUserScenarioState(userId, scenarioId);
        if (!state.simulationUnlocked) {
            throw new BadRequestException('Simulation is locked! You must score 90% or higher on the questionnaire.');
        }

        return this.simulationService.startSimulation(scenario.slug);
    }

    async stopScenario(scenarioId: string): Promise<any> {
        const scenario = await this.getScenarioById(scenarioId);
        return this.simulationService.stopSimulation(scenario.slug);
    }

    async resetScenario(scenarioId: string): Promise<any> {
        const scenario = await this.getScenarioById(scenarioId);
        return this.simulationService.resetSimulation(scenario.slug);
    }

    async getScenarioRuntimeStatus(scenarioId: string): Promise<any> {
        const scenario = await this.getScenarioById(scenarioId);
        return this.simulationService.getSimulationStatus(scenario.slug);
    }

    async getVictimHealthDetailed(scenarioId: string): Promise<any> {
        const scenario = await this.getScenarioById(scenarioId);
        return this.simulationService.getVictimHealthDetailed(scenario.slug);
    }

    async getIDSStatus(): Promise<any> {
        return this.simulationService.getIDSHealth();
    }

    // Questionnaire methods
    async validateQuestionAnswer(
        userId: string,
        scenarioId: string,
        stepOrder: number,
        questionOrder: number,
        userAnswer: string,
    ): Promise<any> {
        const scenario = await this.getScenarioById(scenarioId);
        const step = scenario.steps.find(s => s.stepOrder === stepOrder);

        if (!step || step.stepType !== 'questionnaire') {
            throw new BadRequestException('Invalid step or not a questionnaire step');
        }

        const question = step.questions.find(q => q.questionOrder === questionOrder);
        if (!question) {
            throw new NotFoundException('Question not found');
        }

        // Validate answer
        const isCorrect = this.validateCommand(
            userAnswer,
            question.expectedCommand,
            question.validationType,
            question.validationPattern,
        );

        return {
            correct: isCorrect,
            points: isCorrect ? question.points : 0,
            message: isCorrect ? question.successMessage : question.errorMessage,
            explanation: question.explanation,
            expectedAnswer: !isCorrect ? question.expectedCommand : undefined,
        };
    }

    async calculateQuestionnaireScore(
        userId: string,
        scenarioId: string,
        answers: { stepOrder: number; questionOrder: number; answer: string }[],
    ): Promise<any> {
        const scenario = await this.getScenarioById(scenarioId);

        let totalPoints = 0;
        let earnedPoints = 0;
        const results = [];

        for (const answer of answers) {
            const step = scenario.steps.find(s => s.stepOrder === answer.stepOrder);
            if (step && step.stepType === 'questionnaire') {
                const question = step.questions.find(q => q.questionOrder === answer.questionOrder);
                if (question) {
                    totalPoints += question.points;

                    const isCorrect = this.validateCommand(
                        answer.answer,
                        question.expectedCommand,
                        question.validationType,
                        question.validationPattern,
                    );

                    if (isCorrect) {
                        earnedPoints += question.points;
                    }

                    results.push({
                        stepOrder: answer.stepOrder,
                        questionOrder: answer.questionOrder,
                        correct: isCorrect,
                        points: isCorrect ? question.points : 0,
                    });
                }
            }
        }

        const scorePercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
        const passed = scorePercentage >= 90;

        // Update user progress
        const state = await this.getOrCreateState(userId, scenarioId);
        state.score = scorePercentage;
        state.questionnaireCompleted = true;
        await state.save();

        // Update User Progress Model
        await this.userService.updateProgress(userId, {
            scenarioId,
            status: passed ? 'completed' : 'failed', // Or 'in-progress' if you allow retries without marking failed
            score: scorePercentage,
            title: scenario.title, // Add title for UI display
            difficulty: scenario.difficulty, // Add difficulty for UI display
            timestamp: new Date(),
        });

        return {
            totalPoints,
            earnedPoints,
            scorePercentage: Math.round(scorePercentage),
            passed,
            results,
        };
    }

    async checkSimulationEligibility(userId: string, scenarioId: string): Promise<boolean> {
        const state = await this.scenarioStateModel
            .findOne({ userId, scenarioId })
            .exec();

        if (!state) {
            throw new BadRequestException('Start the questionnaire first');
        }

        if (!state.questionnaireCompleted) {
            throw new BadRequestException('Complete the questionnaire first');
        }

        if (state.score < 90) {
            throw new BadRequestException(
                `Score too low: ${state.score}%. Need 90% to unlock simulation.`
            );
        }

        return true;
    }

    async unlockSimulation(userId: string, scenarioId: string): Promise<any> {
        const eligible = await this.checkSimulationEligibility(userId, scenarioId);

        if (eligible) {
            const state = await this.getUserScenarioState(userId, scenarioId);
            state.simulationUnlocked = true;
            await state.save();

            return {
                message: 'Simulation unlocked! You can now run the attack simulation.',
                unlocked: true,
            };
        }
    }

    async resetQuestionnaire(userId: string, scenarioId: string): Promise<any> {
        const state = await this.getOrCreateState(userId, scenarioId);
        state.score = 0;
        state.questionnaireCompleted = false;
        state.simulationUnlocked = false;
        state.completedSteps = [];
        state.currentStep = 0;
        state.status = 'in-progress';
        await state.save();

        return {
            message: 'Questionnaire reset successfully',
            state,
        };
    }

    // Helper methods
    private async getOrCreateState(userId: string, scenarioId: string): Promise<ScenarioState> {
        let state = await this.scenarioStateModel
            .findOne({ userId, scenarioId })
            .exec();

        if (!state) {
            state = new this.scenarioStateModel({
                userId,
                scenarioId,
                currentStep: 0,
                completedSteps: [],
                attemptCount: 0,
                status: 'in-progress',
                score: 0,
            });
            await state.save();
        }

        return state;
    }

    private validateCommand(
        command: string,
        expectedCommand: string,
        validationType: string,
        validationPattern?: string,
    ): boolean {
        switch (validationType) {
            case 'exact':
                return command.trim().replace(/\s+/g, ' ') === expectedCommand.trim().replace(/\s+/g, ' ');

            case 'regex':
            case 'contains':
                if (!validationPattern) {
                    // If 'contains' without pattern, simple substring check
                    if (validationType === 'contains') {
                        return command.includes(expectedCommand);
                    }
                    return false;
                }
                const regex = new RegExp(validationPattern, 'i'); // Case insensitive default for user friendliness
                return regex.test(command);

            case 'parameterized':
                // Simple parameterized validation: replace placeholders with regex
                // Example: "ls {path}" -> "ls .*"
                if (!validationPattern) {
                    // If no pattern provided, fall back to checking command structure
                    const expectedParts = expectedCommand.split(' ');
                    const commandParts = command.split(' ');
                    if (expectedParts.length !== commandParts.length) {
                        return false;
                    }
                    return expectedParts.every((part, index) => {
                        if (part.startsWith('{') && part.endsWith('}')) {
                            return true; // Parameter, accept any value
                        }
                        return part === commandParts[index];
                    });
                }
                // Use provided pattern
                const paramRegex = new RegExp(validationPattern);
                return paramRegex.test(command);

            default:
                return false;
        }
    }

    private validateAction(action: any, expectedAction: any): boolean {
        // Simple deep comparison for now
        // In a real application, you might want more sophisticated validation
        return JSON.stringify(action) === JSON.stringify(expectedAction);
    }
}
