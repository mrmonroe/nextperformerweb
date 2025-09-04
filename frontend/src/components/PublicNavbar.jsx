import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Mic, Calendar, LogIn, UserPlus, Home, LogOut, User, Menu, X } from 'lucide-react'
import { useConfig } from '../hooks/useConfig'
import { useAuth } from '../hooks/useAuth'

export default function PublicNavbar() {
  const location = useLocation()
  const { config } = useConfig()
  const { user, isAuthenticated, logout } = useAuth()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    setIsDrawerOpen(false)
  }

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
  }

  return (
    <>
      <nav className="bg-white shadow-sm border-b relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2" onClick={closeDrawer}>
                <div className="p-2 bg-primary rounded-lg">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {config?.content?.branding?.title || 'Next Performer'}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-8">
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

            {/* Desktop Auth Links - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-4">
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

            {/* Mobile Hamburger Menu Button */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={toggleDrawer}
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 p-2 rounded-md"
                aria-label={isDrawerOpen ? 'Close menu' : 'Open menu'}
              >
                {isDrawerOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={closeDrawer}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed top-0 left-0 h-full w-80 max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
        isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary rounded-lg">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              {config?.content?.branding?.title || 'Next Performer'}
            </span>
          </div>
          <button
            onClick={closeDrawer}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-md"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Navigation */}
        <div className="flex flex-col h-full">
          {/* Navigation Links */}
          <div className="flex-1 py-4">
            <nav className="space-y-2 px-4">
              <Link
                to="/"
                onClick={closeDrawer}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-primary bg-primary-50' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>

              <Link
                to="/events"
                onClick={closeDrawer}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive('/events') 
                    ? 'text-primary bg-primary-50' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Calendar className="h-5 w-5" />
                <span>Events</span>
              </Link>
            </nav>
          </div>

          {/* Auth Section */}
          <div className="border-t border-gray-200 p-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 px-4 py-3 text-gray-700">
                  <User className="h-5 w-5" />
                  <span className="text-base font-medium">
                    Welcome, {user?.displayName || user?.firstName || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  onClick={closeDrawer}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive('/login') 
                      ? 'text-primary bg-primary-50' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </Link>

                <Link
                  to="/register"
                  onClick={closeDrawer}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-white bg-primary hover:bg-primary-600 transition-colors"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}