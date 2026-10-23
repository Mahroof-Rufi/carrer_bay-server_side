import { Education } from "../interfaces/models/subModels/education";
import { Experience } from "../interfaces/models/subModels/experience";
import { User, EditUser } from "../interfaces/models/user";
import userOTPRepository from "../infrastructure/repositories/userOTPRepository";
import userRepository from "../infrastructure/repositories/userRepository";
import GenerateOTP from "../providers/generateOTP";
import Jwt from "../providers/jwt";
import NodeMailer from "../providers/nodeMailer";
import SavedJobsAndPostsRepository from "../infrastructure/repositories/savedJobsAndPostsRepository";
import IUserUseCase from "../interfaces/iUseCases/iUserUseCase";
import { UserOutput } from "../interfaces/models/userOutput";
import EmployerRepository from "../infrastructure/repositories/employerRepository";
import ChatRepository from "../infrastructure/repositories/chatRepository";
import bcrypt from "bcrypt";


class UserUseCase implements IUserUseCase{

    constructor(
        private readonly _userRepository: userRepository,
        private readonly _employerRepository: EmployerRepository,
        private readonly _chatRepository: ChatRepository,
        private readonly _jwt: Jwt,
        private readonly _OTPgenerator: GenerateOTP,
        private readonly _mailer: NodeMailer,
        private readonly _userOTPRepo:userOTPRepository,
    ) { }


    async sendOTP(email:string) {
        const OTP = this._OTPgenerator.generateOTP()   
        const user = await this._userRepository.findByEmail(email) 
        if (!user) {
            const res = await this._mailer.sendMail(email, 'CAREER-BAY \n OTP for email verification', `Your OTP is :${parseInt(OTP)}`);
            this._userOTPRepo.insertOTP(email,parseInt(OTP))
            if (res) {
                return {
                    status: 200,
                    message: 'OTP send successfully'
                }
            } else {
                return {
                    status: 400,
                    message: 'OTP send failed, try again'
                }
            }
        } else {            
            return {
                status: 400,
                message: 'Email already exists'
            }
        }
    }


    async signUp(userData: User) {
        const user = await this._userRepository.findByEmail(userData.email)
        if (!user) {
            const otp = await this._userOTPRepo.getOtpByEmail(userData.email)
            if (otp?.OTP == userData.OTP) {
                await this._userRepository.insertOne(userData)
                return {
                    status: 200,
                    message: 'User registration successful'
                }
            } else {
                return {
                    status: 400,
                    message: 'Invalid OTP'
                }
            }
        } else {
            return {
                status: 400,
                message: 'Email already exists'
            }
        }
    }

    async logIn(email: string, password: string) {
        const userData = await this._userRepository.findByEmail(email);
        
        if (userData) {
            const isPasswordValid = await bcrypt.compare(password, userData.password);
            if (!isPasswordValid) {
                return {
                    status: 400,
                    message: 'Invalid credentials'
                };
            } else if (!userData.isActive) {
                return {
                    status: 400,
                    message: 'This account is blocked by Admin'
                };
            }
            
            const accessToken = this._jwt.createAccessToken(userData._id, 'Normal-User');
            const refreshToken = this._jwt.createRefreshToken(userData._id, 'Normal-User');
            
            return {
                status: 200,
                accessToken: accessToken,
                refreshToken: refreshToken,
                message: 'Login successfully'
            };
        } else {
            return {
                status: 400,
                message: 'User not found'
            };
        }
    }

    async refreshToken(token: string): Promise<UserOutput> {
        const decodedToken = await this._jwt.verifyRefreshToken(token)
        if (decodedToken?.id && decodedToken?.role) {
            const newAccessToken = await this._jwt.createAccessToken(decodedToken?.id,decodedToken?.role)
            const newRefreshToken = await this._jwt.createRefreshToken(decodedToken?.id, decodedToken?.role)
            return {
                status:200,
                message:'Token updated successfully',
                accessToken:newAccessToken,
                refreshToken:newRefreshToken,
            }
        } else {
            return {
                status:401,
                message:'Refresh token expired',
                refreshTokenExpired: true,
            }
        }
    }

