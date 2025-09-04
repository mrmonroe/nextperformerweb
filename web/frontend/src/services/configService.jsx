import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class ConfigService {
  constructor() {
    this.config = null
    this.listeners = []
  }

  // Get configuration from server
  async getConfig() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/config`)
      this.config = response.data
      this.notifyListeners()
      return this.config
    } catch (error) {
      console.error('Failed to load configuration:', error)
      // Return default config if server is unavailable
      return this.getDefaultConfig()
    }
  }

  // Get cached configuration
  getCachedConfig() {
    return this.config || this.getDefaultConfig()
  }

  // Default configuration fallback
  getDefaultConfig() {
    return {
      app: {
        name: 'Next Performer',
        version: '1.0.0',
        description: 'Find Your Voice, Share Your Talent',
        environment: 'development',
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
    }
  }

  // Subscribe to configuration changes
  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Notify all listeners of configuration changes
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.config))
  }

  // Get specific configuration section
  getSection(section) {
    const config = this.getCachedConfig()
    return config[section] || {}
  }

  // Get feature flag
  getFeature(feature) {
    const features = this.getSection('features')
    return features[feature] || false
  }

  // Get content by key
  getContent(key) {
    const content = this.getSection('content')
    return this.getNestedValue(content, key) || key
  }

  // Helper to get nested object values
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }
}

export const configService = new ConfigService()