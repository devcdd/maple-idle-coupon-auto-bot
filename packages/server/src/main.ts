import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { API_TAGS, API_TAG_DESCRIPTIONS } from './constants/messages';

async function bootstrap() {
  const port = parseInt(process.env.SERVER_PORT || '5000', 10);

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('메키스 API')
    .setDescription('메키스 시스템 API')
    .setVersion('1.0')
    .addTag(API_TAGS.USERS, API_TAG_DESCRIPTIONS[API_TAGS.USERS])
    .addTag(API_TAGS.COUPONS, API_TAG_DESCRIPTIONS[API_TAGS.COUPONS])
    .addTag(API_TAGS.AUTO, API_TAG_DESCRIPTIONS[API_TAGS.AUTO])
    .addTag(API_TAGS.ADMIN, API_TAG_DESCRIPTIONS[API_TAGS.ADMIN])
    .addTag(API_TAGS.AUTH, API_TAG_DESCRIPTIONS[API_TAGS.AUTH])
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // CORS 설정
  app.enableCors({
    origin: [
      'http://localhost:4000', // 클라이언트 개발 서버
      'http://localhost:3000', // 대체 포트
      'http://127.0.0.1:4000', // IPv4 localhost
      'http://127.0.0.1:3000', // IPv4 localhost 대체
      'https://makis.cdd.co.kr', // 프로덕션 도메인
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
    exposedHeaders: ['x-access-token', 'x-refresh-token'], // 클라이언트에서 접근 가능하도록 설정
  });

  // Cookie Parser 설정
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());

  // Graceful shutdown 설정
  app.enableShutdownHooks();

  await app.listen(port);
  console.log(`🚀 서버가 포트 ${port}에서 실행 중입니다.`);

  // 프로세스 종료 시 graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT 신호를 받았습니다. 서버를 종료합니다...');
    await app.close();
    process.exit(0);
  });
}
void bootstrap();
