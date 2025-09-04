const knex = require('../config/database')

class ConfigService {
  // Get all public configurations
  async getPublicConfig() {
    try {
      const configs = await knex('configurations')
        .where('is_public', true)
        .select('key', 'value', 'category')
      
      return this.formatConfig(configs)
    } catch (error) {
      console.error('Error fetching public config:', error)
      throw error
    }
  }

  // Get all configurations (admin only)
  async getAllConfigs() {
    try {
      const configs = await knex('configurations')
        .select('*')
        .orderBy('category', 'asc')
        .orderBy('key', 'asc')
      
      return configs
    } catch (error) {
      console.error('Error fetching all configs:', error)
      throw error
    }
  }

  // Get configuration by key
  async getConfigByKey(key) {
    try {
      const config = await knex('configurations')
        .where('key', key)
        .first()
      
      return config
    } catch (error) {
      console.error(`Error fetching config for key ${key}:`, error)
      throw error
    }
  }

  // Create or update configuration
  async upsertConfig(key, value, description = null, category = 'general', isPublic = false) {
    try {
      const existing = await this.getConfigByKey(key)
      
      if (existing) {
        // Update existing
        await knex('configurations')
          .where('key', key)
          .update({
            value: JSON.stringify(value),
            description,
            category,
            is_public: isPublic,
            updated_at: knex.fn.now()
          })
      } else {
        // Create new
        await knex('configurations').insert({
          key,
          value: JSON.stringify(value),
          description,
          category,
          is_public: isPublic
        })
      }
      
      return await this.getConfigByKey(key)
    } catch (error) {
      console.error(`Error upserting config for key ${key}:`, error)
      throw error
    }
  }

  // Delete configuration
  async deleteConfig(key) {
    try {
      const deleted = await knex('configurations')
        .where('key', key)
        .del()
      
      return deleted > 0
    } catch (error) {
      console.error(`Error deleting config for key ${key}:`, error)
      throw error
    }
  }

  // Initialize default configurations
  async initializeDefaultConfigs() {
    try {
      const defaultConfigs = [
        {
          key: 'app',
          value: {
            name: 'Next Performer',
            version: '1.0.0',
            description: 'Find Your Voice, Share Your Talent',
            environment: 'development',
            debug: true
          },
          description: 'Application basic information',
          category: 'app',
          isPublic: true
        },
        {
          key: 'ui_theme',
          value: {
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
          description: 'UI theme colors',
          category: 'ui',
          isPublic: true
        },
        {
          key: 'ui_spacing',
          value: {
            xs: '4px',
            sm: '8px',
            md: '16px',
            lg: '24px',
            xl: '32px'
          },
          description: 'UI spacing values',
          category: 'ui',
          isPublic: true
        },
        {
          key: 'ui_other',
          value: {
            borderRadius: '8px',
            fontFamily: 'Libre Baskerville, serif'
          },
          description: 'Other UI settings',
          category: 'ui',
          isPublic: true
        },
        {
          key: 'features',
          value: {
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
          description: 'Feature flags',
          category: 'features',
          isPublic: true
        },
        {
          key: 'content_branding',
          value: {
            logo: '/assets/logo.png',
            favicon: '/assets/favicon.ico',
            title: 'Next Performer',
            tagline: 'Find Your Voice, Share Your Talent'
          },
          description: 'Branding content',
          category: 'content',
          isPublic: true
        },
        {
          key: 'content_auth',
          value: {
            welcomeTitle: 'Welcome to Next Performer',
            welcomeSubtitle: 'Find your voice, share your talent',
            signInTitle: 'Sign In',
            signUpTitle: 'Create Account',
            forgotPasswordTitle: 'Forgot Password?',
            resetPasswordTitle: 'Reset Password'
          },
          description: 'Authentication page content',
          category: 'content',
          isPublic: true
        },
        {
          key: 'content_homepage',
          value: {
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
          description: 'Homepage content',
          category: 'content',
          isPublic: true
        },
        {
          key: 'content_common',
          value: {
            loading: 'Loading...',
            error: 'Something went wrong',
            retry: 'Retry',
            cancel: 'Cancel',
            save: 'Save',
            delete: 'Delete',
            confirm: 'Confirm',
            success: 'Success!'
          },
          description: 'Common UI text',
          category: 'content',
          isPublic: true
        },
        {
          key: 'validation',
          value: {
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
          },
          description: 'Validation messages',
          category: 'content',
          isPublic: true
        }
      ]

      for (const config of defaultConfigs) {
        await this.upsertConfig(
          config.key,
          config.value,
          config.description,
          config.category,
          config.isPublic
        )
      }

      console.log('✅ Default configurations initialized')
    } catch (error) {
      console.error('Error initializing default configs:', error)
      throw error
    }
  }

  // Format configurations into the expected structure
  formatConfig(configs) {
    const formatted = {
      app: {},
      ui: {
        theme: {},
        spacing: {},
        borderRadius: '',
        fontFamily: ''
      },
      features: {},
      content: {
        branding: {},
        copy: {
          auth: {},
          dashboard: {},
          events: {},
          profile: {},
          homepage: {},
          common: {}
        },
        validation: {}
      }
    }

    configs.forEach(config => {
      const value = typeof config.value === 'string' ? JSON.parse(config.value) : config.value
      
      switch (config.key) {
        case 'app':
          formatted.app = value
          break
        case 'ui_theme':
          formatted.ui.theme = value
          break
        case 'ui_spacing':
          formatted.ui.spacing = value
          break
        case 'ui_other':
          formatted.ui.borderRadius = value.borderRadius
          formatted.ui.fontFamily = value.fontFamily
          break
        case 'features':
          formatted.features = value
          break
        case 'content_branding':
          formatted.content.branding = value
          break
        case 'content_auth':
          formatted.content.copy.auth = value
          break
        case 'content_homepage':
          formatted.content.copy.homepage = value
          break
        case 'content_common':
          formatted.content.copy.common = value
          break
        case 'validation':
          formatted.content.validation = value
          break
      }
    })

    return formatted
  }
}

module.exports = new ConfigService()
