import { CookieOptions, Response } from "express";

interface CookiePayload {
    name: string;
    val: string;
    options: CookieOptions;
}

export class ApiResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: any;
    #cookies: CookiePayload[] = [];

    constructor(statusCode: number, message: string, data: any = null) {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        if (data !== null) {
            this.data = data;
        }
    }

    setCookie(name: string, val: string, options: CookieOptions = {}): this {
        const defaultOptions: CookieOptions = {
            httpOnly: true, // Prevents XSS attacks (client-side JS cannot access it)
            secure: process.env.SECURE_COOKIE === "true", // Send over HTTPS only in production
            sameSite: "strict", // Mitigates CSRF attacks ("lax" or "strict")
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            ...options,
        };
        this.#cookies.push({ name, val, options: defaultOptions });
        return this; // Return 'this' to allow method chaining
    }

    send(res: Response) {
        for (const cookie of this.#cookies) {
            res.cookie(cookie.name, cookie.val, cookie.options);
        }
        return res.status(this.statusCode).json(this);
    }
}