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
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        private readonly jwtService: JwtService,
        private readonly auditService: AuditService,
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

    async login(loginUserDto: LoginUserDto & { ip?: string; userAgent?: string }) {
        const user = await this.validateUser(loginUserDto.username, loginUserDto.password);

        if (!user) {
            await this.auditService.log({
                username: loginUserDto.username,
                ip: loginUserDto.ip || 'unknown',
                status: 'FAILURE',
                userAgent: loginUserDto.userAgent,
                details: 'Invalid credentials'
            });
            return null;
        }

        await this.auditService.log({
            username: user.username,
            ip: loginUserDto.ip || 'unknown',
            status: 'SUCCESS',
            userAgent: loginUserDto.userAgent,
            details: 'Successful login'
        });

        const payload = { username: user.username, sub: user._id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
