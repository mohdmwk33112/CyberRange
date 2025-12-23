
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const authService = app.get(AuthService);
    const userService = app.get(UserService);

    const adminEmail = 'admin@cyberrange.io';
    const adminUsername = 'admin';
    const adminPassword = 'Admin123!';

    console.log('Checking for existing admin user...');

    // We don't have getByEmail easily without peeking at db or adding method, 
    // but we have getAllUsers or can use validateUser logic. 
    // Let's rely on AuthService.register which might throw if duplicate, or check via UserService.

    const users = await userService.getAllUsers();
    const adminExists = users.find(u => u.email === adminEmail || u.username === adminUsername);

    if (adminExists) {
        console.log('Admin user already exists.');
    } else {
        console.log('Creating admin user...');
        try {
            await authService.register({
                username: adminUsername,
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            });
            console.log('Admin user created successfully.');
            console.log(`Username: ${adminUsername} `);
            console.log(`Password: ${adminPassword} `);
        } catch (error) {
            console.error('Failed to create admin user:', error);
        }
    }

    await app.close();
}

bootstrap();
