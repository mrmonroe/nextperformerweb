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

export const venueService = {
  // Get all venues
  async getVenues() {
    try {
      const response = await api.get('/venues')
      return response.data
    } catch (error) {
      console.error('Error fetching venues:', error)
      throw error
    }
  },

  // Get venue by ID
  async getVenueById(id) {
    try {
      const response = await api.get(`/venues/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching venue:', error)
      throw error
    }
  },

  // Create new venue
  async createVenue(venueData) {
    try {
      const response = await api.post('/venues', venueData)
      return response.data
    } catch (error) {
      console.error('Error creating venue:', error)
      throw error
    }
  },

  // Update venue
  async updateVenue(id, venueData) {
    try {
      const response = await api.put(`/venues/${id}`, venueData)
      return response.data
    } catch (error) {
      console.error('Error updating venue:', error)
      throw error
    }
  },

  // Delete venue
  async deleteVenue(id) {
    try {
      const response = await api.delete(`/venues/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting venue:', error)
      throw error
    }
  }
}

export default venueService
