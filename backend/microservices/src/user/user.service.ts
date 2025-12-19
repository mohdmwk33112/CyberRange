/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/user.model';
import { Progress } from './progress.model';

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('Progress') private readonly progressModel: Model<Progress>,
    ) { }

    async getProfile(userId: string): Promise<User> {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user.toObject();
        return result as any;
    }

    async updateProfile(userId: string, data: Partial<User>): Promise<User> {
        const updatedUser = await this.userModel
            .findByIdAndUpdate(userId, data, { new: true })
            .exec();
        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = updatedUser.toObject();
        return result as any;
    }

    async deleteUser(userId: string): Promise<any> {
        return await this.userModel.findByIdAndDelete(userId).exec();
    }

    async getProgress(userId: string): Promise<Progress[]> {
        return await this.progressModel.find({ userId }).exec();
    }

    async updateProgress(userId: string, data: any): Promise<Progress> {
        // Assuming we create a new progress entry for each attempt or update existing if identifying by scenario
        // For now, let's assume we update if exists matching scenario, else create.
        const { scenarioId } = data;
        const existing = await this.progressModel.findOne({ userId, scenarioId }).exec();

        if (existing) {
            return await this.progressModel.findByIdAndUpdate(existing._id, data, { new: true }).exec();
        }

        const newProgress = new this.progressModel({ userId, ...data });
        return await newProgress.save();
    }
}
