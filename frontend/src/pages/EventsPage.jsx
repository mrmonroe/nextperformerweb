import { Calendar, Search, Filter, Plus } from 'lucide-react'
import { useConfig } from '../hooks/useConfig'

export default function EventsPage() {
  const { config } = useConfig()

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {config?.content?.copy?.events?.title || 'Events'}
          </h1>
          <p className="text-gray-600">Discover amazing open mic events</p>
        </div>
        <button className="btn-primary btn-lg flex items-center space-x-2">
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
            className="input w-full pl-10"
          />
        </div>
        <button className="btn-outline btn-lg flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {config?.content?.copy?.events?.noEventsTitle || 'No Events Yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {config?.content?.copy?.events?.noEventsSubtitle || 'Create your first event to get started'}
          </p>
          <button className="btn-primary btn-lg">
            Create Your First Event
          </button>
        </div>
      </div>
    </div>
  )
}
