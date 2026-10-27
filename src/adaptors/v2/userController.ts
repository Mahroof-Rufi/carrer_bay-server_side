import { NextFunction, Request, Response } from "express";
import userUseCase from "../../use-case/v2/userUseCase";
import {
    registerSchema,
    resendVerificationCodeSchema,
    verifyUserSchema,
} from "../../infrastructure/validations/userValidation";
import { ApiError } from "../../providers/apiError";
import { ApiResponse } from "../../providers/apiResponse";

class UserControllerV2 {

    constructor(
        private readonly _userUseCase: userUseCase
    ) { }

    async createUserAccount(req: Request, res: Response, next: NextFunction) {
        try {
            const userData = {
                fullName: req.body.fullName, 
                userName: req.body.userName, 
                email: req.body.email,
                password: req.body.password,
                confirmPassword: req.body.confirmPassword,
                userType: req.body.userType,
            };

            const validatedUserData = registerSchema.safeParse(userData);
            if (!validatedUserData.success) {
                throw new ApiError(
                    400,
                    validatedUserData.error.issues[0]?.message ?? "Validation failed",
                    "VALIDATION_ERROR",
                    validatedUserData.error.issues
                );
            }
            const user = await this._userUseCase.createUserAccount(validatedUserData.data);
            return new ApiResponse(201, user.message).send(res);
        } catch (error) {
            next(error);
        }
    }

    async verifyUserAccount(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = verifyUserSchema.safeParse(req.body);
            if (!validatedData.success) {
                throw new ApiError(
                    400,
                    validatedData.error.issues[0]?.message ?? "Validation failed",
                    "VALIDATION_ERROR",
                    validatedData.error.issues
                );
            }

            const result = await this._userUseCase.verifyUserAccount(
                validatedData.data.email,
                validatedData.data.securityCode
            );
            return new ApiResponse(200, result.message).send(res);
        } catch (error) {
            next(error);
        }
    }

    async resendVerificationCode(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = resendVerificationCodeSchema.safeParse(req.body);
            if (!validatedData.success) {
                throw new ApiError(
                    400,
                    validatedData.error.issues[0]?.message ?? "Validation failed",
                    "VALIDATION_ERROR",
                    validatedData.error.issues
                );
            }

            const result = await this._userUseCase.resendVerificationCode(validatedData.data.email);
            return new ApiResponse(200, result.message).send(res);
        } catch (error) {
            next(error);
        }
    }

}

export default UserControllerV2