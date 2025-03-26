import express from "express";
import passport from "../config/passport.js";
import { verifyGoogleToken } from "../controllers/authController.js";
import { githubAuthCallback } from "../controllers/githubAuth.js";


const router = express.Router();

// Redirect user to Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback Route
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    if (!req.user || !req.user.token) {
      return res.redirect("https://taskly-frontend-psi.vercel.app/login?error=OAuth failed");
    }
    const { user, token } = req.user;
    

    res.redirect(
        `https://taskly-frontend-psi.vercel.app/oauth?token=${encodeURIComponent(
          token
        )}&user=${encodeURIComponent(JSON.stringify(user))}`
      );
  }
);

router.post("/github/callback", githubAuthCallback);

router.post("/google-verify", verifyGoogleToken);


export default router;
