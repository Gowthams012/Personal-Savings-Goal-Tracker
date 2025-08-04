import express from 'express';
const productRouter = express.Router();
import { productAdd } from  '../controller/productController.js';
import userAuth from '../middleware/userAuth.js';

productRouter.post('/create-product', userAuth, productAdd);


export default productRouter;

