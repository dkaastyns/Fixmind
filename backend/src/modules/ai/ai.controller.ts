import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RagService } from './services/rag.service';

@Controller('ai')
export class AiController {
  constructor(private readonly ragService: RagService) {}

  @Roles('USER', 'TECHNICIAN', 'ADMIN')
  @Post('chat')
  async chat(@CurrentUser() user: AuthUser, @Body('prompt') prompt: string) {
    if (!prompt) return { answer: 'Please provide a prompt.' };
    
    const answer = await this.ragService.chat(prompt, user.id);
    return { answer };
  }

  @Roles('ADMIN')
  @Post('seed')
  async seed() {
    await this.ragService.seedKnowledge();
    return { message: 'Seeding completed' };
  }
}
