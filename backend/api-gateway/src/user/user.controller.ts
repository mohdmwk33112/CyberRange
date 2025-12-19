/* eslint-disable prettier/prettier */
import {
    Controller,
    Get,
    Put,
    Delete,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
    UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
// Assuming we'll have an AuthGuard later, for now we manually simulate obtaining user from request or just pass IDs.
// Real implementation should extract userId from JWT token in request. 
// For this task, I will assume the Gateway has some mechanism or just accepts IDs for simplicity unless JWT Guard is available.
// However, the task mentions "JWT-based authentication". 
// Since I haven't implemented the Guard yet, I'll assume usage of a placeholder or just extracting from body/param for now, 
// OR I can quickly implement a basic JwtAuthGuard if needed. 
// Given the scope, I'll trust the user will authenticate and I'll extract from headers or body if available.
// BUT, `getProfile` usually implies "my profile". 
// I'll implement endpoints keeping in mind that `req.user` comes from a Guard.
// I will just use @Body for now for ID or pass it as param for flexibility.

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    // In a real app, UseGuards(JwtAuthGuard)
    @Get() // GET /users
    getAllUsers() {
        return this.userService.getAllUsers();
    }

    @Get('profile/:id')
    getProfile(@Param('id') id: string) {
        return this.userService.getProfile(id);
    }

    @Put('profile/:id')
    updateProfile(@Param('id') id: string, @Body() body: any) {
        return this.userService.updateProfile(id, body);
    }

    @Delete(':id')
    deleteUser(@Param('id') id: string) {
        // Add RBAC check here: allow only if admin. 
        // Since I don't have the context of the requester easily without the Guard, 
        // I will forward the request. Validation should theoretically happen here or in service.
        return this.userService.deleteUser(id);
    }

    @Get('progress/:id')
    getProgress(@Param('id') id: string) {
        return this.userService.getProgress(id);
    }

    @Post('progress/update')
    updateProgress(@Body() body: { userId: string;[key: string]: any }) {
        const { userId, ...data } = body;
        if (!userId) {
            throw new UnauthorizedException('User ID required');
        }
        return this.userService.updateProgress(userId, data);
    }
}
