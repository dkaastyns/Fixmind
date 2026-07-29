import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as net from 'net';

@Injectable()
export class VirusScannerService {
  private readonly logger = new Logger(VirusScannerService.name);

  constructor(private readonly config: ConfigService) {}

  async scanFile(buffer: Buffer, filename: string): Promise<void> {
    const clamavHost = this.config.get<string>('CLAMAV_HOST');
    const clamavPort = Number(this.config.get<string | number>('CLAMAV_PORT') ?? 3310);
    const vtApiKey = this.config.get<string>('VIRUSTOTAL_API_KEY');

    if (clamavHost) {
      this.logger.log(`Scanning file ${filename} with ClamAV at ${clamavHost}:${clamavPort}`);
      const isInfected = await this.scanClamAV(buffer, clamavHost, clamavPort);
      if (isInfected) {
        throw new BadRequestException('Berkas ditolak karena terdeteksi mengandung virus atau malware oleh ClamAV.');
      }
      return;
    }

    if (vtApiKey) {
      this.logger.log(`Scanning file ${filename} using VirusTotal API`);
      const isInfected = await this.scanVirusTotal(buffer, vtApiKey);
      if (isInfected) {
        throw new BadRequestException('Berkas ditolak karena terdeteksi mengandung virus atau malware oleh VirusTotal.');
      }
      return;
    }

    this.logger.warn(
      `Peringatan keamanan: Pemindai virus tidak dikonfigurasi (CLAMAV_HOST atau VIRUSTOTAL_API_KEY tidak diatur). Pemindaian untuk ${filename} dilewati.`,
    );
  }

  private scanClamAV(buffer: Buffer, host: string, port: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const client = net.connect({ host, port }, () => {
        // Send INSTREAM command (zINSTREAM ends with \0)
        client.write('zINSTREAM\0');

        // Stream the buffer in chunks
        const chunkSize = 8192;
        let offset = 0;

        while (offset < buffer.length) {
          const chunk = buffer.subarray(offset, offset + chunkSize);
          const sizeBuf = Buffer.alloc(4);
          sizeBuf.writeUInt32BE(chunk.length, 0);

          client.write(sizeBuf);
          client.write(chunk);

          offset += chunkSize;
        }

        // Send 0 size chunk to signal EOF
        const zeroBuf = Buffer.alloc(4);
        zeroBuf.writeUInt32BE(0, 0);
        client.write(zeroBuf);
      });

      let response = '';
      client.on('data', (chunk) => {
        response += chunk.toString();
      });

      client.on('end', () => {
        this.logger.log(`ClamAV response: ${response.trim()}`);
        if (response.includes('FOUND')) {
          resolve(true); // Infected
        } else {
          resolve(false); // Clean
        }
      });

      client.on('error', (err) => {
        this.logger.error(`ClamAV connection error: ${err.message}`);
        // In case ClamAV is offline in dev/staging, we can log and let it pass or fail.
        // But for production safety, we default to block or reject if connection fails.
        // Let's reject for maximum security!
        reject(new Error(`ClamAV service connection failed: ${err.message}`));
      });
    });
  }

  private async scanVirusTotal(buffer: Buffer, apiKey: string): Promise<boolean> {
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    this.logger.log(`Checking VirusTotal registry for hash: ${hash}`);

    try {
      // 1. Check hash registry first
      const res = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
        headers: { 'x-apikey': apiKey },
      });

      if (res.ok) {
        const body = (await res.json()) as any;
        const stats = body?.data?.attributes?.last_analysis_stats;
        if (stats && (stats.malicious > 0 || stats.suspicious > 0)) {
          this.logger.warn(`Hash found in VirusTotal registry with malicious/suspicious stats: ${JSON.stringify(stats)}`);
          return true;
        }
        this.logger.log('Hash found in VirusTotal registry and is clean.');
        return false;
      }

      if (res.status === 404) {
        this.logger.log('Hash not found in registry. Uploading file to VirusTotal...');
        // 2. Upload file if not registered
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(buffer)], { type: 'application/octet-stream' });
        formData.append('file', blob, 'upload.tmp');

        const uploadRes = await fetch('https://www.virustotal.com/api/v3/files', {
          method: 'POST',
          headers: { 'x-apikey': apiKey },
          body: formData,
        });

        if (!uploadRes.ok) {
          const errMsg = await uploadRes.text();
          this.logger.error(`VirusTotal upload failed: ${uploadRes.status} ${errMsg}`);
          return false;
        }

        this.logger.log('File successfully uploaded to VirusTotal for analysis.');
        return false; // Free API doesn't wait for analysis block, we assume clean for immediate flow
      }

      this.logger.warn(`VirusTotal hash check returned status: ${res.status}`);
      return false;
    } catch (err: any) {
      this.logger.error(`VirusTotal API error: ${err.message}`);
      return false;
    }
  }
}
