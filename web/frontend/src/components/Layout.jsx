import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Calendar, 
  MapPin, 
  User, 
  Menu, 
  X,
  Mic,
  Plus
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useConfig } from '../hooks/useConfig'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const { config } = useConfig()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Venues', href: '/venues', icon: MapPin },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center space-x-2">
            <Mic className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gray-900">
              {config?.app?.name || 'GrabTheMic'}
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-4 px-4">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <User className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 border-b">
            <Mic className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              {config?.app?.name || 'GrabTheMic'}
            </span>
          </div>

          <nav className="flex-1 mt-4 px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive(item.href)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-3 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <Mic className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-gray-900">
              {config?.app?.name || 'GrabTheMic'}
            </span>
          </div>

          <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
