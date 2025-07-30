import express from 'express';
import { isAuthenticated, login, logout, register, resetpassword, restotp, sendverifyotp, verifyemail } from '../controller/authController.js';
import userAuth from '../middleware/userAuth.js';



const authRouter=express.Router();

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/send-otp',userAuth,sendverifyotp);
authRouter.post('/verify-user',userAuth,verifyemail);
authRouter.post('/is-Authenticated',userAuth,isAuthenticated);
authRouter.post('/reset-password-otp',userAuth,restotp);
authRouter.post('/reset-password',userAuth,resetpassword);

export default authRouter;