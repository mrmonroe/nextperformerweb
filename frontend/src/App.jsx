import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Toaster } from 'react-hot-toast'

// Components
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import ConfigLoadingPlaceholder from './components/ConfigLoadingPlaceholder'
import ErrorBoundary from './components/ErrorBoundary'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import EventsPage from './pages/EventsPage'
import CreateEventPage from './pages/CreateEventPage'
import EventDetailsPage from './pages/EventDetailsPage'
import VenuesPage from './pages/VenuesPage'
import ProfilePage from './pages/ProfilePage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPanelPage from './pages/AdminPanelPage'
import PublicEventsPage from './pages/PublicEventsPage'

// Hooks
import { useAuth } from './hooks/useAuth'
import { useConfig } from './hooks/useConfig'
import { useAdminAuth } from './hooks/useAdminAuth'

// Services
import { configService } from './services/configService'

function App() {
  const { user, isLoading: authLoading } = useAuth()
  const { config, isLoading: configLoading } = useConfig()
  const { admin, isAuthenticated: isAdminAuthenticated } = useAdminAuth()
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Register service worker for PWA (production only)
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }
  }, [])

  // Show loading placeholder while config is loading
  if (configLoading) {
    return <ConfigLoadingPlaceholder type="home" />
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Offline indicator */}
        {!isOnline && (
          <div className="bg-yellow-500 text-white text-center py-2 text-sm">
            You're offline. Some features may be limited.
          </div>
        )}

        <Routes>
          {/* Public routes */}
          <Route 
            path="/" 
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <HomePage />
              )
            } 
          />
          <Route 
            path="/login" 
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <RegisterPage />
              )
            } 
          />
          <Route path="/events" element={<PublicEventsPage />} />
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route 
            path="/admin" 
            element={
              isAdminAuthenticated ? (
                <AdminPanelPage />
              ) : (
                <Navigate to="/admin/login" replace />
              )
            } 
          />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              user ? (
                <Layout>
                  <DashboardPage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/events"
            element={
              <Layout>
                <EventsPage />
              </Layout>
            }
          />
          <Route
            path="/events/create"
            element={
              user ? (
                <CreateEventPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/events/:id"
            element={
              <Layout>
                <EventDetailsPage />
              </Layout>
            }
          />
          <Route
            path="/venues"
            element={
              user ? (
                <Layout>
                  <VenuesPage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/profile"
            element={
              user ? (
                <Layout>
                  <ProfilePage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </ErrorBoundary>
  )
}

export default App
