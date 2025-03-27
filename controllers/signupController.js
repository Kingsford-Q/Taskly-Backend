import User from '../models/user.js';

const signupController = async (req, res) => {
    const { name, email, password, googleId } = req.body; // Accept `googleId` if provided

    try {
        // Check if user already exists by email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user data dynamically (only include `googleId` if provided)
        const userData = { name, email, password };
        if (googleId) {
            userData.googleId = googleId; // Only add googleId if it exists
        }

        // Create and save user
        const user = new User(userData);
        await user.save();

        res.status(201).json({ message: 'User signed up successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Error signing up user', error: error.message });
    }
};

export default signupController;
