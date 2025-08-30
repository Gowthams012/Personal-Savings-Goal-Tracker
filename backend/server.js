import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './db.js';
import authRouter from './server/authRoutes.js';
import userRouter from './server/userRoutes.js';
import productRouter from './server/productRoutes.js';
import userContributionRouter from './server/userContributeRoutes.js';
const app=express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = ['http://localhost:5173'];

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin:allowedOrigins,credentials:true}));

connectDB();



app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);
app.use('/api/product',productRouter);
app.use('/api/contributions', userContributionRouter);

app.listen(PORT,()=>console.log(`Server is running on port ${PORT}`));