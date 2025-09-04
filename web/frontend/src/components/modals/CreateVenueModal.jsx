import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { venueService } from '../../services/venueService'

export default function CreateVenueModal({ isOpen, onClose, onVenueCreated }) {
  const [venueFormData, setVenueFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    website: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validateVenueForm = () => {
    const newErrors = {}
    
    if (!venueFormData.name.trim()) {
      newErrors.name = 'Venue name is required'
    } else if (venueFormData.name.trim().length < 3) {
      newErrors.name = 'Venue name must be at least 3 characters'
    }
    
    if (!venueFormData.address.trim()) {
      newErrors.address = 'Address is required'
    } else if (venueFormData.address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters'
    }
    
    if (!venueFormData.city.trim()) {
      newErrors.city = 'City is required'
    } else if (venueFormData.city.trim().length < 2) {
      newErrors.city = 'City must be at least 2 characters'
    }
    
    if (!venueFormData.state.trim()) {
      newErrors.state = 'State is required'
    } else if (venueFormData.state.trim().length < 2) {
      newErrors.state = 'State must be at least 2 characters'
    }
    
    if (!venueFormData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required'
    } else if (!/^\d{5}(-\d{4})?$/.test(venueFormData.zipCode.trim())) {
      newErrors.zipCode = 'Please enter a valid ZIP code (12345 or 12345-6789)'
    }
    
    if (venueFormData.website && !isValidUrl(venueFormData.website)) {
      newErrors.website = 'Please enter a valid URL'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setVenueFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateVenueForm()) {
      toast.error('Please fix the errors below')
      return
    }
    
    setLoading(true)
    try {
      const venue = await venueService.createVenue(venueFormData)
      toast.success('Venue created successfully!')
      setVenueFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        website: ''
      })
      setErrors({})
      onVenueCreated?.(venue)
      onClose()
    } catch (error) {
      console.error('Error creating venue:', error)
      toast.error(error.response?.data?.message || 'Failed to create venue')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setVenueFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      website: ''
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create New Venue</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={venueFormData.name}
              onChange={handleInputChange}
              className={`input w-full ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Enter venue name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={venueFormData.address}
              onChange={handleInputChange}
              className={`input w-full ${errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Street address"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={venueFormData.city}
                onChange={handleInputChange}
                className={`input w-full ${errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="City"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={venueFormData.state}
                onChange={handleInputChange}
                className={`input w-full ${errors.state ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="State"
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="zipCode"
              value={venueFormData.zipCode}
              onChange={handleInputChange}
              className={`input w-full ${errors.zipCode ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="12345 or 12345-6789"
            />
            {errors.zipCode && (
              <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={venueFormData.phone}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="url"
                name="website"
                value={venueFormData.website}
                onChange={handleInputChange}
                className={`input w-full ${errors.website ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-outline flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Venue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
