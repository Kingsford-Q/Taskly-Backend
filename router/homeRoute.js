import express from 'express';

const homeRoute = express.Router();

homeRoute.get('/', (req, res) => {
    res.send('API is working');
})

export default homeRoute;
