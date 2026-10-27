
import { CreateUserInput } from "../../models/v2/user"

interface IUserUseCase {

    createUserAccount(userData: CreateUserInput): Promise<{ message: string }>
    verifyUserAccount(email: string, securityCode: string): Promise<{ message: string }>
    resendVerificationCode(email: string): Promise<{ message: string }>

}

export default IUserUseCase