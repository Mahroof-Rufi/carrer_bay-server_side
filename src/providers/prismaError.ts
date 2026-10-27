import { Prisma } from "@prisma/client";
import { ApiError } from "./apiError";

export function toApiError(error: unknown): unknown {
    if (error instanceof ApiError) {
        return error;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const target = error.meta?.target;
        const constraint = Array.isArray(target) ? target.join(",") : String(target ?? "");

        if (constraint.includes("email")) {
            return new ApiError(409, "Email already exists", "EMAIL_ALREADY_EXISTS");
        }
        if (constraint.includes("user_name")) {
            return new ApiError(409, "Username already exists", "USERNAME_ALREADY_EXISTS");
        }
        return new ApiError(409, "A record with this value already exists", "DUPLICATE_RECORD");
    }

    return error;
}
