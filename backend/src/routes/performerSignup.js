const express = require('express')
const Joi = require('joi')
const bcrypt = require('bcryptjs')
const db = require('../config/database')
const { auth } = require('../middleware/auth')

const router = express.Router()

// Validation schema for performer signup
const performerSignupSchema = Joi.object({
  eventCode: Joi.string().length(6).required(),
  timeslotId: Joi.string().uuid().required(),
  performerName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(20).optional().allow(''),
  performanceType: Joi.string().min(2).max(100).required(),
  createAccount: Joi.boolean().default(false),
  password: Joi.string().min(6).max(100).when('createAccount', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  })
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

    const { eventCode, timeslotId, performerName, email, phone, performanceType, createAccount, password } = value

    // Check if event exists and is active
    const event = await db('events')
      .where('event_code', eventCode)
      .where('is_active', true)
      .first()

    if (!event) {
      return res.status(404).json({ message: 'Event not found or inactive' })
    }

    // Check if timeslot exists and belongs to this event
    const timeslot = await db('timeslots')
      .where('id', timeslotId)
      .where('event_id', event.id)
      .where('is_available', true)
      .first()

    if (!timeslot) {
      return res.status(404).json({ message: 'Timeslot not found or unavailable' })
    }

    // Check if event is in the future
    const eventDate = new Date(event.event_date)
    const now = new Date()
    if (eventDate <= now) {
      return res.status(400).json({ message: 'Event has already passed' })
    }

    // Check if performer is already signed up for this timeslot
    const existingSignup = await db('performer_signups')
      .where('timeslot_id', timeslotId)
      .where('email', email)
      .first()

    if (existingSignup) {
      return res.status(400).json({ message: 'You are already signed up for this timeslot' })
    }

    // Check if timeslot has reached max performers
    const currentSignups = await db('performer_signups')
      .where('timeslot_id', timeslotId)
      .count('* as count')
      .first()

    if (parseInt(currentSignups.count) >= timeslot.max_performers) {
      return res.status(400).json({ message: 'This timeslot is full' })
    }

    let userId = null

    // If user wants to create an account, check if email already exists
    if (createAccount) {
      const existingUser = await db('users')
        .where('email', email)
        .first()

      if (existingUser) {
        return res.status(400).json({ message: 'An account with this email already exists' })
      }

      // Create new user account
      const hashedPassword = await bcrypt.hash(password, 10)
      const [newUser] = await db('users')
        .insert({
          email: email,
          password: hashedPassword,
          display_name: performerName,
          phone: phone || null,
          is_active: true
        })
        .returning('id')

      userId = newUser.id
    }

    // Create performer signup
    const [signup] = await db('performer_signups')
      .insert({
        event_id: event.id,
        timeslot_id: timeslotId,
        performer_name: performerName,
        email: email,
        phone: phone || null,
        performance_type: performanceType,
        signup_date: new Date()
      })
      .returning('*')

    res.status(201).json({
      message: 'Successfully signed up for the event!',
      accountCreated: createAccount,
      signup: {
        id: signup.id,
        performerName: signup.performer_name,
        eventTitle: event.title,
        eventDate: event.event_date,
        eventTime: event.start_time,
        timeslotName: timeslot.name,
        timeslotTime: `${timeslot.start_time} - ${timeslot.end_time}`
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

    // Get timeslots with signup counts
    const timeslots = await db('timeslots')
      .leftJoin('performer_signups', function() {
        this.on('timeslots.id', '=', 'performer_signups.timeslot_id')
      })
      .where('timeslots.event_id', event.id)
      .where('timeslots.is_available', true)
      .select(
        'timeslots.*',
        db.raw('COUNT(performer_signups.id) as current_signups')
      )
      .groupBy('timeslots.id')
      .orderBy('timeslots.start_time', 'asc')
      .orderBy('timeslots.sort_order', 'asc')

    const timeslotsWithCounts = timeslots.map(timeslot => ({
      ...timeslot,
      current_signups: parseInt(timeslot.current_signups),
      spots_remaining: timeslot.max_performers - parseInt(timeslot.current_signups)
    }))

    res.json({
      ...event,
      timeslots: timeslotsWithCounts
    })
  } catch (error) {
    console.error('Get event for signup error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/performer-signup/event/:eventId/signups
// @desc    Get all signups for an event (host only)
// @access  Private (Event owner only)
router.get('/event/:eventId/signups', auth, async (req, res) => {
  try {
    const { eventId } = req.params
    const { userId } = req.user || {}

    // Verify event exists and user owns it
    const event = await db('events')
      .where('id', eventId)
      .where('created_by', userId)
      .first()

    if (!event) {
      return res.status(404).json({ message: 'Event not found or access denied' })
    }

    // Get all signups with timeslot details
    const signups = await db('performer_signups')
      .join('timeslots', 'performer_signups.timeslot_id', 'timeslots.id')
      .where('performer_signups.event_id', eventId)
      .select(
        'performer_signups.*',
        'timeslots.name as timeslot_name',
        'timeslots.start_time',
        'timeslots.end_time',
        'timeslots.sort_order'
      )
      .orderBy('timeslots.sort_order', 'asc')
      .orderBy('timeslots.start_time', 'asc')
      .orderBy('performer_signups.signup_date', 'asc')

    res.json(signups)
  } catch (error) {
    console.error('Get event signups error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/performer-signup/:signupId/move
// @desc    Move a signup to a different timeslot (host only)
// @access  Private (Event owner only)
router.put('/:signupId/move', auth, async (req, res) => {
  try {
    const { signupId } = req.params
    const { timeslotId } = req.body
    const { userId } = req.user || {}

    // Verify signup exists and user owns the event
    const signup = await db('performer_signups')
      .join('events', 'performer_signups.event_id', 'events.id')
      .where('performer_signups.id', signupId)
      .where('events.created_by', userId)
      .select('performer_signups.*', 'events.id as event_id')
      .first()

    if (!signup) {
      return res.status(404).json({ message: 'Signup not found or access denied' })
    }

    // Verify new timeslot exists and belongs to the same event
    const timeslot = await db('timeslots')
      .where('id', timeslotId)
      .where('event_id', signup.event_id)
      .where('is_available', true)
      .first()

    if (!timeslot) {
      return res.status(404).json({ message: 'Timeslot not found or unavailable' })
    }

    // Check if new timeslot has space
    const currentSignups = await db('performer_signups')
      .where('timeslot_id', timeslotId)
      .count('* as count')
      .first()

    if (parseInt(currentSignups.count) >= timeslot.max_performers) {
      return res.status(400).json({ message: 'Timeslot is full' })
    }

    // Update signup
    await db('performer_signups')
      .where('id', signupId)
      .update({
        timeslot_id: timeslotId,
        updated_at: new Date()
      })

    res.json({ message: 'Signup moved successfully' })
  } catch (error) {
    console.error('Move signup error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/performer-signup/:signupId
// @desc    Remove a signup (host or performer)
// @access  Private (Event owner or signup owner)
router.delete('/:signupId', auth, async (req, res) => {
  try {
    const { signupId } = req.params
    const { userId, userEmail } = req.user || {}

    // Get signup details
    const signup = await db('performer_signups')
      .join('events', 'performer_signups.event_id', 'events.id')
      .where('performer_signups.id', signupId)
      .select('performer_signups.*', 'events.created_by as event_owner_id')
      .first()

    if (!signup) {
      return res.status(404).json({ message: 'Signup not found' })
    }

    // Check permissions: event owner or signup owner
    const isEventOwner = userId && signup.event_owner_id === userId
    const isSignupOwner = userEmail && signup.email === userEmail

    if (!isEventOwner && !isSignupOwner) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Delete signup
    await db('performer_signups')
      .where('id', signupId)
      .del()

    res.json({ message: 'Signup removed successfully' })
  } catch (error) {
    console.error('Remove signup error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/performer-signup/my-signups
// @desc    Get performer's own signups
// @access  Private (Performer)
router.get('/my-signups', auth, async (req, res) => {
  try {
    const { userEmail } = req.user || {}

    if (!userEmail) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    // Get performer's signups with event and timeslot details
    const signups = await db('performer_signups')
      .join('events', 'performer_signups.event_id', 'events.id')
      .join('timeslots', 'performer_signups.timeslot_id', 'timeslots.id')
      .join('venues', 'events.venue_id', 'venues.id')
      .where('performer_signups.email', userEmail)
      .select(
        'performer_signups.*',
        'events.title as event_title',
        'events.event_date',
        'events.start_time as event_start_time',
        'events.end_time as event_end_time',
        'timeslots.name as timeslot_name',
        'timeslots.start_time',
        'timeslots.end_time',
        'venues.name as venue_name',
        'venues.city',
        'venues.state'
      )
      .orderBy('events.event_date', 'asc')
      .orderBy('timeslots.start_time', 'asc')

    res.json(signups)
  } catch (error) {
    console.error('Get my signups error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
