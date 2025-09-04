import { MapPin, Search, Plus } from 'lucide-react'

export default function VenuesPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Venues
          </h1>
          <p className="text-gray-600">Discover venues that host open mic events</p>
        </div>
        <button className="btn-primary btn-lg flex items-center space-x-2">
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
          className="input w-full pl-10"
        />
      </div>

      {/* Venues List */}
      <div className="space-y-4">
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Venues Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Add your first venue to get started
          </p>
          <button className="btn-primary btn-lg">
            Add Your First Venue
          </button>
        </div>
      </div>
    </div>
  )
}
