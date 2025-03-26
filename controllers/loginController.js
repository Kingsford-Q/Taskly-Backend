import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/user.js';

const loginController = async(req, res) => {
    const {email, password} = req.body;

    try{
        const user = await User.findOne({email});
        if(!user) return res.status(401).json({message: 'User not found! Please sign up'});

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {id: user._id, name: user.name, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn: '24h'}
        )

            res.status(200).json(
                {
                    message: 'Login Successfull',
                    user: {
                        _id: user._id,
                        name: user.name,
                        email:user.email
                    },
                    token
                });
    }
    
    catch(error){
        res.status(500).json({message: 'Error logging user in', error: error.message})
    }

}

export default loginController;