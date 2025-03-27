import express from 'express';

import loginController from '../controllers/loginController.js'


const loginRoute = express.Router();

loginRoute.post('/login', (req, res, next) => {
    console.log("Login Route Hit");
    console.log("Request Body:", req.body);
    next();
}, loginController);

export default loginRoute;