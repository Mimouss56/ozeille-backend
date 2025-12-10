import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Prisma } from "src/generated/prisma/client";
import { Response } from "express";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    //erreur 500
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    switch (exception.code) {
      case 'P2002': // Containtes Unique
        status = HttpStatus.CONFLICT;
        const target = exception.meta?.target;
        message = target 
          ? `Unique constraint violation on field: ${target}` 
          : 'Unique constraint violation';
        break;

      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Not found';
        break;
      
      default:
        message = `${exception.message}`;
        break;
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      error: Prisma.PrismaClientKnownRequestError.name,
    });
  }
}