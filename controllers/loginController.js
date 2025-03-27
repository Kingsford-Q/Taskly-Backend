import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("🛠️ Login Request Received:", { email, password });

        const user = await User.findOne({ email });

        if (!user) {
            console.log("❌ User Not Found");
            return res.status(404).json({ message: "User not found! Please sign up" });
        }

        // Check if the user signed up with Google
        if (!user.password) {
            console.log("🔵 Google OAuth User Detected");
            return res.status(400).json({ message: "Please log in with Google" });
        }

        // Compare passwords for non-OAuth users
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log("❌ Incorrect Password");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        console.log("✅ Login Successful");
        res.json({ token, message: "Login successful!" });

    } catch (error) {
        console.error("🚨 Error in loginController:", error);
        res.status(500).json({ message: "Error logging user in", error: error.message });
    }
};

export default loginController;
