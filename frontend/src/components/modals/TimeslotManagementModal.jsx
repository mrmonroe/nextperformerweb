import { useState, useEffect } from 'react'
import { X, Plus, Clock, Users, Edit, Trash2, Settings } from 'lucide-react'
import { timeslotService } from '../../services/timeslotService'
import { toast } from 'react-hot-toast'

export default function TimeslotManagementModal({ 
  isOpen, 
  onClose, 
  event, 
  onTimeslotsUpdated 
}) {
  const [timeslots, setTimeslots] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [editingTimeslot, setEditingTimeslot] = useState(null)
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleGenerateInputChange = (e) => {
    const { name, value } = e.target
    setGenerateData(prev => ({
      ...prev,
      [name]: parseInt(value)
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
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Timeslot</span>
            </button>
            <button
              onClick={() => setShowGenerateForm(true)}
              className="btn-outline flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Generate Timeslots</span>
            </button>
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

          {/* Timeslots List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Timeslots ({timeslots.length})
            </h3>
            
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
              <div className="space-y-3">
                {timeslots.map((timeslot) => (
                  <div
                    key={timeslot.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
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
                              {timeslot.current_signups} / {timeslot.max_performers} performers
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
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditTimeslot(timeslot)}
                          className="btn-outline btn-sm flex items-center space-x-1"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteTimeslot(timeslot.id)}
                          className="btn-outline btn-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
