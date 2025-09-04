const express = require('express')
const Joi = require('joi')
const bcrypt = require('bcryptjs')
const db = require('../config/database')

const router = express.Router()

// Validation schema for performer signup
const performerSignupSchema = Joi.object({
  eventCode: Joi.string().length(6).required(),
  timeslotId: Joi.string().uuid().required(),
  performerName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(20).optional().allow(''),
  performanceType: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).max(500).optional().allow(''),
  socialMedia: Joi.string().max(200).optional().allow(''),
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

    const { eventCode, timeslotId, performerName, email, phone, performanceType, description, socialMedia, createAccount, password } = value

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
        description: description || null,
        social_media: socialMedia || null,
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

module.exports = router
