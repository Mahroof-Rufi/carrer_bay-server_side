import { education } from './../domain/user';
import { Request, Response, json } from "express";
import userUseCase from "../use-case/userUseCase";
import { EditUser } from "../domain/user";
import cloudinary from "../infrastructure/utils/cloudinary";

class userController {

    constructor(private userUseCase: userUseCase) { }

    async signUp(req: Request, res: Response) {
        try {
            const userData = req.body
            console.log(userData);
            
            const user = await this.userUseCase.signUp(userData)
            res.status(user.status).json(user.data)
        } catch (error) {
            console.error(error);

        }
    }

    async sendOTP(req:Request, res:Response) {
        try {
            const email = req.body.email
            const response = await this.userUseCase.sendOTP(email)
            res.status(response.status).json(response.data)                    
        } catch (error) {
            console.error(error); 
        }
    }

    async logIn(req: Request, res: Response) {
        
        try {
            const { email, password } = req.body
            const user = await this.userUseCase.logIn(email,password)
            if (user && user.token) {
                return res
                    .status(200)
                    .json({
                        user,
                });
            } else {
                return res
                    .status(400)
                    .json({
                        user,
                });
            }
        } catch (error) {
            console.error();
        }
    }

    async gAuth(req:Request, res:Response) {
        try {
            const { fullName, email, password, google_id } = req.body
            const user = await this.userUseCase.gAuth(fullName,email,password,google_id)
            if (user && user.token) {
                return res
                    .status(200)
                    .json({
                        user,
                });
            } else {
                return res
                    .status(400)
                    .json({
                        user,
                });
            }
        } catch (error) {
            console.error(error);
        }
    }

    async forgotPasswordSendOTP(req:Request, res:Response) {
        try {
            const email = req.body.email
            const user = await this.userUseCase.forgotpasswordSendOTP(email)
            res.status(user.status).json(user.message)
        } catch (error) {
            console.error(error);
        }
    }

    async resetPassword(req:Request, res:Response) {
        try {
            const { email, OTP, password } = req.body
            const data = await this.userUseCase.resetPassword(email, OTP, password)
            res.status(data.status).json(data.message)
        } catch (error) {
            console.error(error);            
        }
    }

    async fetchUserdata(req:Request, res:Response) {
        try {
            const token = req.header('User-Token');
            if (token) {
                const result = await this.userUseCase.fetchUserDataWithToken(token)
                res.status(result.status).json({message:result?.message, userData:result?.userData})
            }
        } catch (error) {
            console.error(error);            
        }
    }

    async fetchJobs(req:Request, res:Response) {
        try {
            const data = await this.userUseCase.fetchJobs()
            res.status(data.status).json({data:data.jobs})
        } catch (error) {
            console.error(error);            
        }
    }

    async updateUserProfile(req:Request, res:Response) {
        try {
            const newData:EditUser = req.body as Partial<EditUser>
            if (typeof newData.DOB == "string") {
                newData.DOB = this.convertTuiDayToDate(newData.DOB)
            }

            if (req.files) {
                const profile_pic = (req.files as { [fieldname: string]: Express.Multer.File[] })['profile-file']?.[0]
                const resume = (req.files as { [fieldname: string]: Express.Multer.File[] })['resume-file']?.[0]

                if (profile_pic) {
                    console.log('before profile upload')
                    const profileUpload = await cloudinary.uploader.upload(profile_pic.path);
                    newData.profile_url = profileUpload.secure_url;
                    console.log('after profile upload')
                }

                if (resume) {
                    console.log('before resume upload')
                    const resumeUpload = await cloudinary.uploader.upload(resume.path);
                    newData.resume_url = resumeUpload.secure_url;
                    console.log('after resume upload')
                }

            } 

            const userID:string = req.params.user_id

            const result = await this.userUseCase.updateUserProfile(newData, userID)
            res.status(result.status).json({ updatedData:result.updatedData, message:result.message })
        } catch (error) {
            console.error(error);            
        }
    }

    convertTuiDayToDate(dateString:string):Date {
        const [day, month, year] = dateString.split('.').map(Number);
        return new Date(year, month - 1, day);
    }

    async updateUserExperience(req:Request, res:Response) {
        try {
            const user_id = req.params.user_id
            const exp_id = req.body.exp_id
            const experience = req.body.exp
            const result = await this.userUseCase.updateUserExperience(user_id, experience, exp_id)
            res.status(result.status).json({ updatdData:result.updatedData, message: result.message })           
        } catch (error) {
            console.error(error);            
        }
    }

    async updateUserEducation(req:Request, res:Response) {
        try {
            const user_id = req.params.user_id
            const edcn_id = req.body.edcn_id
            const education = req.body.edctn
            console.log(education);
            
            
            const result = await this.userUseCase.updateUserEducation(user_id, education, edcn_id)
            res.status(result.status).json({ updatdData:result.updatedData, message: result.message })           
        } catch (error) {
            console.error(error);            
        }
    }

    async updateUserSkills(req:Request, res:Response) {
        try {
            const user_id = req.params.user_id
            const skills = req.body.skills
            console.log(skills);
            
            
            const result = await this.userUseCase.updateUserSkills(user_id, skills)
            res.status(result.status).json({ updatdData:result.updatedData, message: result.message })           
        } catch (error) {
            console.error(error);            
        }
    }

}

export default userController