import { User } from "../../models/v2/user";

interface IUserRepository {

    insertUser(user:User): Promise<User>
    insertUserSecurityCode(userId: number, securityCode: string): Promise<any>
}

export default IUserRepository