/* eslint-disable prettier/prettier */
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";
//import { Logger } from "@nestjs/common";


async function bootstrap() {


  const app = await NestFactory.createMicroservice<MicroserviceOptions> (AppModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      post: '3000'
    }
  });
  await app.listen();
  console.log("Microservices TCP is running on PORT: 3000")
}

bootstrap()