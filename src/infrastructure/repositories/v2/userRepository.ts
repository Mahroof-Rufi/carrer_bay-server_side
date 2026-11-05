import bcrypt from "bcrypt";

import IUserRepository from "../../../interfaces/iRepositories/v2/iUserRepository";
import { CreateUserInput, UserForVerification } from "../../../interfaces/models/v2/user";
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

    async findUserForVerification(email: string): Promise<UserForVerification | null> {
        try {
            const user = await prisma.users.findUnique({
                where: { email },
                select: {
                    id: true,
                    full_name: true,
                    user_name: true,
                    email: true,
                    user_type: true,
                    security_code: true,
                    is_active: true,
                },
            });

            if (!user) return null;

            return {
                id: user.id,
                fullName: user.full_name,
                userName: user.user_name,
                email: user.email,
                userType: user.user_type,
                isActive: user.is_active,
                security_code: user.security_code,
            };
        } catch (error) {
            throw toApiError(error);
        }
    }

    async activateUserAccount(email: string): Promise<boolean> {
        try {
            const result = await prisma.users.update({
                where: {
                    email,
                    is_active: false,
                },
                data: {
                    is_active: true,
                    security_code: null,
                    security_code_expires_at: null,
                },
            });
            return result ? true : false;
        } catch (error) {
            throw toApiError(error);
        }
    }

}

export default UserRepositoryV2;