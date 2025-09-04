// App Configuration
const appConfig = {
  // App Information
  app: {
    name: process.env.APP_NAME || 'Next Performer',
    version: process.env.APP_VERSION || '1.0.0',
    description: process.env.APP_DESCRIPTION || 'Find Your Voice, Share Your Talent',
    environment: process.env.NODE_ENV || 'development',
    debug: process.env.NODE_ENV === 'development'
  },

  // API Configuration
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
    timeout: 10000,
    retryAttempts: 3
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://grabthemic_user:grabthemic_password@localhost:5432/grabthemic',
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000
    }
  },

  // Authentication Configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    tokenExpiry: '24h',
    refreshTokenExpiry: '7d',
    passwordMinLength: 8
  },

  // UI Configuration
  ui: {
    theme: {
      primary: '#6200EE',
      secondary: '#03DAC6',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      error: '#B00020',
      onPrimary: '#FFFFFF',
      onSecondary: '#000000',
      onBackground: '#000000',
      onSurface: '#000000',
      onError: '#FFFFFF'
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

  // Feature Flags
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

  // Content Configuration
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
  },

  // Pagination Configuration
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
    defaultPage: 1
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxFiles: 5
  }
};

module.exports = appConfig;
