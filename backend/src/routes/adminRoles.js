const express = require('express')
const router = express.Router()
const roleService = require('../services/roleService')
const { adminAuth } = require('../middleware/adminAuth')

// Apply admin authentication to all routes
router.use(adminAuth)

// Get all roles
router.get('/roles', async (req, res) => {
  try {
    const roles = await roleService.getAllRoles()
    res.json(roles)
  } catch (error) {
    console.error('Get roles error:', error)
    res.status(500).json({ message: 'Error fetching roles' })
  }
})

// Get role by ID
router.get('/roles/:id', async (req, res) => {
  try {
    const role = await roleService.getRoleById(req.params.id)
    if (!role) {
      return res.status(404).json({ message: 'Role not found' })
    }
    res.json(role)
  } catch (error) {
    console.error('Get role error:', error)
    res.status(500).json({ message: 'Error fetching role' })
  }
})

// Create new role
router.post('/roles', async (req, res) => {
  try {
    const { name, display_name, description, permissions, is_active } = req.body

    // Validate required fields
    if (!name || !display_name) {
      return res.status(400).json({ message: 'Name and display name are required' })
    }

    // Check if role already exists
    const existingRole = await roleService.getRoleByName(name)
    if (existingRole) {
      return res.status(400).json({ message: 'Role with this name already exists' })
    }

    const role = await roleService.createRole({
      name,
      display_name,
      description,
      permissions: permissions || [],
      is_active: is_active !== false
    })

    res.status(201).json(role)
  } catch (error) {
    console.error('Create role error:', error)
    res.status(500).json({ message: 'Error creating role' })
  }
})

// Update role
router.put('/roles/:id', async (req, res) => {
  try {
    const { display_name, description, permissions, is_active } = req.body

    const role = await roleService.updateRole(req.params.id, {
      display_name,
      description,
      permissions: permissions || [],
      is_active
    })

    if (!role) {
      return res.status(404).json({ message: 'Role not found' })
    }

    res.json(role)
  } catch (error) {
    console.error('Update role error:', error)
    res.status(500).json({ message: 'Error updating role' })
  }
})

// Delete role
router.delete('/roles/:id', async (req, res) => {
  try {
    const deleted = await roleService.deleteRole(req.params.id)
    if (!deleted) {
      return res.status(404).json({ message: 'Role not found' })
    }
    res.json({ message: 'Role deleted successfully' })
  } catch (error) {
    console.error('Delete role error:', error)
    res.status(500).json({ message: 'Error deleting role' })
  }
})

// Get all available permissions
router.get('/permissions', async (req, res) => {
  try {
    const permissions = roleService.getAllPermissions()
    res.json(permissions)
  } catch (error) {
    console.error('Get permissions error:', error)
    res.status(500).json({ message: 'Error fetching permissions' })
  }
})

// Initialize default roles
router.post('/roles/initialize', async (req, res) => {
  try {
    await roleService.initializeDefaultRoles()
    res.json({ message: 'Default roles initialized successfully' })
  } catch (error) {
    console.error('Initialize roles error:', error)
    res.status(500).json({ message: 'Error initializing default roles' })
  }
})

module.exports = router
