import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  // SECURITY: Password wajib mengandung minimal 1 huruf besar dan 1 angka.
  // Mencegah password lemah seperti 'password' atau 'qwerty123'.
  @Matches(/(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Password harus mengandung minimal 1 huruf besar dan 1 angka',
  })
  password!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsBoolean()
  isAdmin!: boolean;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @IsOptional()
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(8)
  // SECURITY: Password wajib mengandung minimal 1 huruf besar dan 1 angka.
  @Matches(/(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Password harus mengandung minimal 1 huruf besar dan 1 angka',
  })
  password?: string;

  // SECURITY: avatarUrl DIHAPUS dari UpdateUserDto.
  // avatarUrl hanya boleh di-set melalui endpoint POST /auth/profile/avatar
  // yang menggunakan upload ke Cloudinary secara tervalidasi.
  // Mengizinkan admin set avatarUrl langsung membuka celah injeksi URL arbitrary.
}

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  // SECURITY: Password wajib mengandung minimal 1 huruf besar dan 1 angka.
  @Matches(/(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Password harus mengandung minimal 1 huruf besar dan 1 angka',
  })
  password!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
