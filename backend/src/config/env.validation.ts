import { plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  PORT = 3000;

  @IsUrl({ require_tld: false })
  CORS_ORIGIN = 'http://localhost:5173';

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_ACCESS_EXPIRES = '15m';

  @IsString()
  JWT_REFRESH_EXPIRES = '7d';

  @IsString()
  LLM_PROVIDER = 'gemini';

  @IsOptional()
  @IsString()
  GEMINI_API_KEY?: string;

  @IsString()
  GEMINI_MODEL = 'gemini-2.5-flash';

  @IsOptional()
  @IsString()
  CLOUDINARY_CLOUD_NAME?: string;

  @IsOptional()
  @IsString()
  CLOUDINARY_API_KEY?: string;

  @IsOptional()
  @IsString()
  CLOUDINARY_API_SECRET?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  THROTTLE_TTL = 60_000;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  THROTTLE_LIMIT = 100;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validated;
}
