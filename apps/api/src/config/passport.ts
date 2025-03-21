import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import dotenv from 'dotenv';
import { User } from '../models/user';

dotenv.config();

// Configure GitHub strategy for Passport
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3004/auth/github/callback',
      scope: ['user:email', 'read:org', 'repo'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user in database
        let user = await User.findOne({ where: { githubId: profile.id } });

        if (!user) {
          // Create a new user
          user = await User.create({
            githubId: profile.id,
            username: profile.username,
            displayName: profile.displayName || profile.username,
            email: profile.emails && profile.emails[0].value,
            avatarUrl: profile._json.avatar_url,
            githubAccessToken: accessToken,
            githubRefreshToken: refreshToken,
          });
        } else {
          // Update existing user's token
          await user.update({
            githubAccessToken: accessToken,
            githubRefreshToken: refreshToken,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, (user as any).id);
});

// Deserialize user from session
passport.deserializeUser(async (id: any, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;