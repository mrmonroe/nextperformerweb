import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MapPin, Users, Star } from 'lucide-react'
import { useConfig } from '../hooks/useConfig'
import { useAuth } from '../hooks/useAuth'
import { eventService } from '../services/eventService'
import CreateEventModal from '../components/modals/CreateEventModal'
import CreateVenueModal from '../components/modals/CreateVenueModal'
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal'
import { EventCard } from '../components/ui'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { config } = useConfig()
  const { user } = useAuth()
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [showCreateVenue, setShowCreateVenue] = useState(false)
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState(null)
  const [showEditEvent, setShowEditEvent] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadUserEvents()
  }, [user])

  const loadUserEvents = async () => {
    try {
      setEventsLoading(true)
      const data = await eventService.getEvents()
      const rawEvents = Array.isArray(data) ? data : data?.events || []
      
      // Transform events to match expected structure
      const transformedEvents = rawEvents.map(event => ({
        ...event,
        eventDate: event.event_date,
        startTime: event.start_time,
        endTime: event.end_time,
        isSponsored: event.is_spotlight,
        maxAttendees: event.max_attendees,
        imageUrl: event.image_url,
        venue: {
          id: event.venue_id,
          name: event.venue_name,
          address: event.venue_address,
          city: event.venue_city,
          state: event.venue_state,
          zip_code: event.venue_zip_code
        },
        creator: {
          name: event.created_by_name
        }
      }))

      // Filter events to only show those created by the user or that the user has signed up for
      // For now, we'll show events created by the user (we'll add signup filtering later)
      const userEvents = transformedEvents.filter(event => 
        event.created_by === user?.id
      )
      
      setEvents(userEvents)
    } catch (error) {
      console.error('Error loading user events:', error)
    } finally {
      setEventsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleViewDetails = (event) => {
    navigate(`/events/${event.id}`)
  }


  const handleEditEvent = (event) => {
    setEditingEvent(event)
    setShowEditEvent(true)
  }

  const closeEditEvent = () => {
    setShowEditEvent(false)
    setEditingEvent(null)
  }

  const handleEventUpdated = (updatedEvent) => {
    console.log('Event updated:', updatedEvent)
    loadUserEvents() // Refresh the events list
    closeEditEvent()
  }

  const handleDeleteEvent = (event) => {
    setEventToDelete(event)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!eventToDelete) return

    setIsDeleting(true)
    try {
      await eventService.deleteEvent(eventToDelete.id)
      console.log('Event deleted:', eventToDelete.id)
      loadUserEvents() // Refresh the events list
      setShowDeleteConfirm(false)
      setEventToDelete(null)
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setEventToDelete(null)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {config?.content?.copy?.dashboard?.title || 'Dashboard'}
          </h1>
          <p className="text-gray-600">
            {config?.content?.copy?.dashboard?.subtitle || 'Welcome back!'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => setShowCreateEvent(true)}
          className="btn-primary btn-lg flex items-center justify-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Event</span>
        </button>
        <button 
          onClick={() => setShowCreateVenue(true)}
          className="btn-outline btn-lg flex items-center justify-center space-x-2"
        >
          <MapPin className="h-5 w-5" />
          <span>Add Venue</span>
        </button>
        <button className="btn-outline btn-lg flex items-center justify-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Invite Friends</span>
        </button>
      </div>

      {/* My Sponsored Events */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="card-title">My Sponsored Events</h2>
          </div>
        </div>
        <div className="card-content">
          {eventsLoading ? (
            <div className="flex justify-center py-8">
              <div className="loading-spinner" />
            </div>
          ) : (
            <div className="space-y-4">
              {events?.filter(event => event.isSponsored).map(event => (
                <EventCard
                  key={event.id}
                  event={{
                    ...event,
                    event_date: event.eventDate,
                    is_spotlight: event.isSponsored,
                    venue: event.venue
                  }}
                  onViewDetails={() => handleViewDetails(event)}
                  onEdit={() => handleEditEvent(event)}
                  onDelete={() => handleDeleteEvent(event)}
                  showActions={true}
                  isOwner={true}
                  className="bg-yellow-50 border-yellow-200"
                />
              ))}
              {events?.filter(event => event.isSponsored).length === 0 && (
                <p className="text-gray-500 text-center py-4">You don't have any sponsored events yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* My Events */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">My Events</h2>
        </div>
        <div className="card-content">
          {eventsLoading ? (
            <div className="flex justify-center py-8">
              <div className="loading-spinner" />
            </div>
          ) : (
            <div className="space-y-4">
              {events?.map(event => (
                <EventCard
                  key={event.id}
                  event={{
                    ...event,
                    event_date: event.eventDate,
                    is_spotlight: event.isSponsored,
                    venue: event.venue
                  }}
                  onViewDetails={() => handleViewDetails(event)}
                  onEdit={() => handleEditEvent(event)}
                  onDelete={() => handleDeleteEvent(event)}
                  showActions={true}
                  isOwner={true}
                />
              ))}
              {events?.length === 0 && (
                <p className="text-gray-500 text-center py-4">No events yet. Create your first event!</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateEventModal
        isOpen={showCreateEvent}
        onClose={() => setShowCreateEvent(false)}
        onEventCreated={(event) => {
          console.log('Event created:', event)
          loadUserEvents() // Refresh the events list
        }}
      />
      
      <CreateVenueModal
        isOpen={showCreateVenue}
        onClose={() => setShowCreateVenue(false)}
        onVenueCreated={(venue) => {
          console.log('Venue created:', venue)
          // Venue creation doesn't affect events list, but we could refresh if needed
        }}
      />


      {/* Edit Event Modal */}
      <CreateEventModal
        isOpen={showEditEvent}
        onClose={closeEditEvent}
        onEventCreated={handleEventUpdated}
        editingEvent={editingEvent}
        isEditMode={true}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event?"
        itemName={eventToDelete?.title}
        confirmText="Delete Event"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  )
}
