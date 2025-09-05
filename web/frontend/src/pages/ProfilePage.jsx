import { User, Edit, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useConfig } from '../hooks/useConfig'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { config } = useConfig()

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {config?.content?.copy?.profile?.title || 'Profile'}
        </h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="card max-w-2xl mx-auto">
        <div className="card-content">
          <div className="text-center space-y-4">
            {/* Avatar */}
            <div className="mx-auto w-24 h-24 bg-primary rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>

            {/* User Info */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.displayName || 'User'}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
              {user?.primaryRole && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.primaryRole.displayName || user.primaryRole.name}
                  </span>
                </div>
              )}
              {user?.bio && (
                <p className="text-gray-500 mt-2">{user.bio}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-outline btn-lg flex items-center space-x-2">
                <Edit className="h-5 w-5" />
                <span>Edit Profile</span>
              </button>
              <button className="btn-outline btn-lg flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
              <button 
                onClick={logout}
                className="btn-outline btn-lg flex items-center space-x-2 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="card max-w-2xl mx-auto">
        <div className="card-header">
          <h3 className="card-title">Account Information</h3>
        </div>
        <div className="card-content space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Member since</span>
            <span className="font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last login</span>
            <span className="font-medium">
              {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          {user?.roles && user.roles.length > 0 && (
            <div>
              <span className="text-gray-600 block mb-2">Roles</span>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <span
                    key={role.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {role.display_name || role.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
