import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/user.js"; // Import your User model

export const githubAuthCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    console.error("GitHub OAuth Error: No code provided");
    return res.status(400).json({ error: "No code provided" });
  }

  try {
    console.log("GitHub OAuth: Received code ->", code);

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

    console.log("GitHub Token Response Data:", tokenResponse.data);

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      console.error("GitHub OAuth Error: No access token received", tokenResponse.data);
      return res.status(400).json({ error: "GitHub authentication failed: No access token" });
    }

    console.log("GitHub OAuth: Retrieved Access Token ->", accessToken);

    // Fetch user data from GitHub API
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log("GitHub User API Response:", userResponse.data);

    const githubUser = userResponse.data;

    if (!githubUser) {
      throw new Error("Failed to fetch GitHub user");
    }

    console.log("GitHub OAuth: GitHub User Data:", githubUser);

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

      console.log("GitHub OAuth: Creating new user in DB:", user);
      await user.save();
    }

    console.log("GitHub OAuth: Generating JWT Token for user:", user._id);

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("GitHub OAuth: Successfully authenticated user:", user);

    // Send response with JWT token
    res.status(200).json({
      success: true,
      message: "GitHub authentication successful",
      user,
      token: jwtToken,
    });

  } catch (error) {
    console.error("GitHub OAuth Error:", error);
    res.status(500).json({ error: "GitHub authentication failed", details: error.message });
  }
};