    async googleRegister(firstName:string, lastName:string, email: string, password: string, profile_url:string) {
        const user = await this._userRepository.findByEmail(email)
        if (user) {
            const accessToken = this._jwt.createAccessToken(user._id, 'Normal-User')
            const refreshToken = this._jwt.createRefreshToken(user._id, 'Normal-User')
            return {
                status: 200,
                accessToken: accessToken,
                refreshToken: refreshToken,
                message: 'Login successfully'
            }
        } else {
            const res:User = await this._userRepository.insertOne({firstName, lastName, email, password, profile_url})
            if (res) {
                const token = this._jwt.createAccessToken(res._id, 'Normal-User')
                const accessToken = this._jwt.createAccessToken(res._id, 'Normal-User')
                const refreshToken = this._jwt.createRefreshToken(res._id, 'Normal-User')
                return {
                    status: 200,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    message: 'Login successfully'
                }
            }
            return {
                status: 400,
                message: 'Something went wrong'
            }
            
        }
    }

    async forgotPasswordSendOTP(email:string) {
        const user = await this._userRepository.findByEmail(email)       
        if(user) {
            const OTP = this._OTPgenerator.generateOTP()
            const res = await this._mailer.sendMail(email, 'CAREER-BAY \n OTP for email verification', `Your OTP is :${parseInt(OTP)}`);
            await this._userOTPRepo.insertOTP(email, parseInt(OTP))
            if (res) {
                return {
                    status: 200,
                    message: 'OTP send successfully'
                }
            } else {
                return {
                    status: 400,
                    message: 'OTP sending failed, try again'
                }
            }
        } else {
            return {
                status:400,
                message: 'Email not exists'
            }
        }
    }

    async resetPassword(email:string, OTP:number, password:string) {
        const realOTP = await this._userOTPRepo.getOtpByEmail(email)
        if (realOTP?.OTP == OTP) {
            const res = await this._userRepository.updatePassword(email, password)
            if (res) {
                return {
                    status: 200,
                    message: 'Password updated Successfully'
                }
            } else {
                return {
                    status: 400,
                    message: 'Something went wrong'
                }
            }
        } else {
            return {
                status: 400,
                message: 'Invalid OTP'
            }
        }
    }

    async fetchUserDataWithToken(token:string) {
        const decode = this._jwt.verifyToken(token, "User")
        const res = await this._userRepository.findById(decode?.id)
        if (res) {
            return {
                status: 200,
                message: 'Operation success',
                userData: res,
            }
        } else {
            return {
                status: 401,
                message: 'Something went wrong',
            }
        }
    }

    async fetchUseProfileWithUserId(user_id:string) {
        const res = await this._userRepository.findById(user_id)
        if (res) {
            return {
                status: 200,
                message: 'Operation success',
                userData: res,
            }
        } else {
            return {
                status: 400,
                message: 'Something went wrong',
            }
        }
    }

    async fetchUsersData(token:string, pageNo:string, sort:string, search:string,filter:any) {
        const decodedToken = this._jwt.verifyToken(token,"User")
        const limit = 12
        const skip = (parseInt(pageNo) - 1) * limit;
        const res = await this._userRepository.fetchAllUsers(skip, limit, decodedToken?.id, sort, filter, search)
        const totalNoOfUsers = await this._userRepository.fetchUsersCount(decodedToken?.id, filter)
        return {
            status: 200,
            message: 'Users found successfully',
            users:res,
            totalNoOfUsers: totalNoOfUsers
        }
    }

