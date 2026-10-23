
import { User } from "../../models/v2/user"

interface IUserUseCase {

    createUserAccount(userData:User): Promise<any>

}

export default IUserUseCase