import { useState, useEffect, useRef } from 'react'
import { X, Plus, Clock, Users, Edit, Trash2, Settings, Mail, Phone, Music } from 'lucide-react'
import { timeslotService } from '../../services/timeslotService'
import { signupService } from '../../services/signupService'
import { toast } from 'react-hot-toast'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { DropdownMenu, DropdownItem } from '../ui'

export default function TimeslotManagementModal({ 
  isOpen, 
  onClose, 
  event, 
  onTimeslotsUpdated 
}) {
  const [timeslots, setTimeslots] = useState([])
  const [signups, setSignups] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [showRegenerateForm, setShowRegenerateForm] = useState(false)
  const [editingTimeslot, setEditingTimeslot] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [signupToDelete, setSignupToDelete] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    durationMinutes: 30,
    isAvailable: true
  })
  const [generateData, setGenerateData] = useState({
    durationMinutes: 30
  })

  useEffect(() => {
    if (isOpen && event) {
      loadTimeslots()
      loadSignups()
    }
  }, [isOpen, event])


  const loadTimeslots = async () => {
    try {
      setLoading(true)
      const data = await timeslotService.getTimeslotsByEventId(event.id)
      setTimeslots(data)
    } catch (error) {
      console.error('Error loading timeslots:', error)
      toast.error('Failed to load timeslots')
    } finally {
      setLoading(false)
    }
  }

  const loadSignups = async () => {
    try {
      const data = await signupService.getEventSignups(event.id)
      setSignups(data)
    } catch (error) {
      console.error('Error loading signups:', error)
      toast.error('Failed to load signups')
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : parseInt(value)) : value)
    }))
  }

  const handleGenerateInputChange = (e) => {
    const { name, value } = e.target
    setGenerateData(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseInt(value)
    }))
  }

  const handleCreateTimeslot = async (e) => {
    e.preventDefault()
    
    try {
      await timeslotService.createTimeslot({
        eventId: event.id,
        ...formData
      })
      
      toast.success('Timeslot created successfully')
      setShowCreateForm(false)
      setFormData({
        name: '',
        startTime: '',
        endTime: '',
        durationMinutes: 30,
        isAvailable: true
      })
      loadTimeslots()
      onTimeslotsUpdated?.()
    } catch (error) {
      toast.error(error.message || 'Failed to create timeslot')
    }
  }

  const handleGenerateTimeslots = async (e) => {
    e.preventDefault()
    
    try {
      await timeslotService.generateTimeslots(
        event.id,
        generateData.durationMinutes
      )
      
      toast.success('Timeslots generated successfully')
      setShowGenerateForm(false)
      setGenerateData({
        durationMinutes: 30
      })
      loadTimeslots()
      onTimeslotsUpdated?.()
    } catch (error) {
      toast.error(error.message || 'Failed to generate timeslots')
    }
  }

  const handleRegenerateTimeslots = async (e) => {
    e.preventDefault()
    
    if (!window.confirm('This will delete all existing timeslots and create new ones. Are you sure?')) {
      return
    }
    
    try {
      await timeslotService.regenerateTimeslots(
        event.id,
        generateData.durationMinutes
      )
      
      toast.success('Timeslots regenerated successfully')
      setShowRegenerateForm(false)
      setGenerateData({
        durationMinutes: 30
      })
      loadTimeslots()
      onTimeslotsUpdated?.()
    } catch (error) {
      toast.error(error.message || 'Failed to regenerate timeslots')
    }
  }

  const handleEditTimeslot = (timeslot) => {
    setEditingTimeslot(timeslot)
    setFormData({
      name: timeslot.name,
      startTime: timeslot.start_time,
      endTime: timeslot.end_time,
      durationMinutes: timeslot.duration_minutes,
      isAvailable: timeslot.is_available
    })
    setShowCreateForm(true)
  }

  const handleUpdateTimeslot = async (e) => {
    e.preventDefault()
    
    try {
      await timeslotService.updateTimeslot(editingTimeslot.id, formData)
      
      toast.success('Timeslot updated successfully')
      setShowCreateForm(false)
      setEditingTimeslot(null)
      setFormData({
        name: '',
        startTime: '',
        endTime: '',
        durationMinutes: 30,
        isAvailable: true
      })
      loadTimeslots()
      onTimeslotsUpdated?.()
    } catch (error) {
      toast.error(error.message || 'Failed to update timeslot')
    }
  }

  const handleDeleteTimeslot = async (timeslotId) => {
    if (!window.confirm('Are you sure you want to delete this timeslot?')) {
      return
    }
    
    try {
      await timeslotService.deleteTimeslot(timeslotId)
      toast.success('Timeslot deleted successfully')
      loadTimeslots()
      onTimeslotsUpdated?.()
    } catch (error) {
      toast.error(error.message || 'Failed to delete timeslot')
    }
  }

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getEventStartTime = () => {
    if (!event) return ''
    return event.start_time
  }

  const getEventEndTime = () => {
    if (!event) return ''
    return event.end_time
  }

  const getSignupsForTimeslot = (timeslotId) => {
    return signups.filter(signup => signup.timeslot_id === timeslotId)
  }

  const handleRemoveSignup = (signup) => {
    setSignupToDelete(signup)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteSignup = async () => {
    if (signupToDelete) {
      try {
        await signupService.removeSignup(signupToDelete.id)
        toast.success('Signup removed successfully')
        loadSignups()
        onTimeslotsUpdated?.()
      } catch (error) {
        toast.error(error.message || 'Failed to remove signup')
      }
    }
    setShowDeleteConfirm(false)
    setSignupToDelete(null)
  }

  const cancelDeleteSignup = () => {
    setShowDeleteConfirm(false)
    setSignupToDelete(null)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isOpen || !event) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Manage Timeslots - {event.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Timeslots ({timeslots.length})
            </h3>
            
            <DropdownMenu>
              <DropdownItem 
                onClick={() => setShowCreateForm(true)} 
                icon={Plus}
              >
                Create Timeslot
              </DropdownItem>
              <DropdownItem 
                onClick={() => setShowGenerateForm(true)} 
                icon={Settings}
              >
                Generate Timeslots
              </DropdownItem>
              {timeslots.length > 0 && (
                <DropdownItem 
                  onClick={() => setShowRegenerateForm(true)} 
                  icon={Settings}
                  className="flex items-center px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 cursor-pointer"
                >
                  Regenerate Timeslots
                </DropdownItem>
              )}
            </DropdownMenu>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTimeslot ? 'Edit Timeslot' : 'Create New Timeslot'}
              </h3>
              <form onSubmit={editingTimeslot ? handleUpdateTimeslot : handleCreateTimeslot}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input w-full"
                      placeholder="e.g., Opening Act, Headliner"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave blank to auto-generate names
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="durationMinutes"
                      value={formData.durationMinutes}
                      onChange={handleInputChange}
                      className="input w-full"
                      min="5"
                      max="480"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="input w-full"
                      min={getEventStartTime()}
                      max={getEventEndTime()}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Event runs from {formatTime(getEventStartTime())} to {formatTime(getEventEndTime())}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="input w-full"
                      min={getEventStartTime()}
                      max={getEventEndTime()}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must be within event time range
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Available for signup</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button type="submit" className="btn-primary">
                    {editingTimeslot ? 'Update Timeslot' : 'Create Timeslot'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingTimeslot(null)
                      setFormData({
                        name: '',
                        description: '',
                        startTime: '',
                        endTime: '',
                        durationMinutes: 30,
                        maxPerformers: 1,
                        isAvailable: true
                      })
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Generate Form */}
          {showGenerateForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Generate Timeslots Automatically
              </h3>
              <form onSubmit={handleGenerateTimeslots}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="durationMinutes"
                      value={generateData.durationMinutes}
                      onChange={handleGenerateInputChange}
                      className="input w-full"
                      min="5"
                      max="480"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      How long each performance slot should be (5-480 minutes)
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button type="submit" className="btn-primary">
                    Generate Timeslots
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGenerateForm(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Regenerate Form */}
          {showRegenerateForm && (
            <div className="bg-orange-50 rounded-lg p-4 mb-6 border border-orange-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Regenerate Timeslots
              </h3>
              <form onSubmit={handleRegenerateTimeslots}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="durationMinutes"
                      value={generateData.durationMinutes}
                      onChange={handleGenerateInputChange}
                      className="input w-full"
                      min="5"
                      max="480"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      How long each performance slot should be (5-480 minutes)
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ This will delete all existing timeslots and create new ones
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button type="submit" className="btn-warning">
                    Regenerate Timeslots
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRegenerateForm(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Timeslots List */}
          <div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-4" />
                <p className="text-gray-600">Loading timeslots...</p>
              </div>
            ) : timeslots.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No timeslots created yet</p>
                <p className="text-sm text-gray-500">Create timeslots manually or generate them automatically</p>
              </div>
            ) : (
              <div className="space-y-4">
                {timeslots.map((timeslot) => {
                  const timeslotSignups = getSignupsForTimeslot(timeslot.id)
                  const signupCount = timeslotSignups.length
                  
                  return (
                    <div
                      key={timeslot.id}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      {/* Timeslot Header */}
                      <div className="mb-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{timeslot.name}</h4>
                          {!timeslot.is_available && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                              Unavailable
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {formatTime(timeslot.start_time)} - {formatTime(timeslot.end_time)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>
                              {signupCount} / {timeslot.max_performers || '∞'} performers
                            </span>
                          </div>
                          
                          <span>
                            {timeslot.duration_minutes} min
                          </span>
                        </div>
                        
                        {timeslot.description && (
                          <p className="text-sm text-gray-500 mt-1">{timeslot.description}</p>
                        )}
                      </div>

                      {/* Action Buttons - Mobile Responsive */}
                      <div className="flex items-center justify-center space-x-4 py-2 border-t border-gray-100">
                        <button
                          onClick={() => handleEditTimeslot(timeslot)}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        
                        <span className="text-gray-300">|</span>
                        
                        <button
                          onClick={() => handleDeleteTimeslot(timeslot.id)}
                          className="text-sm text-red-600 hover:text-red-800 hover:underline flex items-center space-x-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>

                      {/* Signups for this timeslot */}
                      {timeslotSignups.length > 0 ? (
                        <div className="border-t pt-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                            <Music className="h-4 w-4" />
                            <span>Performers ({signupCount})</span>
                          </h5>
                          <div className="space-y-2">
                            {timeslotSignups.map((signup) => (
                              <div
                                key={signup.id}
                                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-medium text-gray-900">{signup.performer_name}</span>
                                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                        {signup.performance_type}
                                      </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                                      <div className="flex items-center space-x-1">
                                        <Mail className="h-3 w-3" />
                                        <span>{signup.email}</span>
                                      </div>
                                      
                                      {signup.phone && (
                                        <div className="flex items-center space-x-1">
                                          <Phone className="h-3 w-3" />
                                          <span>{signup.phone}</span>
                                        </div>
                                      )}
                                      
                                      <div className="flex items-center space-x-1 md:col-span-2">
                                        <span className="text-gray-500">
                                          Signed up {formatDate(signup.signup_date)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <button
                                    onClick={() => handleRemoveSignup(signup)}
                                    className="text-red-600 hover:text-red-800 transition-colors ml-3"
                                    title="Remove signup"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="border-t pt-4">
                          <div className="text-center py-4">
                            <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No performers signed up for this timeslot</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={cancelDeleteSignup}
        onConfirm={confirmDeleteSignup}
        title="Remove Signup"
        message="Are you sure you want to remove this performer from the timeslot?"
        itemName={signupToDelete?.performer_name}
        confirmText="Remove Signup"
        cancelText="Cancel"
      />
    </div>
  )
}
