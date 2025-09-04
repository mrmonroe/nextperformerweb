const API_BASE_URL = '/api'

class SignupService {
  async getEventSignups(eventId) {
    try {
      const response = await fetch(`${API_BASE_URL}/performer-signup/event/${eventId}/signups`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch signups')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching event signups:', error)
      throw error
    }
  }

  async moveSignup(signupId, timeslotId) {
    try {
      const response = await fetch(`${API_BASE_URL}/performer-signup/${signupId}/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ timeslotId })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to move signup')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error moving signup:', error)
      throw error
    }
  }

  async removeSignup(signupId) {
    try {
      const response = await fetch(`${API_BASE_URL}/performer-signup/${signupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to remove signup')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error removing signup:', error)
      throw error
    }
  }

  async getMySignups() {
    try {
      const response = await fetch(`${API_BASE_URL}/performer-signup/my-signups`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch my signups')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching my signups:', error)
      throw error
    }
  }
}

export const signupService = new SignupService()
