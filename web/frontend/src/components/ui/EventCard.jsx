import React from 'react'
import { Calendar, MapPin, Clock, Users, Star, Eye, Edit, Trash2 } from 'lucide-react'
import ActionButton from './ActionButton'
import DropdownMenu, { DropdownItem } from './DropdownMenu'

const EventCard = ({ 
  event, 
  onViewDetails, 
  onEdit, 
  onDelete, 
  onManageTimeslots,
  onManageSignups,
  showActions = true,
  showDropdown = false,
  className = '',
  isOwner = false
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
            {event.is_spotlight && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
          </div>
          {event.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
          )}
        </div>
        
        {showActions && isOwner && showDropdown && (
          <DropdownMenu>
            <DropdownItem onClick={onViewDetails} icon={Eye}>
              View Details
            </DropdownItem>
            <DropdownItem onClick={onEdit} icon={Edit}>
              Edit Event
            </DropdownItem>
            {onManageTimeslots && (
              <DropdownItem onClick={onManageTimeslots} icon={Clock}>
                Manage Timeslots
              </DropdownItem>
            )}
            {onManageSignups && (
              <DropdownItem onClick={onManageSignups} icon={Users}>
                Manage Signups
              </DropdownItem>
            )}
            <DropdownItem onClick={onDelete} icon={Trash2} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer">
              Delete Event
            </DropdownItem>
          </DropdownMenu>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{formatDate(event.event_date)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span>{formatTime(event.event_date)}</span>
        </div>
        {event.venue && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{event.venue.name}</span>
          </div>
        )}
        {event.max_performers && (
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>Max {event.max_performers} performers</span>
          </div>
        )}
      </div>

      {showActions && isOwner && !showDropdown && (
        <div className="flex space-x-2">
          <ActionButton
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={onViewDetails}
          >
            View Details
          </ActionButton>
          <ActionButton
            variant="primary"
            size="sm"
            icon={Edit}
            onClick={onEdit}
          >
            Edit
          </ActionButton>
          <ActionButton
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={onDelete}
          >
            Delete
          </ActionButton>
        </div>
      )}
    </div>
  )
}

export default EventCard
