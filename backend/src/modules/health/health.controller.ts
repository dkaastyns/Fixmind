import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/roles.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      message: 'ASETKITA Semarang API is healthy',
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
