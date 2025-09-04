const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const configService = require('./services/configService');
const adminAuthService = require('./services/adminAuthService');
const roleService = require('./services/roleService');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const adminUsersRoutes = require('./routes/adminUsers');
const adminRolesRoutes = require('./routes/adminRoles');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());

// Development-specific middleware
if (process.env.NODE_ENV === 'development') {
  // Add request logging for development
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
    next();
  });
}

// Rate limiting - only in production
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);
}

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

// Configuration endpoint - now uses database
app.get('/api/config', async (req, res) => {
  try {
    const config = await configService.getPublicConfig()
    res.json(config)
  } catch (error) {
    console.error('Error fetching configuration:', error)
    res.status(500).json({ 
      message: 'Failed to load configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
});

// Admin routes
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminUsersRoutes);
app.use('/api/admin', adminRolesRoutes);

// Legacy configuration endpoint (for fallback)
app.get('/api/config-legacy', (req, res) => {
  res.json({
    app: {
      name: 'Next Performer',
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
        title: 'Next Performer',
        tagline: 'Find Your Voice, Share Your Talent'
      },
      copy: {
        auth: {
          welcomeTitle: 'Welcome to Next Performer',
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
        homepage: {
          heroTitle: 'Next Performer',
          heroSubtitle: 'Find Your Voice, Share Your Talent',
          whyChooseTitle: 'Why Choose Next Performer?',
          whyChooseSubtitle: 'Everything you need to discover, connect, and showcase your talent',
          ctaTitle: 'Ready to Share Your Voice?',
          ctaSubtitle: 'Join thousands of performers who have found their stage with Next Performer',
          features: [
            {
              title: 'Discover Events',
              description: 'Find amazing open mic events happening near you'
            },
            {
              title: 'Find Venues',
              description: 'Explore venues that host open mic nights'
            },
            {
              title: 'Connect',
              description: 'Meet other performers and build your network'
            },
            {
              title: 'Showcase Talent',
              description: 'Share your voice and get discovered'
            }
          ]
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

// Authentication endpoints are now handled by the auth routes

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

// Initialize database and start server
async function startServer() {
  try {
    // Initialize default admin user, roles, and configurations
    console.log('🔄 Initializing default data...');
    await adminAuthService.initializeDefaultAdmin();
    await roleService.initializeDefaultRoles();
    await configService.initializeDefaultConfigs();
    console.log('✅ Default data initialized');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Next Performer Backend API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`⚙️  Config: http://localhost:${PORT}/api/config`);
      console.log(`🔧 Admin Panel: http://localhost:${PORT}/api/admin`);
      console.log(`👤 Default Admin: username=admin, password=admin123`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
