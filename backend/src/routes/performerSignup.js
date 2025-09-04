const express = require('express')
const Joi = require('joi')
const db = require('../config/database')

const router = express.Router()

// Validation schema for performer signup
const performerSignupSchema = Joi.object({
  eventCode: Joi.string().length(6).required(),
  performerName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(20).optional().allow(''),
  performanceType: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).max(500).optional().allow(''),
  socialMedia: Joi.string().max(200).optional().allow('')
})

// @route   POST /api/performer-signup
// @desc    Sign up a performer for an event
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { error, value } = performerSignupSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const { eventCode, performerName, email, phone, performanceType, description, socialMedia } = value

    // Check if event exists and is active
    const event = await db('events')
      .where('event_code', eventCode)
      .where('is_active', true)
      .first()

    if (!event) {
      return res.status(404).json({ message: 'Event not found or inactive' })
    }

    // Check if event is in the future
    const eventDate = new Date(event.event_date)
    const now = new Date()
    if (eventDate <= now) {
      return res.status(400).json({ message: 'Event has already passed' })
    }

    // Check if performer is already signed up for this event
    const existingSignup = await db('performer_signups')
      .where('event_id', event.id)
      .where('email', email)
      .first()

    if (existingSignup) {
      return res.status(400).json({ message: 'You are already signed up for this event' })
    }

    // Check if event has reached max attendees
    if (event.max_attendees) {
      const currentSignups = await db('performer_signups')
        .where('event_id', event.id)
        .count('* as count')
        .first()

      if (parseInt(currentSignups.count) >= event.max_attendees) {
        return res.status(400).json({ message: 'Event is full' })
      }
    }

    // Create performer signup
    const [signup] = await db('performer_signups')
      .insert({
        event_id: event.id,
        performer_name: performerName,
        email: email,
        phone: phone || null,
        performance_type: performanceType,
        description: description || null,
        social_media: socialMedia || null,
        signup_date: new Date()
      })
      .returning('*')

    res.status(201).json({
      message: 'Successfully signed up for the event!',
      signup: {
        id: signup.id,
        performerName: signup.performer_name,
        eventTitle: event.title,
        eventDate: event.event_date,
        eventTime: event.start_time
      }
    })
  } catch (error) {
    console.error('Performer signup error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/performer-signup/event/:code
// @desc    Get event details for signup page
// @access  Public
router.get('/event/:code', async (req, res) => {
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
      .where('events.event_code', req.params.code)
      .where('events.is_active', true)
      .first()

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // Get current signup count
    const signupCount = await db('performer_signups')
      .where('event_id', event.id)
      .count('* as count')
      .first()

    res.json({
      ...event,
      current_signups: parseInt(signupCount.count),
      spots_remaining: event.max_attendees ? event.max_attendees - parseInt(signupCount.count) : null
    })
  } catch (error) {
    console.error('Get event for signup error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
