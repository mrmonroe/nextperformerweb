import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { MapPin, Search, Plus, Phone, Globe, Calendar } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useConfig } from '../hooks/useConfig'
import { venueService } from '../services/venueService'
import CreateVenueModal from '../components/modals/CreateVenueModal'
import ConfigLoadingPlaceholder from '../components/ConfigLoadingPlaceholder'

export default function VenuesPage() {
  const { config, isLoading: configLoading } = useConfig()
  const [showCreateVenue, setShowCreateVenue] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: venuesData, isLoading: venuesLoading, refetch: refetchVenues } = useQuery(
    'venues',
    () => venueService.getVenues(),
    {
      onError: (error) => {
        console.error('Error loading venues:', error)
        toast.error('Failed to load venues')
      }
    }
  )

  const venues = Array.isArray(venuesData) ? venuesData : venuesData?.venues || []

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.state.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleVenueCreated = (venue) => {
    refetchVenues()
    toast.success('Venue added successfully!')
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
            {config?.content?.copy?.venues?.title || 'Venues'}
          </h1>
          <p className="text-gray-600">
            {config?.content?.copy?.venues?.subtitle || 'Discover venues that host open mic events'}
          </p>
        </div>
        <button 
          onClick={() => setShowCreateVenue(true)}
          className="btn-primary btn-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Venue</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search venues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input w-full pl-10"
        />
      </div>

      {/* Venues List */}
      <div className="space-y-4">
        {venuesLoading ? (
          <div className="flex justify-center py-12">
            <div className="loading-spinner" />
          </div>
        ) : filteredVenues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <div key={venue.id} className="card hover:shadow-lg transition-shadow">
                <div className="card-content">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {venue.name}
                        </h3>
                        <p className="text-gray-600">
                          {venue.city}, {venue.state} {venue.zip_code}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      {venue.address}
                    </p>
                    
                    {venue.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{venue.phone}</span>
                      </div>
                    )}
                    
                    {venue.website && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Globe className="h-4 w-4" />
                        <a 
                          href={venue.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Events: Coming Soon</span>
                    </div>
                    <button className="btn-outline btn-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No Venues Found' : 'No Venues Yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Add your first venue to get started'
              }
            </p>
            <button 
              onClick={() => setShowCreateVenue(true)}
              className="btn-primary btn-lg"
            >
              Add Your First Venue
            </button>
          </div>
        )}
      </div>

      {/* Create Venue Modal */}
      <CreateVenueModal
        isOpen={showCreateVenue}
        onClose={() => setShowCreateVenue(false)}
        onVenueCreated={handleVenueCreated}
      />
    </div>
  )
}