    async fetchEmployersData(pageNo:string, sort:string, search:string, filter:any): Promise<UserOutput> {
        const limit = 10
        const skip = (parseInt(pageNo) - 1) * limit;
        const res = await this._employerRepository.fetchAllEmployers(skip, limit,'', sort, search, filter)
        
        const totalEmployersCount = await this._employerRepository.FetchEmployersCount(filter)
        return {
            status:200,
            message:'Employers found successfully',
            employers:res,
            totalEmployersCount:totalEmployersCount
        }
    }

    async fetchEmployerProfileById(employer_id:string) {
        const res = await this._employerRepository.findById(employer_id)
        if (res) {
            return {
                status:200,
                employerData:res,
                message:'Operation success'
            }
        } else {
            return {
                status:400,
                message:'Employer not found'
            }
        }
    }

    async getScheduledInterviews(token: string): Promise<UserOutput> {
        const decodedToken = this._jwt.verifyToken(token,"User")
        const scheduleInterviews = await this._chatRepository.findScheduledInterviews(decodedToken?.id)
        if (scheduleInterviews) {
            return {
                status: 200,
                message: 'Scheduled Interviews found successfully',
                scheduledInterviews: scheduleInterviews
            }
        } else {
            return {
                status: 400,
                message: 'Scheduled Interviews not found'
            }
        }
    }

    async isUserBlockedOrNot(token:string) {
        const decodedToken = this._jwt.verifyToken(token,"User")
        const res = await this._userRepository.findById(decodedToken?.id)
        if (res?.isActive) {
            return {
                status:200,
                message:'User is not blocked'
            }
        }
        return {
            status:403,
            message:'User account block by admin'
        }
    }

    async loadUsers(pageNo:string) {
        const limit = 10
        const skip = (parseInt(pageNo) - 1) * limit;
        const users = await this._userRepository.fetchAllUsers(skip,limit)
        return {
            status:200,
            message:'Users found successfully',
            users:users
        }
    }

    async updateUserProfile(newData:EditUser, token:string) {

        const decodedToken = this._jwt.verifyToken(token,"User")

        const allowedUpdates = [
            'firstName', 'lastName', 'profile_url', 'jobTitle', 'industry', 'DOB', 'gender', 'city', 'state',
            'remort', 'resume_url', 'portfolio_url', 'gitHub_url', 'about', 'experiences', 'educations', 'skills'
        ];
        
        const updateValidator = Object.keys(newData).every((update) => allowedUpdates.includes(update));

        if (!updateValidator) {
            return {
                status:405,
                message:'disallowed fields found'
            }
        }

        const userData:User | null = await this._userRepository.findById(decodedToken?.id)

        if (!userData) {
            return {
                status:404,
                message:'User not found'
            }
        }

        const res = await this._userRepository.findByIdAndUpdate(decodedToken?.id, newData)
        if (res) {
            return {
                status:201,
                userData:res,
                message:'User profile update successfully'
            }
        } else {
            return {
                status:404,
                message:'User not found'
            }
        }
    }

    async updateUserAbout(token:string, about:string) {
        const decodedToken = this._jwt.verifyToken(token,"User");

        const userData:User | null = await this._userRepository.findById(decodedToken?.id)

        if (!userData) {
            return {
                status:404,
                message:'User not found'
            }
        }

        const res = await this._userRepository.updateUserAbout(decodedToken?.id, about)
        if (res) {
            return {
                status:201,
                userData:res,
                message:'User about update successfully'
            }
        } else {
            return {
                status:404,
                message:'User not found'
            }
        }

    }

    async updateUserExperience(token:string, experience:Experience, exp_id?:string,) {
        const decodedToken = this._jwt.verifyToken(token,"User")
        if (exp_id) {
            
            const res = await this._userRepository.updateUserExperience(decodedToken?.id, exp_id, experience)
            if (res) {
                return {
                    status:201,
                    userData:res,
                    message:'User experience updated successfully'
                }
            } else {
                return {
                    status:404,
                    message:'User not found'
                }
            }
        } else {
            const res = await this._userRepository.addUserExperience(decodedToken?.id, experience)
            if (res) {
                return {
                    status:201,
                    userData:res,
                    message:'User experience updated successfully'
                }
            } else {
                return {
                    status:404,
                    message:'User not found'
                }
            }
        }
    }

