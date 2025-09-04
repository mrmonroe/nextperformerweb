const express = require('express')
const Joi = require('joi')
const db = require('../config/database')
const { auth } = require('../middleware/auth')

const router = express.Router()

// Validation schemas
const venueSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().min(10).optional(),
  address: Joi.string().min(5).required(),
  city: Joi.string().min(2).required(),
  state: Joi.string().min(2).required(),
  zipCode: Joi.string().min(5).required(),
  phone: Joi.string().optional(),
  website: Joi.string().uri().optional(),
  imageUrl: Joi.string().uri().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional()
})

// @route   GET /api/venues
// @desc    Get all venues
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, city } = req.query
    const offset = (page - 1) * limit

    let query = db('venues')
      .select('*')
      .where('is_active', true)

    if (search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${search}%`)
          .orWhere('description', 'ilike', `%${search}%`)
          .orWhere('city', 'ilike', `%${search}%`)
      })
    }

    if (city) {
      query = query.where('city', 'ilike', `%${city}%`)
    }

    const venues = await query
      .orderBy('name', 'asc')
      .limit(limit)
      .offset(offset)

    const total = await db('venues')
      .where('is_active', true)
      .count('* as count')
      .first()

    res.json({
      venues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    })
  } catch (error) {
    console.error('Get venues error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/venues/:id
// @desc    Get venue by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const venue = await db('venues')
      .where('id', req.params.id)
      .where('is_active', true)
      .first()

    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' })
    }

    res.json(venue)
  } catch (error) {
    console.error('Get venue error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/venues
// @desc    Create venue
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { error, value } = venueSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const [venue] = await db('venues')
      .insert({
        name: value.name,
        description: value.description,
        address: value.address,
        city: value.city,
        state: value.state,
        zip_code: value.zipCode,
        phone: value.phone,
        website: value.website,
        image_url: value.imageUrl,
        latitude: value.latitude,
        longitude: value.longitude
      })
      .returning('*')

    res.status(201).json(venue)
  } catch (error) {
    console.error('Create venue error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/venues/:id
// @desc    Update venue
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { error, value } = venueSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const venue = await db('venues')
      .where('id', req.params.id)
      .where('is_active', true)
      .first()

    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' })
    }

    const updatedVenue = await db('venues')
      .where('id', req.params.id)
      .update({
        name: value.name,
        description: value.description,
        address: value.address,
        city: value.city,
        state: value.state,
        zip_code: value.zipCode,
        phone: value.phone,
        website: value.website,
        image_url: value.imageUrl,
        latitude: value.latitude,
        longitude: value.longitude
      })
      .returning('*')

    res.json(updatedVenue[0])
  } catch (error) {
    console.error('Update venue error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/venues/:id
// @desc    Delete venue
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const venue = await db('venues')
      .where('id', req.params.id)
      .where('is_active', true)
      .first()

    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' })
    }

    await db('venues')
      .where('id', req.params.id)
      .update({ is_active: false })

    res.json({ message: 'Venue deleted successfully' })
  } catch (error) {
    console.error('Delete venue error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
