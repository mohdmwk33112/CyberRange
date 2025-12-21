/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export const ScenarioStateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    scenarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scenario',
        required: true,
    },
    currentStep: {
        type: Number,
        default: 0,
    },
    completedSteps: {
        type: [Number],
        default: [],
    },
    attemptCount: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'failed'],
        default: 'in-progress',
    },
    score: {
        type: Number,
        default: 0,
    },
    questionnaireCompleted: {
        type: Boolean,
        default: false,
    },
    simulationUnlocked: {
        type: Boolean,
        default: false,
    },
    startedAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Compound index to ensure one state per user per scenario
ScenarioStateSchema.index({ userId: 1, scenarioId: 1 }, { unique: true });
ScenarioStateSchema.index({ userId: 1, status: 1 });

export interface ScenarioState extends Document {
    userId: mongoose.Types.ObjectId;
    scenarioId: mongoose.Types.ObjectId;
    currentStep: number;
    completedSteps: number[];
    attemptCount: number;
    status: 'in-progress' | 'completed' | 'failed';
    score: number;
    questionnaireCompleted: boolean;
    simulationUnlocked: boolean;
    startedAt: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
