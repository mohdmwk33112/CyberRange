/* eslint-disable prettier/prettier */
export class CreateScenarioDto {
    title: string;
    description: string;
    attackType: string;
    difficulty: string;
    steps: CreateScenarioStepDto[];
    completionCriteria: string;
}

export class CreateScenarioStepDto {
    stepOrder: number;
    stepType: 'terminal' | 'web';
    title: string;
    description: string;
    expectedCommand?: string;
    expectedAction?: any;
    validationType?: 'exact' | 'regex' | 'parameterized';
    validationPattern?: string;
    terminalOutput?: string;
    webResponse?: any;
    hints?: string[];
    isOptional?: boolean;
}
