import { Global, Module, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createSqlConnection, SQL_TOKEN, type Sql } from './sql';

@Global()
@Module({
  providers: [
    {
      provide: SQL_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>('DATABASE_URL');
        return createSqlConnection(url);
      },
    },
  ],
  exports: [SQL_TOKEN],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(SQL_TOKEN) private readonly sql: Sql) {}

  async onModuleDestroy() {
    await this.sql.end();
  }
}
