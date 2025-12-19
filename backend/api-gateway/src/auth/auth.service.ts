/* eslint-disable prettier/prettier */
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthService {
    constructor(
        @Inject('Microservices-services') private readonly client: ClientProxy,
    ) { }

    async register(data: any): Promise<any> {
        return this.client.send({ cmd: 'register' }, data).toPromise();
    }

    async login(data: any): Promise<any> {
        return this.client.send({ cmd: 'login' }, data).toPromise();
    }
}
