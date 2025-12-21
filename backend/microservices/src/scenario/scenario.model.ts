/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

// Question schema for questionnaire steps
export const QuestionSchema = new mongoose.Schema({
    questionOrder: {
        type: Number,
        required: true,
    },
    questionText: {
        type: String,
        required: true,
    },
    expectedCommand: {
        type: String,
        required: true,
    },
    validationType: {
        type: String,
        enum: ['exact', 'regex', 'contains'],
        default: 'exact',
    },
    validationPattern: {
        type: String,
    },
    caseSensitive: {
        type: Boolean,
        default: false,
    },
    points: {
        type: Number,
        required: true,
        default: 10,
    },
    hints: {
        type: [String],
        default: [],
    },
    successMessage: {
        type: String,
    },
    errorMessage: {
        type: String,
    },
    explanation: {
        type: String,
    },
}, { _id: false });

// Learning content schema
export const LearningContentSchema = new mongoose.Schema({
    objectives: {
        type: [String],
        default: [],
    },
    theory: {
        type: String,
    },
    examples: [{
        title: String,
        description: String,
        command: String,
        output: String,
    }],
    keyPoints: {
        type: [String],
        default: [],
    },
    resources: [{
        title: String,
        url: String,
    }],
}, { _id: false });

// Embedded ScenarioStep schema
export const ScenarioStepSchema = new mongoose.Schema({
    stepOrder: {
        type: Number,
        required: true,
    },
    stepType: {
        type: String,
        enum: ['terminal', 'web', 'learning', 'questionnaire'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    // For learning steps
    learningContent: {
        type: LearningContentSchema,
        required: function () {
            return this.stepType === 'learning';
        },
    },
    // For questionnaire steps
    questions: {
        type: [QuestionSchema],
        required: function () {
            return this.stepType === 'questionnaire';
        },
    },
    // For terminal steps (legacy/simulation)
    expectedCommand: {
        type: String,
        required: function () {
            return this.stepType === 'terminal';
        },
    },
    expectedAction: {
        type: mongoose.Schema.Types.Mixed,
        required: function () {
            return this.stepType === 'web';
        },
    },
    validationType: {
        type: String,
        enum: ['exact', 'regex', 'parameterized'],
        default: 'exact',
    },
    validationPattern: {
        type: String,
    },
    terminalOutput: {
        type: String,
    },
    webResponse: {
        type: mongoose.Schema.Types.Mixed,
    },
    hints: {
        type: [String],
        default: [],
    },
    isOptional: {
        type: Boolean,
        default: false,
    },
}, { _id: false });

export const ScenarioSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    attackType: {
        type: String,
        enum: ['XSS', 'SQLi', 'brute-force', 'RCE', 'CSRF', 'LFI', 'RFI', 'XXE', 'SSRF', 'other'],
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true,
    },
    steps: {
        type: [ScenarioStepSchema],
        required: true,
        validate: {
            validator: function (steps: any[]) {
                return steps && steps.length > 0;
            },
            message: 'Scenario must have at least one step',
        },
    },
    completionCriteria: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

// Add indexes
ScenarioSchema.index({ attackType: 1, difficulty: 1 });
ScenarioSchema.index({ createdAt: -1 });

export interface Question {
    questionOrder: number;
    questionText: string;
    expectedCommand: string;
    validationType: 'exact' | 'regex' | 'contains';
    validationPattern?: string;
    caseSensitive: boolean;
    points: number;
    hints: string[];
    successMessage?: string;
    errorMessage?: string;
    explanation?: string;
}

export interface LearningContent {
    objectives: string[];
    theory?: string;
    examples: {
        title: string;
        description: string;
        command: string;
        output: string;
    }[];
    keyPoints: string[];
    resources: {
        title: string;
        url: string;
    }[];
}

export interface ScenarioStep {
    stepOrder: number;
    stepType: 'terminal' | 'web' | 'learning' | 'questionnaire';
    title: string;
    description: string;
    // Learning step fields
    learningContent?: LearningContent;
    // Questionnaire step fields
    questions?: Question[];
    // Terminal step fields (legacy/simulation)
    expectedCommand?: string;
    expectedAction?: any;
    validationType: 'exact' | 'regex' | 'parameterized';
    validationPattern?: string;
    terminalOutput?: string;
    webResponse?: any;
    hints: string[];
    isOptional: boolean;
}

export interface Scenario extends Document {
    slug: string;
    title: string;
    description: string;
    attackType: string;
    difficulty: string;
    steps: ScenarioStep[];
    completionCriteria: string;
    createdAt: Date;
    updatedAt: Date;
}
