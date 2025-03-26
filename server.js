import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import signupRouter from './router/signupRoute.js';
import loginRouter from './router/loginRoute.js';
import homeRouter from './router/homeRoute.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors({origin: 'https://taskly-frontend-psi.vercel.app/', credentials: true }));
app.use(express.json());

app.use('/api', signupRouter);
app.use('/api', loginRouter);
app.use('/', homeRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})