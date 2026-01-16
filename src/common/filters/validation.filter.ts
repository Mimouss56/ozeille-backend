import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";
import { ZodValidationException } from "nestjs-zod";
import { ZodError } from "zod";

@Catch(ZodValidationException)
export class ZodValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ZodValidationException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const responseStatus = exception.getStatus();

    const serializedErrors: { property: string; message: string }[] = [];

    const errors = exception.getZodError() as ZodError;
    const jsonError: [{ message: string; path: string[] }] = JSON.parse(errors.message);
    for (const error of jsonError) {
      serializedErrors.push({
        property: error.path.join("."),
        message: error.message,
      });
    }

    response.status(responseStatus).json({
      statusCode: responseStatus,
      message: "Validation failed",
      errors: serializedErrors,
    });
  }
}
