import express from 'express';
import { deleteUserAccount, getUserData, updateUserData } from '../controller/userController.js';
import userAuth from '../middleware/userAuth.js';

const userRouter = express.Router();;

userRouter.get('/data',userAuth,getUserData);
userRouter.post('/update-data',userAuth,updateUserData);
userRouter.delete('/delete-account',userAuth,deleteUserAccount);

export default userRouter;