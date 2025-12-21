/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

// Embedded ScenarioStep schema
export const ScenarioStepSchema = new mongoose.Schema({
    stepOrder: {
        type: Number,
        required: true,
    },
    stepType: {
        type: String,
        enum: ['terminal', 'web'],
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

export interface ScenarioStep {
    stepOrder: number;
    stepType: 'terminal' | 'web';
    title: string;
    description: string;
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
