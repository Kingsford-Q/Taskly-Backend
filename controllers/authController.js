import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";  // Import User model

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "No token provided" });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Extract user data (with fallbacks)
    const googleId = payload.sub;
    const name = payload.name || "Unknown User";  // 🔹 Default name
    const email = payload.email || `guest-${googleId}@example.com`; // 🔹 Default email
    const profilePic = payload.picture || "https://example.com/default-avatar.png"; // 🔹 Default avatar

    // Check if user exists in database
    let user = await User.findOne({ googleId });

    if (!user) {
      // If user doesn't exist, create a new one
      user = new User({ googleId, name, email, profilePic });
      await user.save();
    }

    // Create JWT token for authentication
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Google token verified successfully",
      user,
      token: jwtToken,
    });
  } catch (error) {
    console.error("Error verifying Google token:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
