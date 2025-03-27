import express from 'express';
import loginController from '../controllers/loginController.js';

const loginRoute = express.Router();

loginRoute.post('/login', async (req, res, next) => {
    try {
        console.log("🔥 Login Route Hit");
        console.log("📩 Request Body:", req.body);
        
        await loginController(req, res, next);
    } catch (error) {
        console.error("🚨 Login Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

export default loginRoute;
