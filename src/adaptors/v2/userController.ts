import { Request, Response } from "express";
import userUseCase from "../../use-case/v2/userUseCase";
import { registerSchema } from "../../infrastructure/validations/userValidation";

class UserControllerV2 {

    constructor(
        private readonly _userUseCase: userUseCase
    ) { }

    async createUserAccount(req: Request, res: Response) {
        try {
            const userData = {
                fullName: req.body.fullName, 
                userName: req.body.userName, 
                email: req.body.email,
                password: req.body.password,
                confirmPassword: req.body.confirmPassword,
                userType: req.body.userType,
            };

            const validatedUserData = registerSchema.safeParse(userData);
            if (!validatedUserData.success) {
                return res.status(400).json({
                    message: validatedUserData.error.issues[0]?.message ?? "Validation failed",
                });
            }
            const user = await this._userUseCase.createUserAccount(validatedUserData.data);
            return res.status(201).json(user.message);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Something went wrong' });
        }
    }

}

export default UserControllerV2