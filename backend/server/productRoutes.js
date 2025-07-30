import express from 'express';
import {
  parseProduct
} from '../controller/productController.js';
import userAuth from '../middleware/userAuth.js';


const productRouter = express.Router();


productRouter.post('/parse', userAuth, parseProduct);
// productRouter.post('/save', userAuth, saveProductGoal);
// productRouter.get('/my-goals', userAuth, getUserGoals);
// productRouter.put('/update-goal', userAuth, updateGoalProgress);
// productRouter.delete('/delete-goal', userAuth, deleteGoal);

export default productRouter;
