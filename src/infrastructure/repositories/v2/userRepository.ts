import bcrypt from "bcrypt";

import IUserRepository from "../../../interfaces/iRepositories/v2/iUserRepository";
import { CreateUserInput } from "../../../interfaces/models/v2/user";
import { ApiError } from "../../../providers/apiError";
import { toApiError } from "../../../providers/prismaError";
import { prisma } from "../../config/prisma";

class UserRepositoryV2 implements IUserRepository {

    async insertUser(user: CreateUserInput): Promise<{ id: number }> {
        try {
            if (typeof user.password !== "string" || user.password.length === 0) {
                throw new ApiError(400, "Password is required", "VALIDATION_ERROR");
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
            const newUser = await prisma.users.create({
                data: {
                    full_name: user.fullName,
                    user_name: user.userName,
                    email: user.email,
                    password: user.password,
                    user_type: user.userType,
                },
                select: {
                    id: true,
                },
            });
            return newUser;
        } catch (error) {
            throw toApiError(error);
        }
    }

    async insertUserSecurityCode(userId: number, securityCode: string, expiresAt: Date): Promise<void> {
        try {
            await prisma.users.update({
                where: { id: userId },
                data: {
                    security_code: securityCode,
                    security_code_expires_at: expiresAt,
                },
            });
        } catch (error) {
            throw toApiError(error);
        }
    }

    async findUserForVerification(email: string): Promise<{ id: number, isActive: boolean } | null> {
        try {
            return await prisma.users.findUnique({
                where: { email },
                select: { id: true, isActive: true },
            });
        } catch (error) {
            throw toApiError(error);
        }
    }

    async verifyUserAccount(email: string, securityCode: string): Promise<boolean> {
        try {
            const result = await prisma.users.updateMany({
                where: {
                    email,
                    security_code: securityCode,
                    security_code_expires_at: { gt: new Date() },
                    isActive: false,
                },
                data: {
                    isActive: true,
                    security_code: null,
                    security_code_expires_at: null,
                },
            });
            return result.count === 1;
        } catch (error) {
            throw toApiError(error);
        }
    }

}

export default UserRepositoryV2