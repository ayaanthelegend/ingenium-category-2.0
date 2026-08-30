import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import * as net from 'net';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from './app.module';

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err, origin) => {
  console.error('[Process] Uncaught Exception thrown:', err, 'origin:', origin);
});

async function isPortOpen(host: string, port: number, timeout = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;

    socket.setTimeout(timeout);
    socket.on('connect', () => {
      status = true;
      socket.destroy();
    });
    socket.on('timeout', () => {
      socket.destroy();
    });
    socket.on('error', () => {
      socket.destroy();
    });
    socket.on('close', () => {
      resolve(status);
    });

    socket.connect(port, host);
  });
}

async function bootstrap() {
  dotenv.config();

  const customUri = process.env.MONGO_URI;
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.RAILWAY_ENVIRONMENT;
  const isLocalhost = !isProd && (!customUri || customUri.includes('localhost') || customUri.includes('127.0.0.1'));

  if (isLocalhost) {
    const isMongoRunning = await isPortOpen('127.0.0.1', 27017, 1000);
    if (!isMongoRunning) {
      console.log('[Bootstrap] Local MongoDB (port 27017) not detected. Starting in-memory MongoDB server...');
      try {
        const mongod = await MongoMemoryServer.create();
        process.env.MONGO_URI = mongod.getUri();
        console.log(`[Bootstrap] In-memory MongoDB running at ${process.env.MONGO_URI}`);
      } catch (e) {
        console.error('[Bootstrap] Failed to launch MongoMemoryServer:', e);
      }
    } else {
      console.log('[Bootstrap] Connected to local MongoDB instance on port 27017.');
    }
  }

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 NestJS Backend running on port ${port}`);
}
bootstrap();
