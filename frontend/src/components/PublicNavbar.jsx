import { Link, useLocation } from 'react-router-dom'
import { Mic, Calendar, LogIn, UserPlus, Home, LogOut, User } from 'lucide-react'
import { useConfig } from '../hooks/useConfig'
import { useAuth } from '../hooks/useAuth'

export default function PublicNavbar() {
  const location = useLocation()
  const { config } = useConfig()
  const { user, isAuthenticated, logout } = useAuth()

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 bg-primary rounded-lg">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                {config?.content?.branding?.title || 'Next Performer'}
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary bg-primary-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/events"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/events') 
                  ? 'text-primary bg-primary-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </Link>
          </div>

          {/* Auth Links */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User className="h-4 w-4" />
                  <span>Welcome, {user?.displayName || user?.firstName || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/login') 
                      ? 'text-primary bg-primary-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>

                <Link
                  to="/register"
                  className="btn-primary btn-sm"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 p-2"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-4">
          <div className="space-y-2">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') 
                  ? 'text-primary bg-primary-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/events"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/events') 
                  ? 'text-primary bg-primary-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </Link>

            <div className="border-t border-gray-200 pt-2 mt-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700">
                    <User className="h-4 w-4" />
                    <span>Welcome, {user?.displayName || user?.firstName || 'User'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/login') 
                        ? 'text-primary bg-primary-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>

                  <Link
                    to="/register"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-600 rounded-md"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Get Started</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
