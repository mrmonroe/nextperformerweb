import { useState, useEffect } from 'react'
import { X, Users, Clock, Mail, Phone, Music, Trash2, ArrowUpDown, RefreshCw } from 'lucide-react'
import { signupService } from '../../services/signupService'
import { timeslotService } from '../../services/timeslotService'
import { toast } from 'react-hot-toast'
import ConfirmDeleteModal from './ConfirmDeleteModal'

export default function SignupManagementModal({ 
  isOpen, 
  onClose, 
  event, 
  onSignupsUpdated 
}) {
  const [signups, setSignups] = useState([])
  const [timeslots, setTimeslots] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [signupToDelete, setSignupToDelete] = useState(null)
  const [movingSignup, setMovingSignup] = useState(null)
  const [newTimeslotId, setNewTimeslotId] = useState('')

  useEffect(() => {
    if (isOpen && event) {
      loadSignups()
      loadTimeslots()
    }
  }, [isOpen, event])

  const loadSignups = async () => {
    try {
      setLoading(true)
      const data = await signupService.getEventSignups(event.id)
      setSignups(data)
    } catch (error) {
      console.error('Error loading signups:', error)
      toast.error('Failed to load signups')
    } finally {
      setLoading(false)
    }
  }

  const loadTimeslots = async () => {
    try {
      const data = await timeslotService.getTimeslotsByEventId(event.id)
      setTimeslots(data)
    } catch (error) {
      console.error('Error loading timeslots:', error)
    }
  }

  const handleMoveSignup = async (signupId, timeslotId) => {
    try {
      await signupService.moveSignup(signupId, timeslotId)
      toast.success('Signup moved successfully')
      loadSignups()
      onSignupsUpdated?.()
    } catch (error) {
      toast.error(error.message || 'Failed to move signup')
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
        toast.success('Signup removed successfully')
        loadSignups()
        onSignupsUpdated?.()
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

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTimeslotById = (timeslotId) => {
    return timeslots.find(ts => ts.id === timeslotId)
  }

  const getAvailableTimeslots = (currentTimeslotId) => {
    return timeslots.filter(ts => ts.id !== currentTimeslotId && ts.is_available)
  }

  const getSignupsByTimeslot = () => {
    const signupsByTimeslot = {}
    timeslots.forEach(timeslot => {
      signupsByTimeslot[timeslot.id] = signups.filter(signup => signup.timeslot_id === timeslot.id)
    })
    return signupsByTimeslot
  }

  const getSignupCountForTimeslot = (timeslotId) => {
    return signups.filter(signup => signup.timeslot_id === timeslotId).length
  }

  if (!isOpen || !event) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Manage Signups</h2>
            <p className="text-sm md:text-base text-gray-600">{event.title}</p>
          </div>
          <div className="flex items-center space-x-2 md:space-x-3">
            <button
              onClick={loadSignups}
              disabled={loading}
              className="btn-outline btn-sm flex items-center space-x-1 md:space-x-2 text-xs md:text-sm"
            >
              <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto mb-4" />
              <p className="text-gray-600">Loading signups...</p>
            </div>
          ) : timeslots.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No timeslots created yet</p>
              <p className="text-sm text-gray-500">Create timeslots first to manage signups</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Mobile-first timeslot view */}
              <div className="block md:hidden">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Timeslots</h3>
                {timeslots.map((timeslot) => {
                  const timeslotSignups = getSignupsByTimeslot()[timeslot.id] || []
                  const signupCount = timeslotSignups.length
                  const isAvailable = timeslot.is_available
                  const hasSignups = signupCount > 0
                  
                  // Determine background color based on availability and signup status
                  let bgColor, borderColor, statusColor, statusText
                  if (!isAvailable) {
                    bgColor = 'bg-red-50'
                    borderColor = 'border-red-200'
                    statusColor = 'bg-red-100 text-red-800'
                    statusText = 'Unavailable'
                  } else if (hasSignups) {
                    bgColor = 'bg-white'
                    borderColor = 'border-gray-200'
                    statusColor = 'bg-blue-100 text-blue-800'
                    statusText = 'Booked'
                  } else {
                    bgColor = 'bg-green-50'
                    borderColor = 'border-green-200'
                    statusColor = 'bg-green-100 text-green-800'
                    statusText = 'Available'
                  }
                  
                  return (
                    <div
                      key={timeslot.id}
                      className={`rounded-lg p-4 border-2 ${bgColor} ${borderColor}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{timeslot.name || 'Timeslot'}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
                            {statusText}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{signupCount} signups</div>
                          <div className="text-xs text-gray-500">{timeslot.duration_minutes} min</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTime(timeslot.start_time)} - {formatTime(timeslot.end_time)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Show signups for this timeslot */}
                      {timeslotSignups.length > 0 ? (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">Performers:</div>
                          {timeslotSignups.map((signup) => (
                            <div
                              key={signup.id}
                              className="bg-white rounded p-3 border border-gray-200"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-gray-900">{signup.performer_name}</span>
                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                      {signup.performance_type}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {signup.email} • {formatDate(signup.signup_date)}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveSignup(signup)}
                                  className="text-red-600 hover:text-red-800 transition-colors ml-2"
                                  title="Remove signup"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">No performers signed up</div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Desktop view - original layout */}
              <div className="hidden md:block">
                {signups.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No signups yet</p>
                    <p className="text-sm text-gray-500">Performers can sign up using the event code or QR code</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {signups.map((signup) => {
                      const timeslot = getTimeslotById(signup.timeslot_id)
                      const availableTimeslots = getAvailableTimeslots(signup.timeslot_id)
                      
                      return (
                        <div
                          key={signup.id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-2">
                                <h3 className="font-semibold text-gray-900">{signup.performer_name}</h3>
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                  {signup.performance_type}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {timeslot ? `${formatTime(timeslot.start_time)} - ${formatTime(timeslot.end_time)}` : 'Unknown timeslot'}
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4" />
                                  <span>{signup.email}</span>
                                </div>
                                
                                {signup.phone && (
                                  <div className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4" />
                                    <span>{signup.phone}</span>
                                  </div>
                                )}
                                
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">
                                    Signed up {formatDate(signup.signup_date)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              {/* Move to different timeslot */}
                              {availableTimeslots.length > 0 && (
                                <div className="flex items-center space-x-2">
                                  <select
                                    value={movingSignup === signup.id ? newTimeslotId : ''}
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        setMovingSignup(signup.id)
                                        setNewTimeslotId(e.target.value)
                                        handleMoveSignup(signup.id, e.target.value)
                                      }
                                    }}
                                    className="text-xs border border-gray-300 rounded px-2 py-1"
                                  >
                                    <option value="">Move to...</option>
                                    {availableTimeslots.map((ts) => (
                                      <option key={ts.id} value={ts.id}>
                                        {formatTime(ts.start_time)} - {formatTime(ts.end_time)}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              
                              {/* Remove signup */}
                              <button
                                onClick={() => handleRemoveSignup(signup)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Remove signup"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Remove Signup"
        message="Are you sure you want to remove this performer from the event?"
        itemName={signupToDelete?.performer_name}
        confirmText="Remove Signup"
        cancelText="Cancel"
      />
    </div>
  )
}
