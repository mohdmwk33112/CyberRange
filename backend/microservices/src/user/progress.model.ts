/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export const ProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    scenarioId: {
        type: String, // Or ObjectId if scenarios are in DB, assuming String ID based on task description
        required: true,
    },
    status: {
        type: String,
        enum: ['started', 'completed', 'failed'],
        default: 'started',
    },
    score: {
        type: Number,
        default: 0,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

export interface Progress extends Document {
    userId: string;
    scenarioId: string;
    status: string;
    score: number;
    difficulty: string;
    timestamp: Date;
}
