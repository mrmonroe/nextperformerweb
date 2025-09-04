import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const eventService = {
  // Get all events with pagination and filters
  async getEvents(params = {}) {
    try {
      const response = await api.get('/events', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching events:', error)
      throw error
    }
  },

  // Get event by ID
  async getEventById(id) {
    try {
      const response = await api.get(`/events/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching event:', error)
      throw error
    }
  },

  // Create new event
  async createEvent(eventData) {
    try {
      const response = await api.post('/events', eventData)
      return response.data
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  },

  // Update event
  async updateEvent(id, eventData) {
    try {
      const response = await api.put(`/events/${id}`, eventData)
      return response.data
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    }
  },

  // Delete event
  async deleteEvent(id) {
    try {
      const response = await api.delete(`/events/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting event:', error)
      throw error
    }
  },

  // Search events
  async searchEvents(query, filters = {}) {
    try {
      const params = { search: query, ...filters }
      const response = await api.get('/events', { params })
      return response.data
    } catch (error) {
      console.error('Error searching events:', error)
      throw error
    }
  }
}

export default eventService
