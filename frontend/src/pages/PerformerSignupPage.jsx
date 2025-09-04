import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, QrCode, Copy, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function PerformerSignupPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    timeslotId: '',
    performerName: '',
    email: '',
    phone: '',
    performanceType: '',
    description: '',
    socialMedia: '',
    createAccount: false,
    password: ''
  })
  const [errors, setErrors] = useState({})

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
    
    if (formData.description && formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
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
          description: formData.description,
          socialMedia: formData.socialMedia,
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
        navigate('/events')
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

  const copyEventCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Event code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying code:', error)
      toast.error('Failed to copy event code')
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{event.title}</h2>
              
              {/* Event Image */}
              {event.image_url && (
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Event Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">{formatDate(event.event_date)}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-600">
                  <Clock className="h-5 w-5" />
                  <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                </div>
                
                <div className="flex items-start space-x-3 text-gray-600">
                  <MapPin className="h-5 w-5 mt-0.5" />
                  <div>
                    <div className="font-medium">{event.venue_name}</div>
                    <div className="text-sm">
                      {event.venue_address}, {event.venue_city}, {event.venue_state}
                    </div>
                  </div>
                </div>

                {event.max_attendees && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Users className="h-5 w-5" />
                    <span>
                      {event.current_signups} / {event.max_attendees} performers
                      {event.spots_remaining !== null && (
                        <span className="text-green-600 font-medium">
                          {' '}({event.spots_remaining} spots remaining)
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Event Code */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Event Code</h3>
                    <p className="text-2xl font-mono font-bold text-blue-600">{event.event_code}</p>
                  </div>
                  <button
                    onClick={copyEventCode}
                    className="btn-outline btn-sm flex items-center space-x-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {event.qr_code_data && (
                <div className="mt-4 text-center">
                  <h3 className="font-medium text-gray-900 mb-2">QR Code</h3>
                  <div className="inline-block p-4 bg-white rounded-lg border border-gray-200">
                    <img
                      src={event.qr_code_data}
                      alt="Event QR Code"
                      className="w-32 h-32"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Scan to share this event</p>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{event.description}</p>
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
                  {event.timeslots?.map((timeslot) => (
                    <option 
                      key={timeslot.id} 
                      value={timeslot.id}
                      disabled={timeslot.spots_remaining <= 0}
                    >
                      {timeslot.name} - {formatTime(timeslot.start_time)} to {formatTime(timeslot.end_time)}
                      {timeslot.spots_remaining <= 0 ? ' (Full)' : ` (${timeslot.spots_remaining} spots left)`}
                    </option>
                  ))}
                </select>
                {errors.timeslotId && (
                  <p className="mt-1 text-sm text-red-600">{errors.timeslotId}</p>
                )}
                {event.timeslots?.length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">No timeslots available for this event</p>
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

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Performance Description <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`input w-full ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Tell us about your performance style, what you'll be performing, etc."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Social Media */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Media <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="socialMedia"
                  value={formData.socialMedia}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Instagram, Twitter, YouTube, etc."
                />
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
