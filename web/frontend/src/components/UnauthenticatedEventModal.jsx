import { useState } from 'react'
import { X, UserPlus, Share2, Calendar, MapPin, Clock, Users, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import ConfirmDeleteModal from './modals/ConfirmDeleteModal'

export default function UnauthenticatedEventModal({ event, isOpen, onClose, onEdit, onDelete, showEditButton = false }) {
  const { isAuthenticated, user } = useAuth()
  const [isSharing, setIsSharing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!isOpen || !event) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const handleSignUp = () => {
    // Redirect to performer signup page using event code
    if (event.event_code) {
      window.location.href = `/signup/${event.event_code}`
    } else {
      // Fallback to login if no event code
      window.location.href = `/login?returnUrl=${encodeURIComponent(`/events/${event.id}`)}`
    }
  }

  const handleShare = async () => {
    setIsSharing(true)
    
    const shareData = {
      title: event.title,
      text: `Check out this event: ${event.title}`,
      url: `${window.location.origin}/events/${event.id}`
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url)
        alert('Event link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url)
        alert('Event link copied to clipboard!')
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError)
        alert('Unable to share. Please copy the URL manually.')
      }
    } finally {
      setIsSharing(false)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(event)
      onClose()
    }
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(event)
      setShowDeleteConfirm(false)
      onClose()
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  // Check if current user is the event creator
  const isEventCreator = isAuthenticated && user && event.created_by === user.id

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Event Image */}
        {event.imageUrl && (
          <div className="w-full h-48 bg-gray-200">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Event Details */}
        <div className="p-6 space-y-4">
          {/* Date and Time */}
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">{formatDate(event.eventDate)}</span>
            <Clock className="h-5 w-5 ml-4" />
            <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
          </div>

          {/* Venue */}
          <div className="flex items-start space-x-2 text-gray-600">
            <MapPin className="h-5 w-5 mt-0.5" />
            <div>
              <div className="font-medium">{event.venue?.name}</div>
              <div className="text-sm">
                {event.venue?.address}, {event.venue?.city}, {event.venue?.state} {event.venue?.zip_code}
              </div>
            </div>
          </div>

          {/* Attendees */}
          {event.maxAttendees && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="h-5 w-5" />
              <span>Max {event.maxAttendees} attendees</span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="text-gray-700">
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-sm leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Sponsored Badge */}
          {event.isSponsored && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
              Sponsored Event
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="px-6 py-6 border-t bg-gray-50">
          {isEventCreator && showEditButton ? (
            // Event creator buttons
            <div className="space-y-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleEdit}
                  className="flex-1 btn-primary btn-lg flex items-center justify-center space-x-2 px-6 py-3 min-h-[48px] font-medium"
                >
                  <Edit className="h-5 w-5" />
                  <span>Edit Event</span>
                </button>
                
                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex-1 btn-outline btn-lg flex items-center justify-center space-x-2 px-6 py-3 min-h-[48px] font-medium"
                >
                  <Share2 className="h-5 w-5" />
                  <span>{isSharing ? 'Sharing...' : 'Share Event'}</span>
                </button>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={handleDelete}
                  className="btn-outline btn-lg flex items-center justify-center space-x-2 px-6 py-3 min-h-[48px] font-medium text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Delete Event</span>
                </button>
              </div>
            </div>
          ) : (
            // Non-creator or unauthenticated buttons
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <button
                onClick={handleSignUp}
                className="flex-1 btn-primary btn-lg flex items-center justify-center space-x-2 px-6 py-3 min-h-[48px] font-medium"
              >
                <UserPlus className="h-5 w-5" />
                <span>Sign Up for Event</span>
              </button>
              
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="flex-1 btn-outline btn-lg flex items-center justify-center space-x-2 px-6 py-3 min-h-[48px] font-medium"
              >
                <Share2 className="h-5 w-5" />
                <span>{isSharing ? 'Sharing...' : 'Share Event'}</span>
              </button>
            </div>
          )}
          
          <p className="text-center text-sm text-gray-500">
            {isEventCreator ? 'You created this event' : 'Sign in to view full event details and manage your participation'}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event?"
        itemName={event?.title}
        confirmText="Delete Event"
        cancelText="Cancel"
      />
    </div>
  )
}
