import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

import * as dotenv from 'dotenv';
dotenv.config();

const server = express();
let isAppInitialized = false;

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });
  await app.init();
  isAppInitialized = true;
}

export default async function handler(req: any, res: any) {
  const commitRef = process.env.VERCEL_GIT_COMMIT_REF;
  if (process.env.VERCEL === '1' && commitRef === 'main') {
    return res.status(403).send('Deployment on the main branch is disabled. Only the Ingenium-edition-2026 branch is active.');
  }
  if (!isAppInitialized) {
    await bootstrap();
  }
  server(req, res);
}
