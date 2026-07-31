import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // SECURITY: trust proxy agar req.ip akurat di balik Nginx reverse proxy.
  // Tanpa ini, req.ip selalu menampilkan IP internal Docker (172.x.x.x)
  // yang membuat account lockout per-IP dan audit log tidak akurat.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.setGlobalPrefix('api/v1');

  // SECURITY: Helmet dengan konfigurasi eksplisit.
  // contentSecurityPolicy dikonfigurasi untuk mengizinkan resource dari
  // Cloudinary (avatar), Google Fonts, dan self.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
          // SECURITY: connectSrc di-set ke 'self' karena client-side browser
          // tidak melakukan request langsung ke pihak ketiga (seperti Cloudinary
          // atau LLM endpoints). Upload file dan query AI dijembatani/diproses
          // server-side oleh backend API.
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // diperlukan untuk beberapa browser compat
    }),
  );
  app.use(compression());
  app.use(cookieParser());

  // SECURITY: Parse CORS_ORIGIN dan pastikan hanya localhost yang diizinkan di development.
  const rawCorsOrigin = config.get<string>('CORS_ORIGIN', 'http://localhost:5173');
  const isProd = config.get<string>('NODE_ENV') === 'production';
  const origins = rawCorsOrigin.split(',').map((o) => o.trim());

  if (!isProd) {
    for (const origin of origins) {
      let url: URL;
      try {
        url = new URL(origin);
      } catch (err) {
        throw new Error(
          `Invalid CORS_ORIGIN format: ${origin}. ${err instanceof Error ? err.message : ''}`,
        );
      }
      if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
        throw new Error(
          `Security Exception: Non-localhost CORS origin (${origin}) detected in development environment.`,
        );
      }
    }
  }

  app.enableCors({
    origin: origins.length === 1 ? origins[0] : origins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
}

bootstrap();
