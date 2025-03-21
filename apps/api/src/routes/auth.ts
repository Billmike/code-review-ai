import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';

const router = express.Router();

// GitHub OAuth login route
router.get('/github', passport.authenticate('github', { scope: ['user:email', 'read:org', 'repo'] }));

// GitHub OAuth callback route
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const user = req.user as User;
    
    // Create JWT token
    const token = (jwt as any).sign(
      {
        id: user.id,
        githubId: user.githubId,
        username: user.username,
      },
      `${process.env.JWT_SECRET}`,
      {
        expiresIn: `${process.env.JWT_EXPIRATION}`,
      }
    );

    // Update last login timestamp
    user.update({ lastLogin: new Date() });

    // For development, redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  }
);

// Verify token and get user info
router.get('/me', async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1] || '';
    
    // Verify token
    const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`) as any;
    
    // Find user
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['githubAccessToken', 'githubRefreshToken'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;