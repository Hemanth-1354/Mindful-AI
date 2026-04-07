import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);



  // Enable CORS
  app.enableCors({
    origin: ['https://mindful-ai-rosy.vercel.app', 'http://localhost:3000'], // Allow both production and local dev
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Set to true if cookies need to be included
  });

  const config = new DocumentBuilder()
  .setTitle('Mindful AI API End Points')       // Set your API title
  .setDescription('API Description') // Set your API description
  .setVersion('1.0')                // API version
  .addTag('cats')                   // Add tags if needed
  .build();

  const document = SwaggerModule.createDocument(app,config)

  SwaggerModule.setup('api', app, document)

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
