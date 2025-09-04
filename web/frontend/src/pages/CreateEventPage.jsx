import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, Users, Image, Star, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useConfig } from '../hooks/useConfig'
import { eventService } from '../services/eventService'
import { venueService } from '../services/venueService'
import toast from 'react-hot-toast'
import CreateVenueModal from '../components/modals/CreateVenueModal'

const CreateEventPage = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { config } = useConfig()
  const [loading, setLoading] = useState(false)
  const [venues, setVenues] = useState([])
  const [showCreateVenue, setShowCreateVenue] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venueId: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    isSpotlight: false,
    maxAttendees: '',
    imageUrl: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    loadVenues()
  }, [isAuthenticated, navigate])

  const loadVenues = async () => {
    try {
      const venuesData = await venueService.getVenues()
      console.log('Venues data received:', venuesData)
      // Ensure venuesData is an array
      if (Array.isArray(venuesData)) {
        setVenues(venuesData)
      } else if (venuesData && Array.isArray(venuesData.venues)) {
        setVenues(venuesData.venues)
      } else {
        console.warn('Unexpected venues data format:', venuesData)
        setVenues([])
      }
    } catch (error) {
      console.error('Error loading venues:', error)
      toast.error('Failed to load venues')
      setVenues([]) // Ensure venues is always an array
    }
  }

  const validateEventForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Event title must be at least 3 characters'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Event description must be at least 10 characters'
    }
    
    if (!formData.venueId) {
      newErrors.venueId = 'Please select a venue'
    }
    
    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required'
    } else {
      const eventDate = new Date(formData.eventDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (eventDate < today) {
        newErrors.eventDate = 'Event date cannot be in the past'
      }
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required'
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required'
    }
    
    if (formData.startTime && formData.endTime) {
      const startTime = new Date(`2000-01-01T${formData.startTime}`)
      const endTime = new Date(`2000-01-01T${formData.endTime}`)
      if (startTime >= endTime) {
        newErrors.endTime = 'End time must be after start time'
      }
    }
    
    if (formData.maxAttendees && (isNaN(formData.maxAttendees) || parseInt(formData.maxAttendees) < 1)) {
      newErrors.maxAttendees = 'Max attendees must be a positive number'
    }
    
    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateEventForm()) {
      toast.error('Please fix the errors below')
      return
    }

    setLoading(true)
    try {
      const eventData = {
        ...formData,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null
      }
      
      const event = await eventService.createEvent(eventData)
      toast.success('Event created successfully!')
      navigate(`/events/${event.id}`)
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error(error.response?.data?.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateVenue = (venue) => {
    setVenues(prev => [...prev, venue])
    setFormData(prev => ({ ...prev, venueId: venue.id }))
    setShowCreateVenue(false)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {config?.content?.copy?.events?.createTitle || 'Create Event'}
              </h1>
              <button
                onClick={() => navigate('/events')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mt-1">
              {config?.content?.copy?.events?.createSubtitle || 'Create a new open mic event'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`input w-full ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`input w-full ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Describe your event..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Venue Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  name="venueId"
                  value={formData.venueId}
                  onChange={handleInputChange}
                  className={`input flex-1 ${errors.venueId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                >
                  <option value="">Select a venue</option>
                  {Array.isArray(venues) && venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name} - {venue.city}, {venue.state}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCreateVenue(true)}
                  className="btn-outline btn-sm flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  New Venue
                </button>
              </div>
              {errors.venueId && (
                <p className="mt-1 text-sm text-red-600">{errors.venueId}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  className={`input w-full ${errors.eventDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.eventDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.eventDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className={`input w-full ${errors.startTime ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className={`input w-full ${errors.endTime ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                )}
              </div>
            </div>

            {/* Additional Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Attendees <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="number"
                  name="maxAttendees"
                  value={formData.maxAttendees}
                  onChange={handleInputChange}
                  min="1"
                  className={`input w-full ${errors.maxAttendees ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Optional"
                />
                {errors.maxAttendees && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxAttendees}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className={`input w-full ${errors.imageUrl ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.imageUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>
                )}
              </div>
            </div>

            {/* Spotlight Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isSpotlight"
                checked={formData.isSpotlight}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                <Star className="h-4 w-4 inline mr-1" />
                Spotlight Event (featured on homepage)
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/events')}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    Create Event
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Create Venue Modal */}
        <CreateVenueModal
          isOpen={showCreateVenue}
          onClose={() => setShowCreateVenue(false)}
          onVenueCreated={handleCreateVenue}
        />
      </div>
    </div>
  )
}

export default CreateEventPage
