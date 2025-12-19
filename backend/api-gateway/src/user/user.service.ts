/* eslint-disable prettier/prettier */
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UserService {
    constructor(
        @Inject('Microservices-services') private readonly client: ClientProxy,
    ) { }

    async getProfile(userId: string): Promise<any> {
        return this.client.send({ cmd: 'get-profile' }, userId).toPromise();
    }

    async updateProfile(userId: string, data: any): Promise<any> {
        return this.client
            .send({ cmd: 'update-profile' }, { userId, data })
            .toPromise();
    }

    async deleteUser(userId: string): Promise<any> {
        return this.client.send({ cmd: 'delete-user' }, userId).toPromise();
    }

    async getProgress(userId: string): Promise<any> {
        return this.client.send({ cmd: 'get-progress' }, userId).toPromise();
    }

    async updateProgress(userId: string, data: any): Promise<any> {
        return this.client
            .send({ cmd: 'update-progress' }, { userId, data })
            .toPromise();
    }
}
