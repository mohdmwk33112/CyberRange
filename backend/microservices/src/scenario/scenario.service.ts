/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Scenario } from './scenario.model';
import { ScenarioState } from './scenario-state.model';
import { SimulationService } from '../simulation/simulation.service';

@Injectable()
export class ScenarioService {

    constructor(
        @InjectModel('Scenario') private readonly scenarioModel: Model<Scenario>,
        @InjectModel('ScenarioState') private readonly scenarioStateModel: Model<ScenarioState>,
        private readonly simulationService: SimulationService,
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
            .exec();
    }

    async getScenarioById(id: string): Promise<Scenario> {
        const scenario = await this.scenarioModel.findById(id).exec();
        if (!scenario) {
            throw new NotFoundException('Scenario not found');
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

        return {
            message: 'Scenario completed successfully',
            state,
            // Here you could emit an event to trigger progress updates, unlock next scenarios, etc.
        };
    }

    async startScenario(scenarioId: string): Promise<any> {
        const scenario = await this.getScenarioById(scenarioId);
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
                return command.trim() === expectedCommand.trim();

            case 'regex':
                if (!validationPattern) {
                    return false;
                }
                const regex = new RegExp(validationPattern);
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
