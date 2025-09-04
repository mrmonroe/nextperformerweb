import { useQuery } from 'react-query'
import { Calendar, MapPin, Users, Plus, Star } from 'lucide-react'
import { useConfig } from '../hooks/useConfig'

export default function DashboardPage() {
  const { config } = useConfig()

  // Mock data for now - replace with actual API calls
  const { data: events, isLoading: eventsLoading } = useQuery('events', () => 
    Promise.resolve([
      {
        id: '1',
        title: 'Open Mic Night at The Coffee House',
        date: '2024-01-15',
        time: '19:00',
        venue: 'The Coffee House',
        isSpotlight: true
      },
      {
        id: '2',
        title: 'Acoustic Sessions',
        date: '2024-01-20',
        time: '20:00',
        venue: 'Music Lounge',
        isSpotlight: false
      }
    ])
  )

  const { data: venues, isLoading: venuesLoading } = useQuery('venues', () =>
    Promise.resolve([
      {
        id: '1',
        name: 'The Coffee House',
        city: 'San Francisco',
        eventsCount: 5
      },
      {
        id: '2',
        name: 'Music Lounge',
        city: 'Oakland',
        eventsCount: 3
      }
    ])
  )

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
        <button className="btn-primary btn-lg flex items-center justify-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Create Event</span>
        </button>
        <button className="btn-outline btn-lg flex items-center justify-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Add Venue</span>
        </button>
        <button className="btn-outline btn-lg flex items-center justify-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Invite Friends</span>
        </button>
      </div>

      {/* Spotlight Events */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="card-title">Spotlight Events</h2>
          </div>
        </div>
        <div className="card-content">
          {eventsLoading ? (
            <div className="flex justify-center py-8">
              <div className="loading-spinner" />
            </div>
          ) : (
            <div className="space-y-4">
              {events?.filter(event => event.isSpotlight).map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.venue}</p>
                    <p className="text-sm text-gray-500">{event.date} at {event.time}</p>
                  </div>
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
              ))}
              {events?.filter(event => event.isSpotlight).length === 0 && (
                <p className="text-gray-500 text-center py-4">No spotlight events at the moment</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Events */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Events</h2>
        </div>
        <div className="card-content">
          {eventsLoading ? (
            <div className="flex justify-center py-8">
              <div className="loading-spinner" />
            </div>
          ) : (
            <div className="space-y-4">
              {events?.map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.venue}</p>
                      <p className="text-sm text-gray-500">{event.date} at {event.time}</p>
                    </div>
                  </div>
                  {event.isSpotlight && (
                    <Star className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              ))}
              {events?.length === 0 && (
                <p className="text-gray-500 text-center py-4">No events yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Popular Venues */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Popular Venues</h2>
        </div>
        <div className="card-content">
          {venuesLoading ? (
            <div className="flex justify-center py-8">
              <div className="loading-spinner" />
            </div>
          ) : (
            <div className="space-y-4">
              {venues?.map(venue => (
                <div key={venue.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{venue.name}</h3>
                      <p className="text-sm text-gray-600">{venue.city}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{venue.eventsCount} events</span>
                </div>
              ))}
              {venues?.length === 0 && (
                <p className="text-gray-500 text-center py-4">No venues yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