    async deleteUserExperience(token:string, exp_id:string) {
        const decode = this._jwt.verifyToken(token,"User")
        const updatedUserExperience = await this._userRepository.deleteUserExperience(decode?.id, exp_id)
        if (!updatedUserExperience) {
            return {
                status:400,
                message:'User not found',
            }
        }
        return {
            status:200,
            message:'User experience delete successful',
            userData:updatedUserExperience
        }
    }

    async updateUserEducation(token:string, education:Education, education_id?:string,) {
        const decodedToken = this._jwt.verifyToken(token,"User");
        if (education_id) {
            const res = await this._userRepository.updateUserEducation(decodedToken?.id, education, education_id);
            if (res) {
                return {
                    status:201,
                    userData:res,
                    message:'User education updated successfully'
                }
            } else {
                return {
                    status:404,
                    message:'User not found'
                }
            }
        } else {
            const res = await this._userRepository.addUserEducation(decodedToken?.id, education)
            if (res) {
                return {
                    status:201,
                    userData:res,
                    message:'User education updated successfully'
                }
            } else {
                return {
                    status:404,
                    message:'User not found'
                }
            }
        }
    }

    async deleteUserEducation(token:string, edu_id:string) {
        const decode = this._jwt.verifyToken(token,"User")
        const updatedUserEducation = await this._userRepository.deleteUserEducation(decode?.id, edu_id)
        if (!updatedUserEducation) {
            return {
                status:400,
                message:'User not found',
            }
        }
        return {
            status:200,
            message:'User education delete successful',
            userData:updatedUserEducation
        }
    }

    async updateUserSkills(token:string, skills:string[]) {
        const decodedToken = this._jwt.verifyToken(token,"User")
        const res = await this._userRepository.updateUserSkills(decodedToken?.id, skills)
        if (res) {
            return {
                status:201,
                userData:res,
                message:'User skills updated successfully'
            }
        } else {
            return {
                status:404,
                message:'User not found'
            }
        }
    }

    async sendOTPToCurrentEmail(currentEmail:string) {
        const user = await this._userRepository.findByEmail(currentEmail)
        if (!user) {
            return {
                status:400,
                message:'Email not exists'
            }
        }
        const OTP = this._OTPgenerator.generateOTP()
        const res = await this._mailer.sendMail(currentEmail, 'CAREER-BAY \n OTP for email verification', `Your OTP is :${parseInt(OTP)}`);
        this._userOTPRepo.insertOTP(currentEmail,parseInt(OTP))
        if (res) {
            return {
                status: 200,
                message: 'OTP successfully send to current registered main'
            }
        } else {
            return {
                status: 400,
                message: 'OTP send failed, try again'
            }
        }
    }

    async updateCurrentEmail(currentEmail:string ,currentMailOTP:string, newEmail:string, newMailOTP:string) {
        const currentMail = await this._userOTPRepo.getOtpByEmail(currentEmail)
        const newMail = await this._userOTPRepo.getOtpByEmail(newEmail)
        
        if (!currentMail || !newMail) {
            return {
                status:400,
                message:'OTP not found, try again'
            }
        }
        if (currentMail.OTP != parseInt(currentMailOTP)) {
            return {
                status:400,
                message:'Current email OTP mismatch'
            }
        } else {
            if (newMail.OTP != parseInt(newMailOTP)) {
                return {
                    status:400,
                    message:'New mail OTP mismatch'
                }
            }
            const newData = await this._userRepository.changeEmailByEmail(currentEmail,newEmail)
            if (!newData) {
                return {
                    status:400,
                    message:'User not found'
                }
            }
            return {
                status:200,
                message:'Email updated successfully'
            }
        }
    }

}

export default UserUseCase