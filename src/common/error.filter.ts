import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { ZodError } from 'zod';
@Catch(ZodError, HttpException, UnauthorizedException)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
    } else if (exception instanceof UnauthorizedException) {
      response.status(exception.getStatus()).json(exception.getResponse());
    } else if (exception instanceof ZodError) {
      const combinedErrors = exception.errors.map(
        (error) => `${error.path.join('.')} - ${error.message}`,
      );
      response.status(400).json({
        message: combinedErrors,
        errors: 'Bad Request',
        statusCode: 400,
      });
    } else {
      response.status(500).json({
        message: exception.message,
        errors: 'Internal Server Error',
        statusCode: 500,
      });
    }
  }
}
