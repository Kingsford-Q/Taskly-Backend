import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import signupRouter from './router/signupRoute.js';
import loginRouter from './router/loginRoute.js';
import homeRouter from './router/homeRoute.js';
import authRouter from "./router/authRoute.js";
import githubRoutes from "./router/authRoute.js";


dotenv.config();
connectDB();

const app = express();

app.use(
    cors({
      origin: ['http://localhost:5173', 'https://taskly-frontend-psi.vercel.app'], // ✅ Ensure no trailing slash
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  
app.use(express.json());

app.use('/api', signupRouter);
app.use('/api', loginRouter);
app.use('/', homeRouter);
app.use("/api/auth", authRouter);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})