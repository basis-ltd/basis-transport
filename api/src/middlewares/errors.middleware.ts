import { NextFunction, Request, Response } from 'express';
import { AppError, CustomError } from '../helpers/errors.helper';
import logger from '../helpers/logger.helper';
import { LogsService } from '../services/logs.service';
import { LogReferenceTypes, LogTypes } from '../constants/logs.constants';
import { UUID } from '../types';

// INITIALIZE LOGS SERVICE
const logsService = new LogsService();

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.debug(err.message);
    logsService.createLog({
      type: err?.errorCode,
      message: err.message,
      userId: err?.data?.userId ? (err?.data?.userId as UUID) : undefined,
      referenceId: err?.data?.referenceId,
      referenceType: err?.data?.referenceType,
    });

    return res.status(err.statusCode).json({
      message: err.message,
      data: err?.data,
    });
  }

  // FOR UNHANDLED ERRORS
  logger.error({
    message: err.message,
    stack: err.stack,
    name: err.name,
    ...(err.data && { data: err.data }),
  });
  logsService.createLog({
    type: LogTypes.INTERNAL_SERVER_ERROR,
    message: err.message,
    userId: err?.data?.userId ? (err?.data?.userId as UUID) : undefined,
    referenceId: err?.data?.referenceId,
    referenceType:
      err?.data?.referenceType || LogReferenceTypes.INTERNAL_SERVER_ERROR,
  });
  return res.status(500).json({
    message: err.message,
  });
};

export default errorHandler;
