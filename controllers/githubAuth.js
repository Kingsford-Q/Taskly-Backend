import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/user.js"; // Import your User model

export const githubAuthCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  try {
    // Exchange code for GitHub access token
    const tokenResponse = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
    },
    { headers: { Accept: "application/json" } }
    );

    console.log("GitHub Token Response:", tokenResponse.data);

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
        console.error("GitHub OAuth Error: No access token received", tokenResponse.data);
        return res.status(400).json({ error: "GitHub authentication failed: No access token" });
      }

    // Fetch user data from GitHub API
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubUser = userResponse.data;

    if (!githubUser) {
      throw new Error("Failed to fetch GitHub user");
    }

    console.log("GitHub User Data:", githubUser);

    // Check if user exists in database
    let user = await User.findOne({ githubId: githubUser.id });

    if (!user) {
      // Create a new user if not found
      user = new User({
        githubId: githubUser.id,
        name: githubUser.name || githubUser.login,
        email: githubUser.email || `${githubUser.login}@github.com`, // Some GitHub users may hide email
        profilePic: githubUser.avatar_url,
      });
      await user.save();
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send response with JWT token
    res.status(200).json({
      success: true,
      message: "GitHub authentication successful",
      user,
      token: jwtToken,
    });
  } catch (error) {
    console.error("GitHub OAuth Error:", error.message);
    res.status(500).json({ error: "GitHub authentication failed" });
  }
};
