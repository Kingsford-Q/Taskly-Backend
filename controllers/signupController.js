import User from '../models/user.js';

const signupController = async(req, res) => {
    const {name, email, password} = req.body;
    try{

        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({message:'User already exist'});

        const user = new User({name, email, password});
        await user.save();

        res.status(201).json({message: 'User signed up successfully'});

    }
    catch(error){
        res.status(500).json({message: 'Error signing up user', error: error.message})
    } 
    
}

export default signupController;
