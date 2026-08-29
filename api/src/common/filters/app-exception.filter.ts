import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AppError, CustomError } from '../../helpers/errors.helper';
import logger from '../../helpers/logger.helper';
import { LogsService } from '../../services/logs.service';
import { LogReferenceTypes, LogTypes } from '../../constants/logs.constants';
import { UUID } from '../../types';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(private readonly logsService: LogsService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof AppError) {
      logger.debug(exception.message);
      this.logsService.createLog({
        type: exception.errorCode,
        message: exception.message,
        userId: exception?.data?.userId
          ? (exception.data.userId as UUID)
          : undefined,
        referenceId: exception?.data?.referenceId,
        referenceType: exception?.data?.referenceType,
      });

      return response.status(exception.statusCode).json({
        message: exception.message,
        data: exception?.data,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const body = exceptionResponse as Record<string, unknown>;
        if ('message' in body) {
          return response.status(status).json({
            message: body.message,
            ...(body.data !== undefined ? { data: body.data } : {}),
          });
        }
      }

      return response.status(status).json({
        message: exception.message,
      });
    }

    const err = exception as CustomError;
    logger.error({
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
      ...(err?.data && { data: err.data }),
    });

    this.logsService.createLog({
      type: LogTypes.INTERNAL_SERVER_ERROR,
      message: err?.message,
      userId: err?.data?.userId ? (err.data.userId as UUID) : undefined,
      referenceId: err?.data?.referenceId,
      referenceType:
        err?.data?.referenceType || LogReferenceTypes.INTERNAL_SERVER_ERROR,
    });

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: err?.message || 'Internal server error',
    });
  }
}
