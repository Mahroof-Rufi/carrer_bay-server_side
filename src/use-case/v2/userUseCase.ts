import userRepository from "../../infrastructure/repositories/v2/userRepository";
import { CreateUserInput } from "../../interfaces/models/v2/user";
import { ApiError } from "../../providers/apiError";
import { generateThreePartCode } from "../../providers/generateCode";
import NodeMailer from "../../providers/nodeMailer";
import IUserUseCase from "../../interfaces/iUseCases/v2/iUserUseCase";

const SECURITY_CODE_EXPIRY_MINUTES = 10;

class UserUseCaseV2 implements IUserUseCase {
    constructor(
        private readonly _userRepository: userRepository,
        private readonly _mailer: NodeMailer,
    ) { }

    async createUserAccount(userData: CreateUserInput): Promise<{ message: string }> {
        const user = await this._userRepository.insertUser(userData);
        await this.sendVerificationCode(user.id, userData.email);

        return { message: "User created. Check your email for the verification code." };
    }

    async verifyUserAccount(email: string, securityCode: string): Promise<{ message: string }> {
        const verified = await this._userRepository.verifyUserAccount(email, securityCode);
        if (!verified) {
            throw new ApiError(400, "Invalid or expired verification code", "INVALID_VERIFICATION_CODE");
        }

        return { message: "Email verified successfully" };
    }

    async resendVerificationCode(email: string): Promise<{ message: string }> {
        const user = await this._userRepository.findUserForVerification(email);
        if (!user || user.isActive) {
            return { message: "If the account needs verification, a new code will be sent." };
        }

        await this.sendVerificationCode(user.id, email);
        return { message: "Verification code sent successfully" };
    }

    private async sendVerificationCode(userId: number, email: string): Promise<void> {
        const securityCode = generateThreePartCode();
        const expiresAt = new Date(Date.now() + SECURITY_CODE_EXPIRY_MINUTES * 60 * 1000);

        await this._userRepository.insertUserSecurityCode(userId, securityCode, expiresAt);
        const sent = await this._mailer.sendMail(
            email,
            "CAREER-BAY email verification",
            `Your email verification code is ${securityCode}. It expires in ${SECURITY_CODE_EXPIRY_MINUTES} minutes.`,
        );
        if (!sent) {
            throw new ApiError(
                502,
                "The account was created, but the verification email could not be sent. Request a new code to try again.",
                "EMAIL_DELIVERY_FAILED",
            );
        }
    }
}

export default UserUseCaseV2;
