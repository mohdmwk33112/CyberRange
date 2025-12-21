/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        private readonly jwtService: JwtService,
    ) { }

    async register(createUserDto: CreateUserDto): Promise<User> {
        const { username, email, password, role } = createUserDto;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new this.userModel({
            username,
            email,
            password: hashedPassword,
            role: role || 'student',
        });
        try {
            return await newUser.save();
        } catch (error) {
            const logPath = path.join(process.cwd(), 'microservice_error.log');
            fs.appendFileSync(logPath, `Registration Error: ${JSON.stringify(error)}\n`);
            console.error('Registration Error:', error);
            throw error;
        }
    }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.userModel.findOne({ username });
        if (user && (await bcrypt.compare(pass, user.password))) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    async login(loginUserDto: LoginUserDto) {
        const user = await this.validateUser(loginUserDto.username, loginUserDto.password);
        if (!user) {
            return null;
        }
        const payload = { username: user.username, sub: user._id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
