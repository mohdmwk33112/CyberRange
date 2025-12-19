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
    register(createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    @MessagePattern({ cmd: 'login' })
    login(loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }
}
