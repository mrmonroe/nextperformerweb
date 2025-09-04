import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Search, Filter, Plus, MapPin, Clock, Users, Star } from 'lucide-react'
import { useConfig } from '../hooks/useConfig'
import { useAuth } from '../hooks/useAuth'
import { eventService } from '../services/eventService'
import ConfigLoadingPlaceholder from '../components/ConfigLoadingPlaceholder'
import toast from 'react-hot-toast'

export default function EventsPage() {
  const navigate = useNavigate()
  const { config, configLoading } = useConfig()
  const { isAuthenticated } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSpotlightOnly, setShowSpotlightOnly] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [searchQuery, showSpotlightOnly])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const params = {
        search: searchQuery || undefined,
        spotlight: showSpotlightOnly || undefined
      }
      const data = await eventService.getEvents(params)
      setEvents(data.events || [])
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    navigate('/events/create')
  }

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {config?.content?.copy?.events?.title || 'Events'}
          </h1>
          <p className="text-gray-600">
            {config?.content?.copy?.events?.subtitle || 'Discover amazing open mic events'}
          </p>
        </div>
        <button 
          onClick={handleCreateEvent}
          className="btn-primary btn-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-10"
          />
        </div>
        <button 
          onClick={() => setShowSpotlightOnly(!showSpotlightOnly)}
          className={`btn-lg flex items-center space-x-2 ${
            showSpotlightOnly ? 'btn-primary' : 'btn-outline'
          }`}
        >
          <Star className="h-5 w-5" />
          <span>Spotlight Only</span>
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {config?.content?.copy?.events?.noEventsTitle || 'No Events Yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {config?.content?.copy?.events?.noEventsSubtitle || 'Create your first event to get started'}
            </p>
            <button 
              onClick={handleCreateEvent}
              className="btn-primary btn-lg"
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event.id)}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="card-content">
                  {event.image_url && (
                    <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {event.title}
                      </h3>
                      {event.is_spotlight && (
                        <Star className="h-5 w-5 text-yellow-500 flex-shrink-0 ml-2" />
                      )}
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="truncate">
                          {event.venue_name}, {event.venue_city}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(event.event_date)}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {formatTime(event.start_time)} - {formatTime(event.end_time)}
                        </span>
                      </div>

                      {event.max_attendees && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-2" />
                          <span>Max {event.max_attendees} attendees</span>
                        </div>
                      )}

                      {event.created_by_name && (
                        <div className="text-xs text-gray-400">
                          Created by {event.created_by_name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
