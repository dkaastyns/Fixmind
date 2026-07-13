import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { errorResponse, type ApiFieldError } from '../types/api-response';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: ApiFieldError[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const payload = body as Record<string, unknown>;
        message = (payload.message as string) ?? message;

        if (Array.isArray(payload.message)) {
          errors = payload.message.map((msg) => ({
            field: 'request',
            message: String(msg),
          }));
          message = 'Validation failed';
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    } else {
      this.logger.error('Unknown non-Error exception thrown', String(exception));
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    response.status(status).json(errorResponse(message, errors));
  }
}
