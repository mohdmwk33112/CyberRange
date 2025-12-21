/* eslint-disable prettier/prettier */
import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
} from '@nestjs/common';
import { ScenarioService } from './scenario.service';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { ValidateCommandDto } from './dto/validate-command.dto';
import { ValidateActionDto } from './dto/validate-action.dto';

@Controller('scenarios')
export class ScenarioController {
    constructor(private readonly scenarioService: ScenarioService) { }

    @Post()
    createScenario(@Body() createScenarioDto: CreateScenarioDto) {
        return this.scenarioService.createScenario(createScenarioDto);
    }

    @Get()
    getAllScenarios() {
        return this.scenarioService.getAllScenarios();
    }

    @Get(':id')
    getScenarioById(@Param('id') id: string) {
        return this.scenarioService.getScenarioById(id);
    }

    @Post(':id/validate-command')
    validateTerminalCommand(
        @Param('id') scenarioId: string,
        @Body() validateCommandDto: ValidateCommandDto,
    ) {
        return this.scenarioService.validateTerminalCommand(
            validateCommandDto.userId,
            scenarioId,
            validateCommandDto.command,
        );
    }

    @Post(':id/validate-action')
    validateWebAction(
        @Param('id') scenarioId: string,
        @Body() validateActionDto: ValidateActionDto,
    ) {
        return this.scenarioService.validateWebAction(
            validateActionDto.userId,
            scenarioId,
            validateActionDto.action,
        );
    }

    @Get(':id/state/:userId')
    getUserScenarioState(
        @Param('id') scenarioId: string,
        @Param('userId') userId: string,
    ) {
        return this.scenarioService.getUserScenarioState(userId, scenarioId);
    }

    @Put(':id/state/:userId')
    updateScenarioState(
        @Param('id') scenarioId: string,
        @Param('userId') userId: string,
        @Body() data: any,
    ) {
        return this.scenarioService.updateScenarioState(userId, scenarioId, data);
    }

    @Post(':id/complete/:userId')
    completeScenario(
        @Param('id') scenarioId: string,
        @Param('userId') userId: string,
    ) {
        return this.scenarioService.completeScenario(userId, scenarioId);
    }

    @Post(':id/start')
    startScenario(@Param('id') id: string) {
        return this.scenarioService.startScenario(id);
    }

    @Post(':id/stop')
    stopScenario(@Param('id') id: string) {
        return this.scenarioService.stopScenario(id);
    }

    @Post(':id/reset')
    resetScenario(@Param('id') id: string) {
        return this.scenarioService.resetScenario(id);
    }

    @Get(':id/status')
    getScenarioRuntimeStatus(@Param('id') id: string) {
        return this.scenarioService.getScenarioRuntimeStatus(id);
    }

    // Questionnaire endpoints
    @Post(':id/validate-answer')
    validateQuestionAnswer(
        @Param('id') scenarioId: string,
        @Body() body: { userId: string; stepOrder: number; questionOrder: number; answer: string },
    ) {
        return this.scenarioService.validateQuestionAnswer(
            body.userId,
            scenarioId,
            body.stepOrder,
            body.questionOrder,
            body.answer,
        );
    }

    @Post(':id/calculate-score')
    calculateQuestionnaireScore(
        @Param('id') scenarioId: string,
        @Body() body: { userId: string; answers: { stepOrder: number; questionOrder: number; answer: string }[] },
    ) {
        return this.scenarioService.calculateQuestionnaireScore(
            body.userId,
            scenarioId,
            body.answers,
        );
    }

    @Get(':id/simulation-eligibility/:userId')
    checkSimulationEligibility(
        @Param('id') scenarioId: string,
        @Param('userId') userId: string,
    ) {
        return this.scenarioService.checkSimulationEligibility(userId, scenarioId);
    }

    @Post(':id/unlock-simulation/:userId')
    unlockSimulation(
        @Param('id') scenarioId: string,
        @Param('userId') userId: string,
    ) {
        return this.scenarioService.unlockSimulation(userId, scenarioId);
    }
}
