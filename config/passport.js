import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.js"; // Ensure User model is correct

dotenv.config();

// 📌 Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
          });
        }

        // Generate JWT Token
        const token = jwt.sign(
          { id: user._id, name: user.name, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// 📌 GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "https://taskly-backend-rt4v.onrender.com/api/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          user = await User.create({
            githubId: profile.id,
            name: profile.displayName || profile.username,
            email: profile.emails?.[0]?.value || `github-${profile.id}@taskly.com`,
            avatar: profile.photos?.[0]?.value,
          });
        }

        // Generate JWT token
        const token = jwt.sign(
          { id: user._id, name: user.name, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
