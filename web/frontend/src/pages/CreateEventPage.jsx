import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Calendar, Clock, MapPin, Users, Image, Star, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useConfig } from '../hooks/useConfig'
import { eventService } from '../services/eventService'
import { venueService } from '../services/venueService'
import { FormField } from '../components/ui'
import toast from 'react-hot-toast'
import CreateVenueModal from '../components/modals/CreateVenueModal'

const CreateEventPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const { config } = useConfig()
  const [loading, setLoading] = useState(false)
  const [venues, setVenues] = useState([])
  const [showCreateVenue, setShowCreateVenue] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [event, setEvent] = useState(null)

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

  // Load event data for editing
  useEffect(() => {
    if (id) {
      setIsEditMode(true)
      loadEvent()
    }
  }, [id])

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

  const loadEvent = async () => {
    try {
      setLoading(true)
      const eventData = await eventService.getEventById(id)
      setEvent(eventData)
      
      // Populate form with event data
      setFormData({
        title: eventData.title || '',
        description: eventData.description || '',
        venueId: eventData.venue_id || '',
        eventDate: eventData.event_date ? eventData.event_date.split('T')[0] : '',
        startTime: eventData.start_time || '',
        endTime: eventData.end_time || '',
        isSpotlight: eventData.is_spotlight || false,
        maxAttendees: eventData.max_attendees || '',
        imageUrl: eventData.image_url || ''
      })
    } catch (error) {
      console.error('Error loading event:', error)
      toast.error('Failed to load event')
      navigate('/dashboard')
    } finally {
      setLoading(false)
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
      
      let event
      if (isEditMode) {
        event = await eventService.updateEvent(id, eventData)
        toast.success('Event updated successfully!')
      } else {
        event = await eventService.createEvent(eventData)
        toast.success('Event created successfully!')
      }
      navigate(`/events/${event.id}`)
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} event:`, error)
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} event`)
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
                {isEditMode 
                  ? 'Edit Event' 
                  : (config?.content?.copy?.events?.createTitle || 'Create Event')
                }
              </h1>
              <button
                onClick={() => navigate('/events')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mt-1">
              {isEditMode 
                ? 'Update your event details'
                : (config?.content?.copy?.events?.createSubtitle || 'Create a new open mic event')
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Event Title */}
            <FormField
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter event title"
              required
              error={errors.title}
            />

            {/* Description */}
            <FormField
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your event..."
              rows={4}
              required
              error={errors.description}
            />

            {/* Venue Selection */}
            <div>
              <FormField
                label="Venue"
                name="venueId"
                type="select"
                value={formData.venueId}
                onChange={handleInputChange}
                placeholder="Select a venue"
                required
                error={errors.venueId}
              >
                {Array.isArray(venues) && venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} - {venue.city}, {venue.state}
                  </option>
                ))}
              </FormField>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateVenue(true)}
                  className="btn-outline btn-sm flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  New Venue
                </button>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Event Date"
                name="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={handleInputChange}
                required
                error={errors.eventDate}
              />
              <FormField
                label="Start Time"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleInputChange}
                required
                error={errors.startTime}
              />
              <FormField
                label="End Time"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleInputChange}
                required
                error={errors.endTime}
              />
            </div>

            {/* Additional Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Max Attendees"
                name="maxAttendees"
                type="number"
                value={formData.maxAttendees}
                onChange={handleInputChange}
                placeholder="Optional"
                min="1"
                error={errors.maxAttendees}
                helpText="(Optional)"
              />
              <FormField
                label="Image URL"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                error={errors.imageUrl}
                helpText="(Optional)"
              />
            </div>

            {/* Spotlight Option */}
            <FormField
              label="Spotlight Event (featured on homepage)"
              name="isSpotlight"
              type="checkbox"
              value={formData.isSpotlight}
              onChange={handleInputChange}
            />

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
