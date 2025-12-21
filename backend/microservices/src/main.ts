/* eslint-disable prettier/prettier */
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";
//import { Logger } from "@nestjs/common";


async function bootstrap() {


  // Create hybrid application (HTTP + Microservice)
  const app = await NestFactory.create(AppModule);

  // Enable CORS for WebSocket connection
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Connect Microservice Transport
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3011
    }
  });

  await app.startAllMicroservices();
  await app.listen(3001);
  console.log("Microservices HTTP/WS running on PORT: 3001");
  console.log("Microservices TCP running on PORT: 3011");
}

bootstrap()