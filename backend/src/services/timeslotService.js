const db = require('../config/database')

class TimeslotService {
  /**
   * Get all timeslots for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} Array of timeslots
   */
  async getTimeslotsByEventId(eventId) {
    try {
      const timeslots = await db('timeslots')
        .where('event_id', eventId)
        .orderBy('start_time', 'asc')
        .orderBy('sort_order', 'asc')
      
      return timeslots
    } catch (error) {
      console.error('Error getting timeslots:', error)
      throw new Error('Failed to get timeslots')
    }
  }

  /**
   * Get a single timeslot by ID
   * @param {string} timeslotId - Timeslot ID
   * @returns {Promise<Object>} Timeslot object
   */
  async getTimeslotById(timeslotId) {
    try {
      const timeslot = await db('timeslots')
        .where('id', timeslotId)
        .first()
      
      return timeslot
    } catch (error) {
      console.error('Error getting timeslot:', error)
      throw new Error('Failed to get timeslot')
    }
  }

  /**
   * Create a new timeslot
   * @param {Object} timeslotData - Timeslot data
   * @returns {Promise<Object>} Created timeslot
   */
  async createTimeslot(timeslotData) {
    try {
          const [timeslot] = await db('timeslots')
      .insert({
        event_id: timeslotData.eventId,
        name: timeslotData.name || `Slot ${Date.now()}`, // Auto-generate name if not provided
        start_time: timeslotData.startTime,
        end_time: timeslotData.endTime,
        duration_minutes: timeslotData.durationMinutes,
        max_performers: 1, // Default to 1 performer per slot
        is_available: timeslotData.isAvailable !== false,
        sort_order: timeslotData.sortOrder || 0
      })
      .returning('*')
      
      return timeslot
    } catch (error) {
      console.error('Error creating timeslot:', error)
      throw new Error('Failed to create timeslot')
    }
  }

  /**
   * Update a timeslot
   * @param {string} timeslotId - Timeslot ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated timeslot
   */
  async updateTimeslot(timeslotId, updateData) {
    try {
          const [timeslot] = await db('timeslots')
      .where('id', timeslotId)
      .update({
        name: updateData.name || `Slot ${Date.now()}`,
        start_time: updateData.startTime,
        end_time: updateData.endTime,
        duration_minutes: updateData.durationMinutes,
        max_performers: 1, // Keep default of 1 performer per slot
        is_available: updateData.isAvailable,
        sort_order: updateData.sortOrder,
        updated_at: new Date()
      })
      .returning('*')
      
      return timeslot
    } catch (error) {
      console.error('Error updating timeslot:', error)
      throw new Error('Failed to update timeslot')
    }
  }

  /**
   * Delete a timeslot
   * @param {string} timeslotId - Timeslot ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteTimeslot(timeslotId) {
    try {
      const deleted = await db('timeslots')
        .where('id', timeslotId)
        .del()
      
      return deleted > 0
    } catch (error) {
      console.error('Error deleting timeslot:', error)
      throw new Error('Failed to delete timeslot')
    }
  }

  /**
   * Generate timeslots automatically based on duration
   * @param {string} eventId - Event ID
   * @param {string} eventStartTime - Event start time
   * @param {string} eventEndTime - Event end time
   * @param {number} durationMinutes - Duration of each timeslot in minutes
   * @returns {Promise<Array>} Array of created timeslots
   */
  async generateTimeslots(eventId, eventStartTime, eventEndTime, durationMinutes) {
    try {
      // Parse times
      const startTime = new Date(`2000-01-01T${eventStartTime}`)
      const endTime = new Date(`2000-01-01T${eventEndTime}`)
      
      // Calculate total duration in minutes
      const totalDurationMs = endTime.getTime() - startTime.getTime()
      const totalDurationMinutes = Math.floor(totalDurationMs / (1000 * 60))
      
      // Calculate number of timeslots
      const numberOfSlots = Math.floor(totalDurationMinutes / durationMinutes)
      
      if (numberOfSlots <= 0) {
        throw new Error('Duration is too long for the event time range')
      }
      
      const timeslots = []
      
      for (let i = 0; i < numberOfSlots; i++) {
        const slotStartTime = new Date(startTime.getTime() + (i * durationMinutes * 60 * 1000))
        const slotEndTime = new Date(slotStartTime.getTime() + (durationMinutes * 60 * 1000))
        
        // Check if slot would exceed event end time
        if (slotEndTime > endTime) {
          break
        }
        
        const timeslotData = {
          eventId,
          name: `Slot ${i + 1}`,
          startTime: slotStartTime.toTimeString().slice(0, 8), // HH:MM:SS format
          endTime: slotEndTime.toTimeString().slice(0, 8),
          durationMinutes,
          isAvailable: true,
          sortOrder: i
        }
        
        const timeslot = await this.createTimeslot(timeslotData)
        timeslots.push(timeslot)
      }
      
      return timeslots
    } catch (error) {
      console.error('Error generating timeslots:', error)
      throw new Error('Failed to generate timeslots')
    }
  }

  /**
   * Get timeslots with performer signup counts
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} Array of timeslots with signup counts
   */
  async getTimeslotsWithSignupCounts(eventId) {
    try {
      const timeslots = await db('timeslots')
        .leftJoin('performer_signups', function() {
          this.on('timeslots.id', '=', 'performer_signups.timeslot_id')
        })
        .where('timeslots.event_id', eventId)
        .select(
          'timeslots.*',
          db.raw('COUNT(performer_signups.id) as current_signups')
        )
        .groupBy('timeslots.id')
        .orderBy('timeslots.start_time', 'asc')
        .orderBy('timeslots.sort_order', 'asc')
      
      return timeslots.map(timeslot => ({
        ...timeslot,
        current_signups: parseInt(timeslot.current_signups),
        spots_remaining: timeslot.max_performers - parseInt(timeslot.current_signups)
      }))
    } catch (error) {
      console.error('Error getting timeslots with signup counts:', error)
      throw new Error('Failed to get timeslots with signup counts')
    }
  }
}

module.exports = new TimeslotService()
