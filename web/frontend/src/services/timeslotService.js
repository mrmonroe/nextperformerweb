const API_BASE_URL = '/api'

class TimeslotService {
  async getTimeslotsByEventId(eventId) {
    try {
      const response = await fetch(`${API_BASE_URL}/timeslots/event/${eventId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch timeslots')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching timeslots:', error)
      throw error
    }
  }

  async getTimeslotById(timeslotId) {
    try {
      const response = await fetch(`${API_BASE_URL}/timeslots/${timeslotId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch timeslot')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching timeslot:', error)
      throw error
    }
  }

  async createTimeslot(timeslotData) {
    try {
      const response = await fetch(`${API_BASE_URL}/timeslots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(timeslotData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create timeslot')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating timeslot:', error)
      throw error
    }
  }

  async updateTimeslot(timeslotId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/timeslots/${timeslotId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update timeslot')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating timeslot:', error)
      throw error
    }
  }

  async deleteTimeslot(timeslotId) {
    try {
      const response = await fetch(`${API_BASE_URL}/timeslots/${timeslotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete timeslot')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error deleting timeslot:', error)
      throw error
    }
  }

  async generateTimeslots(eventId, durationMinutes) {
    try {
      const response = await fetch(`${API_BASE_URL}/timeslots/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          eventId,
          durationMinutes
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to generate timeslots')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error generating timeslots:', error)
      throw error
    }
  }

  async regenerateTimeslots(eventId, durationMinutes) {
    try {
      const response = await fetch(`${API_BASE_URL}/timeslots/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          eventId,
          durationMinutes
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to regenerate timeslots')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error regenerating timeslots:', error)
      throw error
    }
  }
}

export const timeslotService = new TimeslotService()
