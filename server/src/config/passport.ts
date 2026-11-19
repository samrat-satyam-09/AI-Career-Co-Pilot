import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/User";
import { logger } from "./logger";

export const configurePassport = () => {
  // ── Google OAuth Strategy ──────────────────────────────────────────────────
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "",
        passReqToCallback: true,
      },
      async (_req, _accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email found in Google profile"), undefined);
          }

          let user = await User.findOne({ email });

          if (user) {
            // Mark email as verified if they successfully sign in with Google
            if (!user.isVerified) {
              user.isVerified = true;
            }
            // Update authProvider to google if it is not set or currently local.
            if (user.authProvider !== "google") {
              user.authProvider = "google";
            }

            // Sync user avatar if it's empty
            if (!user.avatar?.url && profile.photos?.[0]?.value) {
              user.avatar = {
                public_id: "",
                url: profile.photos[0].value,
              };
            }
            await user.save();
          } else {
            // Create user
            user = await User.create({
              name: profile.displayName || profile.name?.givenName || "Google User",
              email,
              isVerified: true,
              authProvider: "google",
              avatar: {
                public_id: "",
                url: profile.photos?.[0]?.value || "",
              },
            });
          }

          return done(null, user);
        } catch (error) {
          logger.error(`Error in Google OAuth strategy callback: ${error}`);
          return done(error as Error, undefined);
        }
      }
    )
  );

  // ── GitHub OAuth Strategy ──────────────────────────────────────────────────
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        callbackURL: process.env.GITHUB_CALLBACK_URL || "",
        passReqToCallback: true,
        scope: ["user:email"],
      },
      async (
        _req: any,
        _accessToken: string,
        _refreshToken: string,
        profile: any,
        done: (err: any, user?: any) => void
      ) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email found in GitHub profile"), undefined);
          }

          let user = await User.findOne({ email });

          if (user) {
            // Mark email as verified if they successfully sign in with GitHub
            if (!user.isVerified) {
              user.isVerified = true;
            }
            // Update authProvider to github if it is not set or currently local.
            if (user.authProvider !== "github") {
              user.authProvider = "github";
            }

            // Sync user avatar if it's empty
            if (!user.avatar?.url && profile.photos?.[0]?.value) {
              user.avatar = {
                public_id: "",
                url: profile.photos[0].value,
              };
            }
            await user.save();
          } else {
            // Create user
            user = await User.create({
              name: profile.displayName || profile.username || "GitHub User",
              email,
              isVerified: true,
              authProvider: "github",
              avatar: {
                public_id: "",
                url: profile.photos?.[0]?.value || "",
              },
            });
          }

          return done(null, user);
        } catch (error) {
          logger.error(`Error in GitHub OAuth strategy callback: ${error}`);
          return done(error as Error, undefined);
        }
      }
    )
  );


  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
