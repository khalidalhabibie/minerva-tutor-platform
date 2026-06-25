import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from "@nestjs/common";
import { Response } from "express";

type ErrorResponse = {
  statusCode: number;
  message: string | string[];
  error?: string;
};

@Catch()
export class SafeExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload =
      exception instanceof HttpException
        ? this.formatHttpException(exception, status)
        : {
            statusCode: status,
            message: "Internal server error",
            error: "Internal Server Error"
          };

    if (!(exception instanceof HttpException)) {
      console.error(exception);
    }

    response.status(status).json(payload);
  }

  private formatHttpException(
    exception: HttpException,
    status: number
  ): ErrorResponse {
    const response = exception.getResponse();

    if (typeof response === "string") {
      return {
        statusCode: status,
        message: response,
        error: exception.name
      };
    }

    if (this.isErrorResponse(response)) {
      return {
        statusCode: response.statusCode ?? status,
        message: response.message ?? exception.message,
        error: response.error
      };
    }

    return {
      statusCode: status,
      message: exception.message,
      error: exception.name
    };
  }

  private isErrorResponse(value: unknown): value is Partial<ErrorResponse> {
    return typeof value === "object" && value !== null;
  }
}
