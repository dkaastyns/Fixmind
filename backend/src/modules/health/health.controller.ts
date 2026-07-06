import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/roles.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      message: 'FixMind API is healthy',
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
