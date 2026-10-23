import employer from "../interfaces/models/employer";
import employerRepository from "../infrastructure/repositories/employerRepository";
import employerOTPRepository from "../infrastructure/repositories/employerOTPRepository";
import GenerateOTP from "../providers/generateOTP";
import NodeMailer from "../providers/nodeMailer";
import Jwt from "../providers/jwt";
import IEmployerUseCase from "../interfaces/iUseCases/iEmployerUseCase";
import { EmployerOutput } from "../interfaces/models/employerOutput";
import bcrypt from "bcrypt";

class EmployerUseCase implements IEmployerUseCase{

    constructor(
        private readonly _employerRepository:employerRepository,
        private readonly _employerOTPRepository:employerOTPRepository,
        private readonly _OTPGenerator:GenerateOTP,
        private readonly _mailer:NodeMailer,
        private readonly _jwt:Jwt,
    ) {}

    async sendOTP(email:string) {
        const OTP = this._OTPGenerator.generateOTP()
        const employer = await this._employerRepository.findByEmail(email)
        if (!employer) {
            const res = await this._mailer.sendMail(email, 'CAREER-BAY \n OTP for email verification', `Your OTP is :${parseInt(OTP)}`)
            this._employerOTPRepository.insertOTP(email,parseInt(OTP))
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

    async register(employerData:employer) {
        const employer = await this._employerRepository.findByEmail(employerData.email)
        if(!employer) {
            const otp = await this._employerOTPRepository.getOtpByEmail(employerData.email)
            if (otp?.OTP == employerData.OTP) {
                await this._employerRepository.insertOne(employerData)
                return {
                    status: 200,
                    message: 'Registration successful'
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

    async login(email:string, employerPassword:string): Promise<EmployerOutput> {
        const employerData = await this._employerRepository.findByEmail(email);

        if (employerData) {
            const isPasswordValid = await bcrypt.compare(employerPassword, employerData.password);

            if (!isPasswordValid) {
                return {
                    status: 400,
                    message: 'Invalid credentials'
                };
            } else if (!employerData.isVerified) {
                return {
                    status: 400,
                    message: 'Your account is not yet verified by Admin'
                };
            } else if (!employerData.isActive) {
                return {
                    status: 400,
                    message: 'Your account is blocked by Admin'
                };
            }

            const accessToken = this._jwt.createAccessToken(employerData._id, 'Normal-employer');
            const refreshToken = this._jwt.createRefreshToken(employerData._id, 'Normal-employer');

            return {
                status: 200,
                accessToken: accessToken,
                refreshToken: refreshToken,
                employerData: employerData,
                message: 'Login successfully'
            };
        } else {
            return {
                status: 400,
                message: 'Data not found'
            };
        }
    }

    async refreshToken(refreshToken: string): Promise<EmployerOutput> {
        const decodedToken = await this._jwt.verifyRefreshToken(refreshToken)
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

    async fetchEmployerData(token:string) {
        const decode = this._jwt.verifyToken(token,"Employer")
        const res = await this._employerRepository.findById(decode?.id)
        if (res) {
            return {
                status:200,
                employerData:res,
                message:'Operation success'
            }
        } else {
            return {
                status:401,
                message:'Employer not found'
            }
        }
    }

    async forgotPasswordSendOTP(email:string) {
        const company = await this._employerRepository.findByEmail(email)       
        
        if(company) {
            const OTP = this._OTPGenerator.generateOTP()
            const res = await this._mailer.sendMail(email, 'CAREER-BAY \n OTP for email verification', `Your OTP is :${parseInt(OTP)}`)
            this._employerOTPRepository.insertOTP(email, parseInt(OTP))
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
        const realOTP = await this._employerOTPRepository.getOtpByEmail(email)
        if (realOTP?.OTP == OTP) {
            const res = await this._employerRepository.updatePassword(email, password)
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

    async loadCompanies() {
        const limit = 12
        const employers = await this._employerRepository.fetchAllEmployers(limit,0)
        if (!employers) {
            return {
                status:400,
                message:'Employers not found'
            }
        }
        return {
            status:200,
            message:'Employers found successfully',
            employers:employers
        }
    }

    async updateProfile(newData:employer) {
        const data = await this._employerRepository.updateProfile(newData.email, newData)
        if (data) {
            const updatedData = await this._employerRepository.findByEmail(data.email)
            return {
                status: 200,
                oldProfileUrl: data.profile_url,
                employerData:updatedData,
                message: 'Profile updated successfully'
            }
        } else {
            return {
                status: 400,
                message: 'Something went wrong'
            }
        }
    }


    async updateEmailWithOTP(email:string, OTP:number, newMail:string) {
        const otp = await this._employerOTPRepository.getOtpByEmail(email)
        if (otp?.OTP == OTP) {
            const updatedData = await this._employerRepository.updateEmail(email,newMail)
            return {
                status: 200,
                message: 'Email updated Successfully',
                EmployerData: updatedData
            }
        } else {
            return {
                status: 400,
                message: 'Invalid OTP',
            }
        }
    }
    
}

export default EmployerUseCase