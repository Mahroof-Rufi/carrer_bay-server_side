// import { Education } from "../interfaces/models/subModels/education";
// import { Experience } from "../interfaces/models/subModels/experience";
// import { User, EditUser } from "../interfaces/models/user";
// import userOTPRepository from "../infrastructure/repositories/userOTPRepository";
// import userRepository from "../infrastructure/repositories/userRepository";
// import GenerateOTP from "../providers/generateOTP";
// import Jwt from "../providers/jwt";
// import NodeMailer from "../providers/nodeMailer";
// import SavedJobsAndPostsRepository from "../infrastructure/repositories/savedJobsAndPostsRepository";
import userRepository from "../../infrastructure/repositories/v2/userRepository";
import IUserUseCase from "../../interfaces/iUseCases/v2/iUserUseCase";
// import { UserOutput } from "../interfaces/models/userOutput";
// import EmployerRepository from "../infrastructure/repositories/employerRepository";
// import ChatRepository from "../infrastructure/repositories/chatRepository";
import bcrypt from "bcrypt";
import { User } from "../../interfaces/models/v2/user";


class UserUseCaseV2 implements IUserUseCase{

    constructor(
        private readonly _userRepository: userRepository,
    ) { }


    async createUserAccount(userData: any) {
        await this._userRepository.insertUser(userData)
        return {
            status: 200,
            message: 'User registration successful'
        }
    }

}

export default UserUseCaseV2