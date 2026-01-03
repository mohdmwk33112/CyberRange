/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @MessagePattern({ cmd: 'register' })
    async register(createUserDto: CreateUserDto) {
        try {
            const user = await this.authService.register(createUserDto);
            return user;
        } catch (error: any) {
            // Return error in a structured format for the gateway
            return {
                status: 'error',
                statusCode: error.status || 500,
                message: error.message || 'Internal server error'
            };
        }
    }

    @MessagePattern({ cmd: 'login' })
    login(loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }
}
