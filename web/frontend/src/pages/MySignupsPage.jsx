import { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, Users, Music, Trash2, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { signupService } from '../services/signupService'
import { toast } from 'react-hot-toast'
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal'

export default function MySignupsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [signups, setSignups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [signupToDelete, setSignupToDelete] = useState(null)

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        loadMySignups()
      } else {
        setLoading(false)
      }
    }
  }, [isAuthenticated, authLoading])

  const loadMySignups = async () => {
    try {
      setLoading(true)
      const data = await signupService.getMySignups()
      setSignups(data)
    } catch (error) {
      console.error('Error loading my signups:', error)
      if (error.message === 'Authentication required' || error.message.includes('401')) {
        // If authentication fails, redirect to login with return URL
        window.location.href = '/login?returnTo=/my-signups'
      } else {
        toast.error('Failed to load signups')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSignup = (signup) => {
    setSignupToDelete(signup)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (signupToDelete) {
      try {
        await signupService.removeSignup(signupToDelete.id)
        toast.success('Successfully removed from event')
        loadMySignups()
      } catch (error) {
        toast.error(error.message || 'Failed to remove signup')
      }
    }
    setShowDeleteConfirm(false)
    setSignupToDelete(null)
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setSignupToDelete(null)
  }

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

  const isEventUpcoming = (eventDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const event = new Date(eventDate)
    return event >= today
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your signups.</p>
          <button
            onClick={() => window.location.href = '/login?returnTo=/my-signups'}
            className="btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Signups</h1>
            <p className="text-gray-600">Manage your event performances</p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="btn-outline flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Signups List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="loading-spinner mx-auto mb-4" />
            <p className="text-gray-600">Loading your signups...</p>
          </div>
        ) : signups.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No signups yet</h3>
            <p className="text-gray-600 mb-6">You haven't signed up for any events yet.</p>
            <button
              onClick={() => window.location.href = '/events'}
              className="btn-primary"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {signups.map((signup) => (
              <div
                key={signup.id}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${
                  !isEventUpcoming(signup.event_date) ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {signup.event_title}
                      </h3>
                      {!isEventUpcoming(signup.event_date) && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          Past Event
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(signup.event_date)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatTime(signup.start_time)} - {formatTime(signup.end_time)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{signup.venue_name}, {signup.city}, {signup.state}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Music className="h-4 w-4" />
                        <span>{signup.performance_type}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <p>Timeslot: {signup.timeslot_name || 'General'}</p>
                      <p>Signed up: {formatDate(signup.signup_date)}</p>
                    </div>
                  </div>
                  
                  {isEventUpcoming(signup.event_date) && (
                    <div className="ml-4">
                      <button
                        onClick={() => handleRemoveSignup(signup)}
                        className="text-red-600 hover:text-red-800 transition-colors flex items-center space-x-2"
                        title="Remove from event"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-sm">Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Remove from Event"
        message="Are you sure you want to remove yourself from this event?"
        itemName={signupToDelete?.event_title}
        confirmText="Remove from Event"
        cancelText="Cancel"
      />
    </div>
  )
}
