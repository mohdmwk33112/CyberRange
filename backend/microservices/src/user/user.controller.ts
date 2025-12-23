/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) { }

    @MessagePattern({ cmd: 'get-profile' })
    getProfile(userId: string) {
        return this.userService.getProfile(userId);
    }

    @MessagePattern({ cmd: 'get-all-users' })
    getAllUsers() {
        return this.userService.getAllUsers();
    }

    @MessagePattern({ cmd: 'update-profile' })
    updateProfile(payload: { userId: string; data: any }) {
        return this.userService.updateProfile(payload.userId, payload.data);
    }

    @MessagePattern({ cmd: 'delete-user' })
    async deleteUser(@Payload() id: string) {
        return this.userService.deleteUser(id);
    }

    @MessagePattern({ cmd: 'reset-password' })
    async resetPassword(@Payload() data: { id: string, password: string }) {
        return this.userService.resetPassword(data.id, data.password);
    }

    @MessagePattern({ cmd: 'get-progress' })
    getProgress(userId: string) {
        return this.userService.getProgress(userId);
    }

    @MessagePattern({ cmd: 'update-progress' })
    updateProgress(payload: { userId: string; data: any }) {
        return this.userService.updateProgress(payload.userId, payload.data);
    }
}
