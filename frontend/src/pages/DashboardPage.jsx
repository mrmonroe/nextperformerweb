import { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Plus, Star, Eye } from 'lucide-react'
import { useConfig } from '../hooks/useConfig'
import { useAuth } from '../hooks/useAuth'
import { eventService } from '../services/eventService'
import CreateEventModal from '../components/modals/CreateEventModal'
import CreateVenueModal from '../components/modals/CreateVenueModal'
import UnauthenticatedEventModal from '../components/UnauthenticatedEventModal'

export default function DashboardPage() {
  const { config } = useConfig()
  const { user } = useAuth()
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [showCreateVenue, setShowCreateVenue] = useState(false)
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)

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
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const closeEventModal = () => {
    setShowEventModal(false)
    setSelectedEvent(null)
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
                <div key={event.id} className="relative p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  {/* Sponsored Star - Top Right Corner */}
                  <div className="absolute top-3 right-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  
                  {/* Event Content */}
                  <div className="pr-8">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.venue?.name}</p>
                    <p className="text-sm text-gray-500">{formatDate(event.eventDate)} at {formatTime(event.startTime)}</p>
                  </div>
                  
                  {/* View Details Button */}
                  <div className="mt-4">
                    <button
                      onClick={() => handleViewDetails(event)}
                      className="btn-outline btn-sm flex items-center space-x-1 px-3 py-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
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
                <div key={event.id} className="relative p-4 bg-gray-50 rounded-lg">
                  {/* Sponsored Star - Top Right Corner (only if sponsored) */}
                  {event.isSponsored && (
                    <div className="absolute top-3 right-3">
                      <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                  )}
                  
                  {/* Event Content */}
                  <div className="flex items-start space-x-4 pr-8">
                    <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.venue?.name}</p>
                      <p className="text-sm text-gray-500">{formatDate(event.eventDate)} at {formatTime(event.startTime)}</p>
                    </div>
                  </div>
                  
                  {/* View Details Button */}
                  <div className="mt-4">
                    <button
                      onClick={() => handleViewDetails(event)}
                      className="btn-outline btn-sm flex items-center space-x-1 px-3 py-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
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

      {/* Event Details Modal */}
      <UnauthenticatedEventModal
        event={selectedEvent}
        isOpen={showEventModal}
        onClose={closeEventModal}
      />
    </div>
  )
}
