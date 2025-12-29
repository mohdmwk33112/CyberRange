/* eslint-disable prettier/prettier */
import { Injectable, Inject, ConflictException, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthService {
    constructor(
        @Inject('Microservices-services') private readonly client: ClientProxy,
    ) { }

    async register(data: any): Promise<any> {
        const result = await this.client.send({ cmd: 'register' }, data).toPromise();

        // Check if the result is an error response
        if (result && result.status === 'error') {
            if (result.statusCode === 409 || result.message.includes('already registered')) {
                throw new ConflictException(result.message);
            }
            throw new UnauthorizedException(result.message);
        }

        return result;
    }

    async login(data: any): Promise<any> {
        return this.client.send({ cmd: 'login' }, data).toPromise();
    }
}
