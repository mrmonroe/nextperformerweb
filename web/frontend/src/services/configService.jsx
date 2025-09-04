import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class ConfigService {
  constructor() {
    this.config = null
    this.isLoading = false
    this.listeners = []
  }

  // Get configuration from server
  async getConfig() {
    try {
      this.isLoading = true
      this.notifyListeners()
      
      const response = await axios.get(`${API_BASE_URL}/api/config`)
      this.config = response.data
      this.isLoading = false
      this.notifyListeners()
      return this.config
    } catch (error) {
      console.error('Failed to load configuration:', error)
      this.isLoading = false
      this.notifyListeners()
      // Return default config if server is unavailable
      return this.getDefaultConfig()
    }
  }

  // Get cached configuration
  getCachedConfig() {
    return this.config || this.getDefaultConfig()
  }

  // Default configuration fallback - minimal fallback only
  getDefaultConfig() {
    return {
      app: {
        name: '',
        version: '1.0.0',
        description: '',
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
          title: '',
          tagline: ''
        },
        copy: {
          auth: {
            welcomeTitle: '',
            welcomeSubtitle: '',
            signInTitle: '',
            signUpTitle: '',
            forgotPasswordTitle: '',
            resetPasswordTitle: ''
          },
          dashboard: {
            title: '',
            subtitle: '',
            quickActionsTitle: '',
            recentActivityTitle: ''
          },
          events: {
            title: '',
            createTitle: '',
            editTitle: '',
            noEventsTitle: '',
            noEventsSubtitle: ''
          },
          profile: {
            title: '',
            editTitle: '',
            settingsTitle: ''
          },
          common: {
            loading: '',
            error: '',
            retry: '',
            cancel: '',
            save: '',
            delete: '',
            confirm: '',
            success: ''
          }
        },
        validation: {
          email: {
            required: '',
            invalid: ''
          },
          password: {
            required: '',
            minLength: '',
            weak: ''
          },
          name: {
            required: '',
            minLength: ''
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