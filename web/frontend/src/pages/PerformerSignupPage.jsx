import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function PerformerSignupPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    timeslotId: '',
    performerName: '',
    email: '',
    phone: '',
    performanceType: '',
    createAccount: false,
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [showVenueTooltip, setShowVenueTooltip] = useState(false)

  useEffect(() => {
    if (code) {
      loadEvent()
    }
  }, [code])

  const loadEvent = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/performer-signup/event/${code}`)
      const data = await response.json()
      
      if (response.ok) {
        setEvent(data)
      } else {
        toast.error(data.message || 'Event not found')
        navigate('/events')
      }
    } catch (error) {
      console.error('Error loading event:', error)
      toast.error('Failed to load event details')
      navigate('/events')
    } finally {
      setLoading(false)
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

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.timeslotId) {
      newErrors.timeslotId = 'Please select a timeslot'
    }
    
    if (!formData.performerName.trim()) {
      newErrors.performerName = 'Performer name is required'
    } else if (formData.performerName.trim().length < 2) {
      newErrors.performerName = 'Performer name must be at least 2 characters'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.performanceType.trim()) {
      newErrors.performanceType = 'Performance type is required'
    } else if (formData.performanceType.trim().length < 2) {
      newErrors.performanceType = 'Performance type must be at least 2 characters'
    }
    
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits'
    }
    
    if (formData.createAccount) {
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required when creating an account'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors below')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/performer-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventCode: code,
          timeslotId: formData.timeslotId,
          performerName: formData.performerName,
          email: formData.email,
          phone: formData.phone,
          performanceType: formData.performanceType,
          createAccount: formData.createAccount,
          password: formData.createAccount ? formData.password : undefined
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        if (data.accountCreated) {
          toast.success('Account created and successfully signed up for the event!')
        } else {
          toast.success('Successfully signed up for the event!')
        }
        // Reload event data to update counts
        await loadEvent()
        // Reset form
        setFormData({
          timeslotId: '',
          performerName: '',
          email: '',
          phone: '',
          performanceType: '',
          createAccount: false,
          password: ''
        })
        setErrors({})
      } else {
        toast.error(data.message || 'Failed to sign up for event')
      }
    } catch (error) {
      console.error('Error signing up:', error)
      toast.error('Failed to sign up for event')
    } finally {
      setSubmitting(false)
    }
  }


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or is no longer available.</p>
          <button
            onClick={() => navigate('/events')}
            className="btn-primary"
          >
            Browse Events
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performer Sign-Up</h1>
          <p className="text-gray-600">Join this amazing event and showcase your talent!</p>
        </div>

        <div className="space-y-6">
          {/* Event Details - Ultra Compact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between">
              {/* Left side - Event info */}
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                {/* Event Image - Small */}
                {event.image_url && (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {/* Event Info - Ultra Compact */}
                <div className="flex-1 min-w-0">
                  {/* Title and Date/Time on same line */}
                  <div className="flex items-center space-x-3 mb-1">
                    <h2 className="text-lg font-semibold text-gray-900 truncate">{event.title}</h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{formatDate(event.event_date)}</span>
                      <Clock className="h-3 w-3 flex-shrink-0 ml-2" />
                      <span className="truncate">{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                    </div>
                  </div>
                  
                  {/* Venue name directly under title with hover tooltip */}
                  <div className="flex items-center space-x-1 mb-1 relative">
                    <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span 
                      className="text-sm font-medium text-gray-700 truncate cursor-pointer hover:text-blue-600"
                      onMouseEnter={() => setShowVenueTooltip(true)}
                      onMouseLeave={() => setShowVenueTooltip(false)}
                    >
                      {event.venue_name}
                    </span>
                    
                    {/* Venue address tooltip */}
                    {showVenueTooltip && (
                      <div className="absolute top-6 left-0 z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-xs">
                        <div className="font-medium mb-1">{event.venue_name}</div>
                        <div className="text-gray-300">
                          {event.venue_address}
                        </div>
                        <div className="text-gray-400">
                          {event.venue_city}, {event.venue_state} {event.venue_zip_code}
                        </div>
                        {/* Arrow pointing up */}
                        <div className="absolute -top-1 left-3 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                      </div>
                    )}
                  </div>

                  {/* Description - Truncated */}
                  {event.description && (
                    <div className="mt-1">
                      <p className="text-gray-600 text-xs overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical'
                      }}>{event.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Spots remaining */}
              {event.max_attendees && (
                <div className="flex items-center space-x-1 text-xs text-gray-600 ml-4 flex-shrink-0">
                  <Users className="h-3 w-3" />
                  <span>
                    {event.current_signups} / {event.max_attendees}
                    {event.spots_remaining !== null && (
                      <span className="text-green-600 font-medium">
                        {' '}({event.spots_remaining} left)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sign-up Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign Up Form</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Timeslot Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Timeslot <span className="text-red-500">*</span>
                </label>
                <select
                  name="timeslotId"
                  value={formData.timeslotId}
                  onChange={handleInputChange}
                  className={`input w-full ${errors.timeslotId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  required
                >
                  <option value="">Choose a timeslot...</option>
                  {event.timeslots?.filter(timeslot => timeslot.spots_remaining > 0).map((timeslot) => (
                    <option 
                      key={timeslot.id} 
                      value={timeslot.id}
                    >
                      {formatTime(timeslot.start_time)} - {formatTime(timeslot.end_time)}
                    </option>
                  ))}
                </select>
                {errors.timeslotId && (
                  <p className="mt-1 text-sm text-red-600">{errors.timeslotId}</p>
                )}
                {event.timeslots?.filter(timeslot => timeslot.spots_remaining > 0).length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">No open timeslots available for this event</p>
                )}
              </div>

              {/* Performer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Performer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="performerName"
                  value={formData.performerName}
                  onChange={handleInputChange}
                  className={`input w-full ${errors.performerName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your stage name or real name"
                />
                {errors.performerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.performerName}</p>
                )}
              </div>

              {/* Performance Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Performance Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="performanceType"
                  value={formData.performanceType}
                  onChange={handleInputChange}
                  className={`input w-full ${errors.performanceType ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  required
                >
                  <option value="">Select your performance type...</option>
                  <option value="Singer">Singer</option>
                  <option value="Musician">Musician</option>
                  <option value="Comedian">Comedian</option>
                  <option value="Poet">Poet</option>
                  <option value="Dancer">Dancer</option>
                  <option value="Actor">Actor</option>
                  <option value="Magician">Magician</option>
                  <option value="Stand-up Comedian">Stand-up Comedian</option>
                  <option value="Rapper">Rapper</option>
                  <option value="Instrumentalist">Instrumentalist</option>
                  <option value="Spoken Word">Spoken Word</option>
                  <option value="Storyteller">Storyteller</option>
                  <option value="Other">Other</option>
                </select>
                {errors.performanceType && (
                  <p className="mt-1 text-sm text-red-600">{errors.performanceType}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input w-full ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`input w-full ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>


              {/* Account Creation */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    name="createAccount"
                    checked={formData.createAccount}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm font-medium text-gray-700">
                    Create an account to manage your signups
                  </label>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Creating an account allows you to view and manage your event signups, get notifications, and more.
                </p>
                
                {formData.createAccount && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`input w-full ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Enter a password (min 6 characters)"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 text-lg font-medium disabled:opacity-50"
              >
                {submitting ? 'Signing Up...' : 'Sign Up for Event'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
