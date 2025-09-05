import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, Star, ArrowLeft, Edit, Trash2, QrCode, Copy, Check, Settings, UserCheck, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useConfig } from '../hooks/useConfig'
import { eventService } from '../services/eventService'
import ConfigLoadingPlaceholder from '../components/ConfigLoadingPlaceholder'
import TimeslotManagementModal from '../components/modals/TimeslotManagementModal'
import SignupManagementModal from '../components/modals/SignupManagementModal'
import { DropdownMenu, DropdownItem, ModalWrapper, FormField } from '../components/ui'
import toast from 'react-hot-toast'

export default function EventDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { config, configLoading } = useConfig()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showTimeslotManagement, setShowTimeslotManagement] = useState(false)
  const [showSignupManagement, setShowSignupManagement] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    if (id) {
      loadEvent()
    }
  }, [id])


  const loadEvent = async () => {
    try {
      setLoading(true)
      const eventData = await eventService.getEventById(id)
      setEvent(eventData)
    } catch (error) {
      console.error('Error loading event:', error)
      toast.error('Failed to load event')
      navigate('/events')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      await eventService.deleteEvent(id)
      toast.success('Event deleted successfully')
      navigate('/events')
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditLoading(true)

    try {
      const updatedEvent = await eventService.updateEvent(id, editFormData)
      setEvent(updatedEvent)
      setShowEditForm(false)
      toast.success('Event updated successfully!')
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error(error.response?.data?.message || 'Failed to update event')
    } finally {
      setEditLoading(false)
    }
  }

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const openEditForm = () => {
    setEditFormData({
      title: event.title || '',
      description: event.description || '',
      event_date: event.event_date || '',
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      max_attendees: event.max_attendees || '',
      is_spotlight: event.is_spotlight || false
    })
    setShowEditForm(true)
  }

  const copyEventCode = async () => {
    if (!event?.event_code) return
    
    try {
      await navigator.clipboard.writeText(event.event_code)
      setCopied(true)
      toast.success('Event code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying code:', error)
      toast.error('Failed to copy event code')
    }
  }

  const copySignupLink = async () => {
    if (!event?.event_code) return
    
    const signupUrl = `${window.location.origin}/signup/${event.event_code}`
    try {
      await navigator.clipboard.writeText(signupUrl)
      toast.success('Signup link copied to clipboard!')
    } catch (error) {
      console.error('Error copying link:', error)
      toast.error('Failed to copy signup link')
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

  if (configLoading) {
    return <ConfigLoadingPlaceholder type="page" />
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading event...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Event Not Found
            </h1>
            <p className="text-gray-600 mb-4">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/events')}
              className="btn-primary"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isOwner = isAuthenticated && user && event.created_by === user.id

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/events')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </button>

        <div className="card">
          <div className="card-content">
            {/* Event Image */}
            {event.image_url && (
              <div className="aspect-video bg-gray-200 rounded-lg mb-6 overflow-hidden">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Event Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {event.title}
                  </h1>
                  {event.is_spotlight && (
                    <Star className="h-6 w-6 text-yellow-500" />
                  )}
                </div>
                <p className="text-gray-600 text-lg">
                  {event.description}
                </p>
              </div>

              {/* Owner Actions */}
              {isOwner && (
                <div className="ml-4">
                  <DropdownMenu>
                    <DropdownItem 
                      onClick={() => setShowTimeslotManagement(true)} 
                      icon={Settings}
                    >
                      Manage Timeslots
                    </DropdownItem>
                    <DropdownItem 
                      onClick={() => setShowSignupManagement(true)} 
                      icon={UserCheck}
                    >
                      Manage Signups
                    </DropdownItem>
                    <DropdownItem 
                      onClick={openEditForm} 
                      icon={Edit}
                    >
                      Edit Event
                    </DropdownItem>
                    <DropdownItem 
                      onClick={handleDeleteEvent} 
                      icon={Trash2}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      Delete Event
                    </DropdownItem>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Date and Time */}
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <p className="font-medium">{formatDate(event.event_date)}</p>
                    <p className="text-sm text-gray-500">
                      {formatTime(event.start_time)} - {formatTime(event.end_time)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <p className="font-medium">{event.venue_name}</p>
                    <p className="text-sm text-gray-500">
                      {event.venue_address}, {event.venue_city}, {event.venue_state}
                    </p>
                    {event.venue_phone && (
                      <p className="text-sm text-gray-500">{event.venue_phone}</p>
                    )}
                    {event.venue_website && (
                      <a
                        href={event.venue_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>

                {event.max_attendees && (
                  <div className="flex items-center text-gray-700">
                    <Users className="h-5 w-5 mr-3 text-gray-500" />
                    <div>
                      <p className="font-medium">Max Attendees</p>
                      <p className="text-sm text-gray-500">{event.max_attendees} people</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="space-y-4">
                {event.created_by_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Created by</p>
                    <p className="text-gray-600">{event.created_by_name}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700">Event ID</p>
                  <p className="text-gray-600 font-mono text-sm">{event.id}</p>
                </div>
              </div>
            </div>

            {/* Event Code and QR Code - Only for event owners */}
            {isOwner && event.event_code && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performer Sign-Up</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Event Code */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Event Code</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-mono font-bold text-blue-600">{event.event_code}</p>
                      <button
                        onClick={copyEventCode}
                        className="btn-outline btn-sm flex items-center space-x-2"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Share this code with performers to sign up
                    </p>
                  </div>

                  {/* QR Code */}
                  {event.qr_code_data && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">QR Code</h4>
                      <div className="text-center">
                        <div className="inline-block p-2 bg-white rounded-lg border border-gray-200">
                          <img
                            src={event.qr_code_data}
                            alt="Event QR Code"
                            className="w-24 h-24"
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Scan to share signup link
                        </p>
                        <button
                          onClick={copySignupLink}
                          className="btn-outline btn-sm mt-2 text-xs"
                        >
                          Copy Signup Link
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex gap-3">
                {event.event_code ? (
                  <a
                    href={`/signup/${event.event_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    View Signup Page
                  </a>
                ) : (
                  <button className="btn-primary" disabled>
                    Sign Up for Event
                  </button>
                )}
                <button className="btn-outline">
                  Share Event
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Timeslot Management Modal */}
        <TimeslotManagementModal
          isOpen={showTimeslotManagement}
          onClose={() => setShowTimeslotManagement(false)}
          event={event}
          onTimeslotsUpdated={() => {
            // Optionally reload event data if needed
          }}
        />

        {/* Signup Management Modal */}
        <SignupManagementModal
          isOpen={showSignupManagement}
          onClose={() => setShowSignupManagement(false)}
          event={event}
          onSignupsUpdated={() => {
            // Optionally reload event data if needed
          }}
        />

        {/* Edit Event Modal */}
        <ModalWrapper
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          title="Edit Event"
          size="lg"
        >
          <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
            <FormField
              label="Event Title"
              name="title"
              value={editFormData.title || ''}
              onChange={handleEditInputChange}
              required
            />

            <FormField
              label="Description"
              name="description"
              type="textarea"
              value={editFormData.description || ''}
              onChange={handleEditInputChange}
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Event Date"
                name="event_date"
                type="date"
                value={editFormData.event_date || ''}
                onChange={handleEditInputChange}
                required
              />

              <FormField
                label="Max Attendees"
                name="max_attendees"
                type="number"
                value={editFormData.max_attendees || ''}
                onChange={handleEditInputChange}
                min="1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Start Time"
                name="start_time"
                type="time"
                value={editFormData.start_time || ''}
                onChange={handleEditInputChange}
                required
              />

              <FormField
                label="End Time"
                name="end_time"
                type="time"
                value={editFormData.end_time || ''}
                onChange={handleEditInputChange}
                required
              />
            </div>

            <FormField
              label="Spotlight Event"
              name="is_spotlight"
              type="checkbox"
              value={editFormData.is_spotlight || false}
              onChange={handleEditInputChange}
            />

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={editLoading}
                className="btn-primary flex-1"
              >
                {editLoading ? 'Updating...' : 'Update Event'}
              </button>
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </ModalWrapper>
      </div>
    </div>
  )
}
