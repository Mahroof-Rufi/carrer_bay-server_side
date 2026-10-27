import { Response } from "express";

export class ApiResponse {

    success: boolean;
    statusCode: number;
    message: string;
    data: any;

    constructor(statusCode: number, message: string, data: any = null) {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        if (data !== null) {
        this.data = data;
        }
    }

    send(res: Response) {
        return res.status(this.statusCode).json(this);
    }
}