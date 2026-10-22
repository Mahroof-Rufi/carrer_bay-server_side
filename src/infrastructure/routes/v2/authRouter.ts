import express from 'express';
// import { userController, employerController, adminController } from '../../providers/controllers';
// import upload from '../../middlewares/multer';
import { Request, Response } from 'express-serve-static-core';

const router = express.Router();
// const verificationDocumentHandler = upload.single('verificationDocument');

// User Auth route handlers
// const handleUserSendOTP = (req: Request, res: Response) => userController.sendOTP(req, res);
// const handleUserLogin = (req: Request, res: Response) => userController.logIn(req, res);
// const handleUserRefreshToken = (req: Request, res: Response) => userController.refreshToken(req, res);
// const handleUserRegister = (req: Request, res: Response) => userController.signUp(req, res);
// const handleUserForgotPasswordSendOTP = (req: Request, res: Response) => userController.forgotPasswordSendOTP(req, res);
// const handleUserResetPassword = (req: Request, res: Response) => userController.resetPassword(req, res);
// const handleUserGoogleAuthRegister = (req: Request, res: Response) => userController.googleRegister(req, res);

// // Employer Auth route handlers
// const handleEmployerSendOTP = (req: Request, res: Response) => employerController.sendOTP(req, res);
// const handleEmployerLogin = (req: Request, res: Response) => employerController.logIn(req, res);
// const handleEmployerRefreshToken = (req: Request, res: Response) => employerController.refreshToken(req, res);
// const handleEmployerRegister = (req: Request, res: Response) => employerController.register(req, res);
// const handleEmployerForgotPasswordSendOTP = (req: Request, res: Response) => employerController.forgotPasswordSendOTP(req, res);
// const handleEmployerResetPassword = (req: Request, res: Response) => employerController.resetPassword(req, res);

// // Admin Auth route handlers
// const handleAdminRefreshToken = (req: Request, res: Response) => adminController.refreshToken(req, res);
// const handleAdminLogin = (req: Request, res: Response) => adminController.login(req, res);

// // User Auth Routes
// router.post('/user/send-otp', handleUserSendOTP);
// router.post('/user/login', handleUserLogin);
// router.post('/user/refresh-token', handleUserRefreshToken);
// router.post('/user/register', handleUserRegister);
// router.route('/user/forgot-password')
//     .post(handleUserForgotPasswordSendOTP)
//     .patch(handleUserResetPassword);
// router.route('/user/g-auth/register').post(handleUserGoogleAuthRegister)

// // Employer Auth Routes
// router.post('/employer/send-otp', handleEmployerSendOTP);
// router.post('/employer/login', handleEmployerLogin);
// router.post('/employer/refresh-token', handleEmployerRefreshToken);
// router.post('/employer/register', verificationDocumentHandler, handleEmployerRegister);
// router.route('/employer/forgot-password')
//     .post(handleEmployerForgotPasswordSendOTP)
//     .patch(handleEmployerResetPassword);

// // Admin Auth Routes
// router.post('/admin/refresh-token', handleAdminRefreshToken);
// router.post('/admin/login', handleAdminLogin);

export default router;
