import { CreateUserInput, UserForVerification } from "../../models/v2/user";

interface IUserRepository {

    insertUser(user: CreateUserInput): Promise<{ id: number }>
    insertUserSecurityCode(userId: number, securityCode: string, expiresAt: Date): Promise<void>
    findUserForVerification(email: string): Promise<UserForVerification | null>
    activateUserAccount(email: string): Promise<boolean>
}

export default IUserRepository