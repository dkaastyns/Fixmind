import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RagService } from './services/rag.service';
import { AiChatDto } from './dto/ai-chat.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly ragService: RagService) {}

  @Roles('USER', 'ADMIN')
  @Post('chat')
  // SECURITY: Menggunakan DTO tervalidasi (MaxLength 2000) alih-alih string mentah.
  // Ini mencegah prompt jutaan karakter yang bisa menyebabkan DoS pada LLM API.
  async chat(@CurrentUser() user: AuthUser, @Body() dto: AiChatDto) {
    const answer = await this.ragService.chat(dto.prompt, user.id);
    return { answer };
  }

  @Roles('ADMIN')
  @Post('seed')
  async seed() {
    await this.ragService.seedKnowledge();
    return { message: 'Seeding completed' };
  }
}
