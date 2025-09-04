const express = require('express')
const Joi = require('joi')
const timeslotService = require('../services/timeslotService')
const { auth } = require('../middleware/auth')

const router = express.Router()

// Validation schemas
const timeslotSchema = Joi.object({
  name: Joi.string().max(100).optional().allow(''),
  startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  durationMinutes: Joi.number().integer().min(1).max(480).required(), // Max 8 hours
  isAvailable: Joi.boolean().default(true),
  sortOrder: Joi.number().integer().min(0).default(0)
})

const generateTimeslotsSchema = Joi.object({
  eventId: Joi.string().uuid().required(),
  durationMinutes: Joi.number().integer().min(5).max(480).required() // Min 5 minutes, max 8 hours
})

// @route   GET /api/timeslots/event/:eventId
// @desc    Get all timeslots for an event
// @access  Public
router.get('/event/:eventId', async (req, res) => {
  try {
    const timeslots = await timeslotService.getTimeslotsWithSignupCounts(req.params.eventId)
    res.json(timeslots)
  } catch (error) {
    console.error('Get timeslots error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/timeslots/:id
// @desc    Get a single timeslot
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const timeslot = await timeslotService.getTimeslotById(req.params.id)
    
    if (!timeslot) {
      return res.status(404).json({ message: 'Timeslot not found' })
    }
    
    res.json(timeslot)
  } catch (error) {
    console.error('Get timeslot error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/timeslots
// @desc    Create a new timeslot
// @access  Private (Event owner only)
router.post('/', auth, async (req, res) => {
  try {
    const { error, value } = timeslotSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const { eventId, ...timeslotData } = value

    // Verify event exists and user owns it
    const db = require('../config/database')
    const event = await db('events')
      .where('id', eventId)
      .where('created_by', req.user.userId)
      .first()

    if (!event) {
      return res.status(404).json({ message: 'Event not found or access denied' })
    }

    // Validate times are within event time range
    const eventStart = new Date(`2000-01-01T${event.start_time}`)
    const eventEnd = new Date(`2000-01-01T${event.end_time}`)
    const slotStart = new Date(`2000-01-01T${timeslotData.startTime}`)
    const slotEnd = new Date(`2000-01-01T${timeslotData.endTime}`)

    if (slotStart < eventStart || slotEnd > eventEnd) {
      return res.status(400).json({ 
        message: 'Timeslot must be within event time range' 
      })
    }

    if (slotStart >= slotEnd) {
      return res.status(400).json({ 
        message: 'Start time must be before end time' 
      })
    }

    const timeslot = await timeslotService.createTimeslot({
      eventId,
      ...timeslotData
    })

    res.status(201).json(timeslot)
  } catch (error) {
    console.error('Create timeslot error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/timeslots/generate
// @desc    Generate timeslots automatically
// @access  Private (Event owner only)
router.post('/generate', auth, async (req, res) => {
  try {
    const { error, value } = generateTimeslotsSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const { eventId, durationMinutes } = value

    // Verify event exists and user owns it
    const db = require('../config/database')
    const event = await db('events')
      .where('id', eventId)
      .where('created_by', req.user.userId)
      .first()

    if (!event) {
      return res.status(404).json({ message: 'Event not found or access denied' })
    }

    // Check if timeslots already exist
    const existingTimeslots = await timeslotService.getTimeslotsByEventId(eventId)
    if (existingTimeslots.length > 0) {
      return res.status(400).json({ 
        message: 'Timeslots already exist for this event. Delete existing timeslots first.' 
      })
    }

    const timeslots = await timeslotService.generateTimeslots(
      eventId,
      event.start_time,
      event.end_time,
      durationMinutes
    )

    res.status(201).json({
      message: `Generated ${timeslots.length} timeslots`,
      timeslots
    })
  } catch (error) {
    console.error('Generate timeslots error:', error)
    res.status(500).json({ message: error.message || 'Server error' })
  }
})

// @route   PUT /api/timeslots/:id
// @desc    Update a timeslot
// @access  Private (Event owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { error, value } = timeslotSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    // Verify timeslot exists and user owns the event
    const db = require('../config/database')
    const timeslot = await db('timeslots')
      .join('events', 'timeslots.event_id', 'events.id')
      .where('timeslots.id', req.params.id)
      .where('events.created_by', req.user.userId)
      .select('timeslots.*', 'events.start_time as event_start', 'events.end_time as event_end')
      .first()

    if (!timeslot) {
      return res.status(404).json({ message: 'Timeslot not found or access denied' })
    }

    // Validate times are within event time range
    const eventStart = new Date(`2000-01-01T${timeslot.event_start}`)
    const eventEnd = new Date(`2000-01-01T${timeslot.event_end}`)
    const slotStart = new Date(`2000-01-01T${value.startTime}`)
    const slotEnd = new Date(`2000-01-01T${value.endTime}`)

    if (slotStart < eventStart || slotEnd > eventEnd) {
      return res.status(400).json({ 
        message: 'Timeslot must be within event time range' 
      })
    }

    if (slotStart >= slotEnd) {
      return res.status(400).json({ 
        message: 'Start time must be before end time' 
      })
    }

    const updatedTimeslot = await timeslotService.updateTimeslot(req.params.id, value)
    res.json(updatedTimeslot)
  } catch (error) {
    console.error('Update timeslot error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/timeslots/:id
// @desc    Delete a timeslot
// @access  Private (Event owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Verify timeslot exists and user owns the event
    const db = require('../config/database')
    const timeslot = await db('timeslots')
      .join('events', 'timeslots.event_id', 'events.id')
      .where('timeslots.id', req.params.id)
      .where('events.created_by', req.user.userId)
      .first()

    if (!timeslot) {
      return res.status(404).json({ message: 'Timeslot not found or access denied' })
    }

    const deleted = await timeslotService.deleteTimeslot(req.params.id)
    
    if (deleted) {
      res.json({ message: 'Timeslot deleted successfully' })
    } else {
      res.status(500).json({ message: 'Failed to delete timeslot' })
    }
  } catch (error) {
    console.error('Delete timeslot error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
