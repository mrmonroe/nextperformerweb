const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3002',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Configuration endpoint
app.get('/api/config', (req, res) => {
  res.json({
    app: {
      name: 'GrabTheMic',
      version: '1.0.0',
      description: 'Find Your Voice, Share Your Talent',
      environment: process.env.NODE_ENV || 'development',
      debug: true
    },
    ui: {
      theme: {
        primary: '#6200EE',
        secondary: '#03DAC6',
        background: '#FFFFFF',
        surface: '#F5F5F5',
        error: '#B00020'
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
      },
      borderRadius: '8px',
      fontFamily: 'Libre Baskerville, serif'
    },
    features: {
      auth: {
        enableSignUp: true,
        enableForgotPassword: true,
        enableSocialLogin: false,
        enableBiometricLogin: false
      },
      events: {
        enableCreate: true,
        enableEdit: true,
        enableDelete: true,
        enableSpotlight: true,
        enableSearch: true,
        enableFiltering: true
      },
      venues: {
        enableCreate: true,
        enableEdit: true,
        enableDelete: true
      },
      profile: {
        enableEdit: true,
        enableAvatar: true,
        enableSettings: true
      },
      notifications: {
        enablePush: false,
        enableEmail: false,
        enableInApp: true
      }
    },
    content: {
      branding: {
        logo: '/assets/logo.png',
        favicon: '/assets/favicon.ico',
        title: 'GrabTheMic',
        tagline: 'Find Your Voice, Share Your Talent'
      },
      copy: {
        auth: {
          welcomeTitle: 'Welcome to GrabTheMic',
          welcomeSubtitle: 'Find your voice, share your talent',
          signInTitle: 'Sign In',
          signUpTitle: 'Create Account',
          forgotPasswordTitle: 'Forgot Password?',
          resetPasswordTitle: 'Reset Password'
        },
        dashboard: {
          title: 'Dashboard',
          subtitle: 'Welcome back!',
          quickActionsTitle: 'Quick Actions',
          recentActivityTitle: 'Recent Activity'
        },
        events: {
          title: 'Events',
          createTitle: 'Create Event',
          editTitle: 'Edit Event',
          noEventsTitle: 'No Events Yet',
          noEventsSubtitle: 'Create your first event to get started'
        },
        profile: {
          title: 'Profile',
          editTitle: 'Edit Profile',
          settingsTitle: 'Settings'
        },
        common: {
          loading: 'Loading...',
          error: 'Something went wrong',
          retry: 'Retry',
          cancel: 'Cancel',
          save: 'Save',
          delete: 'Delete',
          confirm: 'Confirm',
          success: 'Success!'
        }
      },
      validation: {
        email: {
          required: 'Email is required',
          invalid: 'Please enter a valid email address'
        },
        password: {
          required: 'Password is required',
          minLength: 'Password must be at least 8 characters',
          weak: 'Password is too weak'
        },
        name: {
          required: 'Name is required',
          minLength: 'Name must be at least 2 characters'
        }
      }
    }
  });
});

// Authentication endpoints
app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, displayName, email, password } = req.body;
  
  // Basic validation
  if (!firstName || !lastName || !displayName || !email || !password) {
    return res.status(400).json({ 
      message: 'First name, last name, display name, email, and password are required' 
    });
  }
  
  if (password.length < 8) {
    return res.status(400).json({ 
      message: 'Password must be at least 8 characters' 
    });
  }
  
  // Mock successful registration
  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: Math.random().toString(36).substr(2, 9),
      firstName,
      lastName,
      displayName,
      name: `${firstName} ${lastName}`, // For backward compatibility
      email,
      createdAt: new Date().toISOString()
    },
    token: 'mock-jwt-token-' + Math.random().toString(36).substr(2, 9)
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Email and password are required' 
    });
  }
  
  // Mock successful login
  res.json({
    message: 'Login successful',
    user: {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Test User',
      email,
      createdAt: new Date().toISOString()
    },
    token: 'mock-jwt-token-' + Math.random().toString(36).substr(2, 9)
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Mock API endpoints for now
app.get('/api/events', (req, res) => {
  res.json({
    events: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    }
  });
});

app.get('/api/venues', (req, res) => {
  res.json({
    venues: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 GrabTheMic Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`⚙️  Config: http://localhost:${PORT}/api/config`);
});

module.exports = app;
