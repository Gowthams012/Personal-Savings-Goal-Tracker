import express from 'express';
const productRouter = express.Router();
import { productAdd,getUserProducts,deleteProduct } from  '../controller/productController.js';
import userAuth from '../middleware/userAuth.js';

productRouter.post('/create-product', userAuth, productAdd);
productRouter.get('/getUserProducts', userAuth, getUserProducts);
productRouter.delete('/deleteProduct', userAuth, deleteProduct);

export default productRouter;

