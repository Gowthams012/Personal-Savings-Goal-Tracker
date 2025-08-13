import express from 'express';
const userContributeRouter = express.Router();
import { addUserContribution,getUserContributions,deleteUserContribution } from  '../controller/userContributeController.js';
import userAuth from '../middleware/userAuth.js';

userContributeRouter.post('/add-contribute/:productId', userAuth, addUserContribution);
userContributeRouter.get('/get-Contribute', userAuth, getUserContributions);
userContributeRouter.delete('/delete-contribute/:id', userAuth, deleteUserContribution);

export default userContributeRouter;

