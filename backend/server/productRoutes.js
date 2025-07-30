import express from 'express';
import {
  getUserProducts,
  parseProduct
} from '../controller/productController.js';
import userAuth from '../middleware/userAuth.js';


const productRouter = express.Router();


productRouter.post('/parse', userAuth, parseProduct);
productRouter.get('/get-user-product', userAuth, getUserProducts);

export default productRouter;
