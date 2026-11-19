import { Response } from "express";

export class ApiResponse {
  statusCode: number;
  data: any;
  message: string;
  success: boolean;

  constructor(statusCode: number, data: any, message: string = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  // Keep static methods for compatibility if any other modules use them
  static send<T>({
    res,
    statusCode,
    success,
    message,
    data,
  }: {
    res: Response;
    statusCode: number;
    success: boolean;
    message: string;
    data?: T;
  }): void {
    res.status(statusCode).json({
      success,
      message,
      data,
    });
  }

  static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200
  ): void {
    ApiResponse.send({ res, statusCode, success: true, message, data });
  }

  static created<T>(res: Response, message: string, data?: T): void {
    ApiResponse.send({
      res,
      statusCode: 201,
      success: true,
      message,
      data,
    });
  }
}

export default ApiResponse;
