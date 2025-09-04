const express = require('express')
const Joi = require('joi')
const db = require('../config/database')
const { auth } = require('../middleware/auth')

const router = express.Router()

// Validation schemas
const eventSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  venueId: Joi.string().uuid().required(),
  eventDate: Joi.date().required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
  isSpotlight: Joi.boolean().default(false),
  maxAttendees: Joi.number().integer().min(1).optional(),
  imageUrl: Joi.string().uri().optional().allow('')
})

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, spotlight } = req.query
    const offset = (page - 1) * limit

    let query = db('events')
      .select(
        'events.*',
        'venues.name as venue_name',
        'venues.address as venue_address',
        'venues.city as venue_city',
        'venues.state as venue_state',
        'users.display_name as created_by_name'
      )
      .leftJoin('venues', 'events.venue_id', 'venues.id')
      .leftJoin('users', 'events.created_by', 'users.id')
      .where('events.is_active', true)

    if (search) {
      query = query.where(function() {
        this.where('events.title', 'ilike', `%${search}%`)
          .orWhere('events.description', 'ilike', `%${search}%`)
          .orWhere('venues.name', 'ilike', `%${search}%`)
      })
    }

    if (spotlight === 'true') {
      query = query.where('events.is_spotlight', true)
    }

    const events = await query
      .orderBy('events.event_date', 'asc')
      .orderBy('events.start_time', 'asc')
      .limit(limit)
      .offset(offset)

    const total = await db('events')
      .where('is_active', true)
      .count('* as count')
      .first()

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    })
  } catch (error) {
    console.error('Get events error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await db('events')
      .select(
        'events.*',
        'venues.name as venue_name',
        'venues.address as venue_address',
        'venues.city as venue_city',
        'venues.state as venue_state',
        'venues.phone as venue_phone',
        'venues.website as venue_website',
        'users.display_name as created_by_name'
      )
      .leftJoin('venues', 'events.venue_id', 'venues.id')
      .leftJoin('users', 'events.created_by', 'users.id')
      .where('events.id', req.params.id)
      .where('events.is_active', true)
      .first()

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    res.json(event)
  } catch (error) {
    console.error('Get event error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/events
// @desc    Create event
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { error, value } = eventSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const {
      title,
      description,
      venueId,
      eventDate,
      startTime,
      endTime,
      isSpotlight,
      maxAttendees,
      imageUrl
    } = value

    // Check if venue exists
    const venue = await db('venues').where('id', venueId).first()
    if (!venue) {
      return res.status(400).json({ message: 'Venue not found' })
    }

    const [event] = await db('events')
      .insert({
        title,
        description,
        venue_id: venueId,
        created_by: req.user.userId,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        is_spotlight: isSpotlight,
        max_attendees: maxAttendees,
        image_url: imageUrl
      })
      .returning('*')

    res.status(201).json(event)
  } catch (error) {
    console.error('Create event error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { error, value } = eventSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    // Check if event exists and user owns it
    const event = await db('events')
      .where('id', req.params.id)
      .where('created_by', req.user.userId)
      .first()

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    const {
      title,
      description,
      venueId,
      eventDate,
      startTime,
      endTime,
      isSpotlight,
      maxAttendees,
      imageUrl
    } = value

    const updatedEvent = await db('events')
      .where('id', req.params.id)
      .update({
        title,
        description,
        venue_id: venueId,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        is_spotlight: isSpotlight,
        max_attendees: maxAttendees,
        image_url: imageUrl
      })
      .returning('*')

    res.json(updatedEvent[0])
  } catch (error) {
    console.error('Update event error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if event exists and user owns it
    const event = await db('events')
      .where('id', req.params.id)
      .where('created_by', req.user.userId)
      .first()

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    await db('events')
      .where('id', req.params.id)
      .update({ is_active: false })

    res.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Delete event error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
