import { CreateUserInput } from "../../models/v2/user";

interface IUserRepository {

    insertUser(user: CreateUserInput): Promise<{ id: number }>
    insertUserSecurityCode(userId: number, securityCode: string, expiresAt: Date): Promise<void>
    findUserForVerification(email: string): Promise<{ id: number, isActive: boolean } | null>
    verifyUserAccount(email: string, securityCode: string): Promise<boolean>
}

export default IUserRepository