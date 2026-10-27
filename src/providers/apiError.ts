export class ApiError extends Error {
    success: boolean;
    statusCode: number;
    errorCode: string;
    errors: any[];

    constructor(statusCode: number, message: string, errorCode = "INTERNAL_ERROR", errors: any[] = []) {
        super(message);
        this.success = false;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.errors = errors;
        
        Error.captureStackTrace(this, this.constructor);
    }
}
  