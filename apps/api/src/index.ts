import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from './config/passport'
import { testDatabaseConnection } from './config/database';
import authRoutes from './routes/auth';
import session from 'express-session';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Session configuration
app.use(
  session({
    secret: `${process.env.SESSION_SECRET}`,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the CodeReviewAI API' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testDatabaseConnection();
    
    // Start listening for requests
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();