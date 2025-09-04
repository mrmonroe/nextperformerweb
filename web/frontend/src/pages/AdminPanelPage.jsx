import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { 
  Shield, 
  Settings, 
  Save, 
  Trash2, 
  Plus, 
  Edit, 
  Eye, 
  EyeOff,
  LogOut,
  RefreshCw,
  Users,
  UserCog
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import UserManagementPage from './UserManagementPage'
import RoleManagementPage from './RoleManagementPage'
import PublicNavbar from '../components/PublicNavbar'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function AdminPanelPage() {
  const { admin, logout, isAuthenticated } = useAdminAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('config')
  const [configs, setConfigs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingKey, setEditingKey] = useState(null)
  const [editingValue, setEditingValue] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [editingCategory, setEditingCategory] = useState('general')
  const [editingIsPublic, setEditingIsPublic] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login')
      return
    }
    loadConfigs()
  }, [isAuthenticated, navigate])

  const loadConfigs = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_BASE_URL}/api/admin/configs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error('Failed to load configurations')
      const data = await response.json()
      setConfigs(data)
    } catch (error) {
      console.error('Error loading configs:', error)
      alert('Failed to load configurations')
    } finally {
      setIsLoading(false)
    }
  }

  const startEdit = (config) => {
    setEditingKey(config.key)
    setEditingValue(JSON.stringify(config.value, null, 2))
    setEditingDescription(config.description || '')
    setEditingCategory(config.category)
    setEditingIsPublic(config.is_public)
  }

  const cancelEdit = () => {
    setEditingKey(null)
    setEditingValue('')
    setEditingDescription('')
    setEditingCategory('general')
    setEditingIsPublic(false)
  }

  const saveConfig = async () => {
    try {
      setIsSaving(true)
      const parsedValue = JSON.parse(editingValue)
      
      const response = await fetch(`${API_BASE_URL}/api/admin/configs/${editingKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          value: parsedValue,
          description: editingDescription,
          category: editingCategory,
          isPublic: editingIsPublic
        })
      })

      if (!response.ok) throw new Error('Failed to save configuration')
      
      await loadConfigs()
      cancelEdit()
      alert('Configuration saved successfully!')
    } catch (error) {
      console.error('Error saving config:', error)
      alert('Failed to save configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteConfig = async (key) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/configs/${key}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete configuration')
      
      await loadConfigs()
      alert('Configuration deleted successfully!')
    } catch (error) {
      console.error('Error deleting config:', error)
      alert('Failed to delete configuration')
    }
  }

  const initializeConfigs = async () => {
    if (!confirm('This will reset all configurations to defaults. Continue?')) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/configs/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (!response.ok) throw new Error('Failed to initialize configurations')
      
      await loadConfigs()
      alert('Configurations initialized successfully!')
    } catch (error) {
      console.error('Error initializing configs:', error)
      alert('Failed to initialize configurations')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <PublicNavbar />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">Configuration Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{admin?.username}</span>
              </span>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('config')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'config'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="h-5 w-5 inline mr-2" />
              Configuration
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-5 w-5 inline mr-2" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserCog className="h-5 w-5 inline mr-2" />
              Role Management
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'config' && (
          <>
            {/* Actions */}
            <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Configurations</h2>
          <div className="flex space-x-3">
            <button
              onClick={loadConfigs}
              className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={initializeConfigs}
              className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              <Settings className="h-4 w-4 mr-2" />
              Initialize Defaults
            </button>
          </div>
        </div>

        {/* Configurations List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Public
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {configs.map((config) => (
                  <tr key={config.key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm font-mono text-gray-900">
                        {config.key}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {config.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {config.is_public ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {config.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(config)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {admin?.role === 'super_admin' && (
                          <button
                            onClick={() => deleteConfig(config.key)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {editingKey && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Edit Configuration: {editingKey}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Value (JSON)
                    </label>
                    <textarea
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                      placeholder="Enter JSON value..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter description..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={editingCategory}
                        onChange={(e) => setEditingCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="general">General</option>
                        <option value="app">App</option>
                        <option value="ui">UI</option>
                        <option value="features">Features</option>
                        <option value="content">Content</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={editingIsPublic}
                        onChange={(e) => setEditingIsPublic(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                        Public (accessible without auth)
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveConfig}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="loading-spinner mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {activeTab === 'users' && <UserManagementPage />}
        {activeTab === 'roles' && <RoleManagementPage />}
      </div>
    </div>
  )
}
