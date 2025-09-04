import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, Users, Star, Search, Filter } from 'lucide-react'
import { useConfig } from '../hooks/useConfig'
import { useAuth } from '../hooks/useAuth'
import { eventService } from '../services/eventService'
import ConfigLoadingPlaceholder from '../components/ConfigLoadingPlaceholder'
import PublicNavbar from '../components/PublicNavbar'
import UnauthenticatedEventModal from '../components/UnauthenticatedEventModal'
import toast from 'react-hot-toast'

export default function PublicEventsPage() {
  const navigate = useNavigate()
  const { config, isLoading: configLoading } = useConfig()
  const { isAuthenticated } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSponsoredOnly, setShowSponsoredOnly] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
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
      
      console.log('Loaded events:', transformedEvents)
      setEvents(transformedEvents)
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue?.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSponsored = showSponsoredOnly ? event.isSponsored : true
    
    return matchesSearch && matchesSponsored
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const isUpcoming = (eventDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const event = new Date(eventDate)
    return event >= today
  }

  const handleViewDetails = (event) => {
    if (isAuthenticated) {
      // Authenticated users can navigate to the full event details page
      navigate(`/events/${event.id}`)
    } else {
      // Unauthenticated users see a modal with sign up and share options
      setSelectedEvent(event)
      setShowModal(true)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedEvent(null)
  }

  // Separate spotlight and regular upcoming events
  const upcomingEvents = filteredEvents.filter(event => isUpcoming(event.eventDate))
  const pastEvents = filteredEvents.filter(event => !isUpcoming(event.eventDate))
  
  // Sort upcoming events by date (soonest first)
  const sortedUpcomingEvents = upcomingEvents.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
  
  // Separate sponsored events and regular events
  const sponsoredEvents = sortedUpcomingEvents.filter(event => event.isSponsored)
  const regularUpcomingEvents = sortedUpcomingEvents.filter(event => !event.isSponsored)
  
  // Combine: sponsored events first, then regular events
  const displayEvents = [...sponsoredEvents, ...regularUpcomingEvents]
  
  console.log('All events:', events)
  console.log('Filtered events:', filteredEvents)
  console.log('Sponsored events:', sponsoredEvents)
  console.log('Regular upcoming events:', regularUpcomingEvents)
  console.log('Display events:', displayEvents)
  console.log('Past events:', pastEvents)

  if (configLoading) {
    return <ConfigLoadingPlaceholder type="page" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <PublicNavbar />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {config?.content?.copy?.events?.publicTitle || 'Open Mic Events'}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {config?.content?.copy?.events?.publicSubtitle || 'Discover upcoming open mic events in your area'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events, venues, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full pl-10"
              />
            </div>
            <button
              onClick={() => setShowSponsoredOnly(!showSponsoredOnly)}
              className={`btn-outline btn-lg flex items-center justify-center space-x-2 px-6 py-3 min-h-[48px] font-medium ${
                showSponsoredOnly ? 'bg-yellow-50 border-yellow-300 text-yellow-800' : ''
              }`}
            >
              <Star className="h-5 w-5" />
              <span>{showSponsoredOnly ? 'Show All' : 'Sponsored Only'}</span>
            </button>
          </div>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loading-spinner" />
          </div>
        ) : displayEvents.length > 0 ? (
          <div className="space-y-6">
            {/* Events List */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Upcoming Events ({displayEvents.length})
              </h2>
              <div className="space-y-4">
                {displayEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {event.title}
                          </h3>
                          {event.isSponsored && (
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full">
                                Sponsored
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.eventDate)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                          </div>
                          
                          {event.venue && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{event.venue.name}, {event.venue.city}</span>
                            </div>
                          )}
                          
                          {event.maxAttendees && (
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>Max {event.maxAttendees} attendees</span>
                            </div>
                          )}
                        </div>

                      </div>

                      <div className="flex-shrink-0 sm:ml-6">
                        <button 
                          onClick={() => handleViewDetails(event)}
                          className="btn-outline btn-sm sm:btn-lg px-3 py-2 sm:px-6 sm:py-3 min-h-[36px] sm:min-h-[48px] font-medium w-full sm:w-auto"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Past Events ({pastEvents.length})
                </h2>
                <div className="space-y-4">
                  {pastEvents.map((event) => (
                    <div key={event.id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 opacity-75">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {event.title}
                          </h3>
                          
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {event.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(event.eventDate)}</span>
                            </div>
                            
                            {event.venue && (
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>{event.venue.name}, {event.venue.city}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No Events Found' : 'No Events Yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms or filters'
                : 'Check back later for upcoming open mic events'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="btn-outline btn-lg px-6 py-3 min-h-[48px] font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Unauthenticated Event Modal */}
      <UnauthenticatedEventModal
        event={selectedEvent}
        isOpen={showModal}
        onClose={closeModal}
      />
    </div>
  )
}
