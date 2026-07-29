import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from './services/cloudinary.service';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { VirusScannerService } from './services/virus-scanner.service';

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryProvider, CloudinaryService, VirusScannerService],
  exports: [CloudinaryService, VirusScannerService],
})
export class CloudinaryModule {}
