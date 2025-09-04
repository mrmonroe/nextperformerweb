const express = require('express')
const Joi = require('joi')
const db = require('../config/database')
const { auth } = require('../middleware/auth')

const router = express.Router()

// Validation schemas
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).optional(),
  lastName: Joi.string().min(2).optional(),
  displayName: Joi.string().min(2).optional(),
  bio: Joi.string().max(500).optional(),
  avatarUrl: Joi.string().uri().optional()
})

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'display_name', 'bio', 'avatar_url', 'created_at')
      .where('id', req.user.userId)
      .first()

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      displayName: user.display_name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const updateData = {}
    if (value.firstName) updateData.first_name = value.firstName
    if (value.lastName) updateData.last_name = value.lastName
    if (value.displayName) updateData.display_name = value.displayName
    if (value.bio !== undefined) updateData.bio = value.bio
    if (value.avatarUrl !== undefined) updateData.avatar_url = value.avatarUrl

    const [updatedUser] = await db('users')
      .where('id', req.user.userId)
      .update(updateData)
      .returning(['id', 'email', 'first_name', 'last_name', 'display_name', 'bio', 'avatar_url', 'created_at'])

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      displayName: updatedUser.display_name,
      bio: updatedUser.bio,
      avatarUrl: updatedUser.avatar_url,
      createdAt: updatedUser.created_at
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
