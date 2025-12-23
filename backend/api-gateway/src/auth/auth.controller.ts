/* eslint-disable prettier/prettier */
import { Controller, Post, Body, UnauthorizedException, Ip, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    register(@Body() body: any) {
        return this.authService.register(body);
    }

    @Post('login')
    async login(@Body() body: any, @Ip() ip: string, @Req() req: Request) {
        const user = await this.authService.login({
            ...body,
            ip,
            userAgent: req.headers['user-agent'],
        });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return user;
    }
}
