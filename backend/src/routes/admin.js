const express = require('express')
const router = express.Router()
const configService = require('../services/configService')
const adminAuthService = require('../services/adminAuthService')
const { adminAuth, requireSuperAdmin } = require('../middleware/adminAuth')

// Admin authentication
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required' 
      })
    }
    
    const result = await adminAuthService.authenticateAdmin(username, password)
    res.json(result)
  } catch (error) {
    res.status(401).json({ 
      message: 'Authentication failed',
      error: error.message 
    })
  }
})

// Get all configurations (admin only)
router.get('/configs', adminAuth, async (req, res) => {
  try {
    const configs = await configService.getAllConfigs()
    res.json(configs)
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch configurations',
      error: error.message 
    })
  }
})

// Get configuration by key (admin only)
router.get('/configs/:key', adminAuth, async (req, res) => {
  try {
    const { key } = req.params
    const config = await configService.getConfigByKey(key)
    
    if (!config) {
      return res.status(404).json({ 
        message: 'Configuration not found' 
      })
    }
    
    res.json(config)
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch configuration',
      error: error.message 
    })
  }
})

// Create or update configuration (admin only)
router.put('/configs/:key', adminAuth, async (req, res) => {
  try {
    const { key } = req.params
    const { value, description, category, isPublic } = req.body
    
    if (!value) {
      return res.status(400).json({ 
        message: 'Value is required' 
      })
    }
    
    const config = await configService.upsertConfig(
      key,
      value,
      description,
      category || 'general',
      isPublic || false
    )
    
    res.json(config)
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to save configuration',
      error: error.message 
    })
  }
})

// Delete configuration (super admin only)
router.delete('/configs/:key', adminAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { key } = req.params
    const deleted = await configService.deleteConfig(key)
    
    if (!deleted) {
      return res.status(404).json({ 
        message: 'Configuration not found' 
      })
    }
    
    res.json({ message: 'Configuration deleted successfully' })
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to delete configuration',
      error: error.message 
    })
  }
})

// Initialize default configurations (super admin only)
router.post('/configs/initialize', adminAuth, requireSuperAdmin, async (req, res) => {
  try {
    await configService.initializeDefaultConfigs()
    res.json({ message: 'Default configurations initialized successfully' })
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to initialize configurations',
      error: error.message 
    })
  }
})

// Get admin profile
router.get('/profile', adminAuth, async (req, res) => {
  try {
    res.json(req.admin)
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch admin profile',
      error: error.message 
    })
  }
})

module.exports = router
