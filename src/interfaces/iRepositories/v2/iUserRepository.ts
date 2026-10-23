import { User } from "../../models/v2/user";

interface IUserRepository {

    insertUser(user:User): Promise<User>
}

export default IUserRepository