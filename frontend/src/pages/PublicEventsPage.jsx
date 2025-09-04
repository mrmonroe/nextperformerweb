import { useState } from 'react'
import { useQuery } from 'react-query'
import { Calendar, Clock, MapPin, Users, Star, Search, Filter } from 'lucide-react'
import { useConfig } from '../hooks/useConfig'
import { eventService } from '../services/eventService'
import ConfigLoadingPlaceholder from '../components/ConfigLoadingPlaceholder'

export default function PublicEventsPage() {
  const { config, isLoading: configLoading } = useConfig()
  const [searchTerm, setSearchTerm] = useState('')
  const [showSpotlightOnly, setShowSpotlightOnly] = useState(false)

  const { data: eventsData, isLoading: eventsLoading, error } = useQuery(
    'public-events',
    () => eventService.getEvents(),
    {
      onError: (error) => {
        console.error('Error loading events:', error)
      }
    }
  )

  const events = Array.isArray(eventsData) ? eventsData : eventsData?.events || []

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue?.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSpotlight = showSpotlightOnly ? event.isSpotlight : true
    
    return matchesSearch && matchesSpotlight
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

  const upcomingEvents = filteredEvents.filter(event => isUpcoming(event.eventDate))
  const pastEvents = filteredEvents.filter(event => !isUpcoming(event.eventDate))

  if (configLoading) {
    return <ConfigLoadingPlaceholder type="page" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              onClick={() => setShowSpotlightOnly(!showSpotlightOnly)}
              className={`btn-outline flex items-center space-x-2 ${
                showSpotlightOnly ? 'bg-yellow-50 border-yellow-300 text-yellow-800' : ''
              }`}
            >
              <Star className="h-4 w-4" />
              <span>{showSpotlightOnly ? 'Show All' : 'Spotlight Only'}</span>
            </button>
          </div>
        </div>

        {/* Events List */}
        {eventsLoading ? (
          <div className="flex justify-center py-12">
            <div className="loading-spinner" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Events
            </h3>
            <p className="text-gray-600">
              There was an error loading events. Please try again later.
            </p>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="space-y-8">
            {/* Upcoming Events */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Upcoming Events ({upcomingEvents.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="card hover:shadow-lg transition-shadow">
                    <div className="card-content">
                      {event.isSpotlight && (
                        <div className="flex items-center space-x-2 mb-4">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full">
                            Spotlight Event
                          </span>
                        </div>
                      )}
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {event.description}
                      </p>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(event.eventDate)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                        </div>
                        
                        {event.venue && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{event.venue.name}, {event.venue.city}</span>
                          </div>
                        )}
                        
                        {event.maxAttendees && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>Max {event.maxAttendees} attendees</span>
                          </div>
                        )}
                      </div>

                      {event.imageUrl && (
                        <div className="mb-4">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-500">
                          Created by {event.creator?.name || 'Anonymous'}
                        </span>
                        <button className="btn-outline btn-sm">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((event) => (
                    <div key={event.id} className="card opacity-75">
                      <div className="card-content">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {event.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {event.description}
                        </p>

                        <div className="space-y-2 text-sm text-gray-500">
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
                className="btn-outline"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
