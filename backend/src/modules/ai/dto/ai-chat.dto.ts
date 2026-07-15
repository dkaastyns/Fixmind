import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * DTO untuk validasi request ke endpoint AI chat.
 * MaxLength(2000) mencegah prompt yang sangat panjang yang bisa
 * menyebabkan DoS pada LLM API atau biaya token yang tidak terkendali.
 */
export class AiChatDto {
  @IsString()
  @IsNotEmpty({ message: 'Prompt tidak boleh kosong' })
  @MaxLength(2000, { message: 'Prompt tidak boleh melebihi 2000 karakter' })
  prompt!: string;
}
