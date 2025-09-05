const express = require('express')
const router = express.Router()
const userService = require('../services/userService')
const roleService = require('../services/roleService')
const { adminAuth } = require('../middleware/adminAuth')

// Apply admin authentication to all routes
router.use(adminAuth)

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await userService.getAllUsers()
    res.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'Error fetching users' })
  }
})

// Get user statistics
router.get('/users/stats', async (req, res) => {
  try {
    const stats = await userService.getUserStats()
    res.json(stats)
  } catch (error) {
    console.error('Get user stats error:', error)
    res.status(500).json({ message: 'Error fetching user statistics' })
  }
})

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Error fetching user' })
  }
})

// Create new user
router.post('/users', async (req, res) => {
  try {
    const { email, password, first_name, last_name, display_name, bio, avatar_url, role_id } = req.body

    // Validate required fields
    if (!email || !password || !first_name || !last_name || !display_name) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Check if user already exists
    const existingUser = await userService.getUserById(email)
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }

    const user = await userService.createUser({
      email,
      password,
      first_name,
      last_name,
      display_name,
      bio,
      avatar_url,
      role_id
    })

    res.status(201).json(user)
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ message: 'Error creating user' })
  }
})

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { first_name, last_name, display_name, bio, avatar_url, password } = req.body

    const user = await userService.updateUser(req.params.id, {
      first_name,
      last_name,
      display_name,
      bio,
      avatar_url,
      password
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ message: 'Error updating user' })
  }
})

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await userService.deleteUser(req.params.id)
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ message: 'Error deleting user' })
  }
})

// Assign role to user
router.post('/users/:id/roles', async (req, res) => {
  try {
    const { role_id } = req.body

    if (!role_id) {
      return res.status(400).json({ message: 'Role ID is required' })
    }

    // For now, use the first regular user as assigned_by since admin users are in a separate table
    // TODO: Fix the foreign key constraint to allow admin user IDs
    const assignedBy = '1c056447-64a9-4a52-b7e0-5e4b09620541' // First regular user
    const userRole = await userService.assignRoleToUser(req.params.id, role_id, assignedBy)
    res.status(201).json(userRole)
  } catch (error) {
    console.error('Assign role error:', error)
    res.status(500).json({ message: 'Error assigning role' })
  }
})

// Remove role from user
router.delete('/users/:id/roles/:roleId', async (req, res) => {
  try {
    const deleted = await userService.removeRoleFromUser(req.params.id, req.params.roleId)
    if (!deleted) {
      return res.status(404).json({ message: 'User role not found' })
    }
    res.json({ message: 'Role removed successfully' })
  } catch (error) {
    console.error('Remove role error:', error)
    res.status(500).json({ message: 'Error removing role' })
  }
})

// Set user's primary role
router.put('/users/:id/primary-role', async (req, res) => {
  try {
    const { role_id } = req.body

    if (!role_id) {
      return res.status(400).json({ message: 'Role ID is required' })
    }

    await userService.setPrimaryRole(req.params.id, role_id)
    res.json({ message: 'Primary role updated successfully' })
  } catch (error) {
    console.error('Set primary role error:', error)
    res.status(500).json({ message: 'Error setting primary role' })
  }
})

// Search users
router.get('/users/search/:query', async (req, res) => {
  try {
    const users = await userService.searchUsers(req.params.query)
    res.json(users)
  } catch (error) {
    console.error('Search users error:', error)
    res.status(500).json({ message: 'Error searching users' })
  }
})

module.exports = router
