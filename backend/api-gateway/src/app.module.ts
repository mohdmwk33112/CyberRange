/* eslint-disable prettier/prettier */

// api-gateway/src/app.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ScenarioModule } from './scenario/scenario.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'Microservices-services',
        transport: Transport.TCP,
        options: { port: 3000 },
      },
    ]),
    AuthModule,
    UserModule,
    ScenarioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }