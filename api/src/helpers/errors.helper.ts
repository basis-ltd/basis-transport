import { LogReferenceTypes, LogTypes } from '../constants/logs.constants';
import { UUID } from '../types';

export interface CustomError extends Error {
  data:
    | { userId?: UUID; referenceId?: string; referenceType?: LogReferenceTypes }
    | null
    | undefined;
}

export class AppError extends Error implements CustomError {
  statusCode: number;
  errorCode: LogTypes;
  data:
    | { userId?: UUID; referenceId?: string; referenceType?: LogReferenceTypes }
    | null
    | undefined;

  constructor(
    message: string,
    statusCode: number,
    errorCode: LogTypes = LogTypes.INTERNAL_SERVER_ERROR,
    data:
      | {
          userId?: UUID;
          referenceId?: string;
          referenceType?: LogReferenceTypes;
        }
      | null
      | undefined = null
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

// VALIDATION ERROR
export class ValidationError extends AppError {
  constructor(
    message: string,
    data:
      | {
          userId?: UUID;
          referenceId?: string;
          referenceType?: LogReferenceTypes;
        }
      | null
      | undefined = null,
    errorCode: LogTypes = LogTypes.BAD_REQUEST
  ) {
    super(message, 400, errorCode, data);
  }
}

// UNAUTHORIZED ERROR
export class UnauthorizedError extends AppError {
  constructor(
    message: string,
    data:
      | {
          userId?: UUID;
          referenceId?: string;
          referenceType?: LogReferenceTypes;
        }
      | null
      | undefined = null,
    errorCode: LogTypes = LogTypes.UNAUTHORIZED
  ) {
    super(message, 401, errorCode, data);
  }
}

// FORBIDDEN ERROR
export class ForbiddenError extends AppError {
  constructor(
    message: string,
    data:
      | {
          userId?: UUID;
          referenceId?: string;
          referenceType?: LogReferenceTypes;
        }
      | null
      | undefined = null,
    errorCode: LogTypes = LogTypes.FORBIDDEN
  ) {
    super(message, 403, errorCode, data);
  }
}

// NOT FOUND ERROR
export class NotFoundError extends AppError {
  constructor(
    message: string,
    data:
      | {
          userId?: UUID;
          referenceId?: string;
          referenceType?: LogReferenceTypes;
        }
      | null
      | undefined = null,
    errorCode: LogTypes = LogTypes.NOT_FOUND
  ) {
    super(message, 404, errorCode, data);
  }
}

// CONFLICT ERROR
export class ConflictError extends AppError {
  constructor(
    message: string,
    data:
      | {
          userId?: UUID;
          referenceId?: string;
          referenceType?: LogReferenceTypes;
        }
      | null
      | undefined = null,
    errorCode: LogTypes = LogTypes.CONFLICT
  ) {
    super(message, 409, errorCode, data);
  }
}