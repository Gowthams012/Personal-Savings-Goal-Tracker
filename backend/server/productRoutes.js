import express from 'express';
const productRouter = express.Router();
import { productAdd,getUserProducts,deleteProduct } from  '../controller/productController.js';
import userAuth from '../middleware/userAuth.js';


// RESTful: use kebab-case for endpoints
productRouter.post('/create-product', userAuth, productAdd);
productRouter.get('/get-user-products', userAuth, getUserProducts);
productRouter.delete('/deleteProduct', userAuth, deleteProduct);

export default productRouter;

