const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const db = require('../config/database')
const { auth } = require('../middleware/auth')
const appConfig = require('../../config/app.config')

const router = express.Router()

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  displayName: Joi.string().min(2).required()
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
})

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const { email, password, firstName, lastName, displayName } = value

    // Check if user exists
    const existingUser = await db('users').where('email', email).first()
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create user
    const [user] = await db('users')
      .insert({
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        display_name: displayName
      })
      .returning(['id', 'email', 'first_name', 'last_name', 'display_name', 'created_at'])

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      appConfig.auth.jwtSecret,
      { expiresIn: appConfig.auth.tokenExpiry }
    )

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        displayName: user.display_name,
        createdAt: user.created_at
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const { email, password } = value

    // Check if user exists
    const user = await db('users').where('email', email).first()
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Update last login
    await db('users')
      .where('id', user.id)
      .update({ last_login_at: new Date() })

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      appConfig.auth.jwtSecret,
      { expiresIn: appConfig.auth.tokenExpiry }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        displayName: user.display_name,
        bio: user.bio,
        avatarUrl: user.avatar_url,
        lastLoginAt: user.last_login_at
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'display_name', 'bio', 'avatar_url', 'last_login_at', 'created_at')
      .where('id', req.user.userId)
      .first()

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      displayName: user.display_name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logout successful' })
})

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', auth, async (req, res) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const { currentPassword, newPassword } = value

    // Get user
    const user = await db('users').where('id', req.user.userId).first()
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)

    // Update password
    await db('users')
      .where('id', req.user.userId)
      .update({ password_hash: passwordHash })

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
