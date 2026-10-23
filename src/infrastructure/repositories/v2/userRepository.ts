import bcrypt from "bcrypt";

import IUserRepository from "../../../interfaces/iRepositories/v2/iUserRepository";
import { User } from "../../../interfaces/models/v2/user";
import { prisma } from "../../config/prisma";

class UserRepositoryV2 implements IUserRepository {

    async insertUser(user:User): Promise<any> {
        try {
            if (typeof user.password !== "string" || user.password.length === 0) {
                console.log(user)
                throw new Error("Password is required");
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
            });
            return newUser;
        } catch (error) {
            console.log(error);            
            throw error
        }
    }

}

export default UserRepositoryV2