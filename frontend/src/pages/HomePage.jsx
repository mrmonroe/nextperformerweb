import { Link } from 'react-router-dom'
import { Mic, Calendar, MapPin, Users, ArrowRight, Star } from 'lucide-react'
import { useConfig } from '../hooks/useConfig'
import { useAuth } from '../hooks/useAuth'
import ConfigLoadingPlaceholder from '../components/ConfigLoadingPlaceholder'
import PublicNavbar from '../components/PublicNavbar'

export default function HomePage() {
  const { config, isLoading: configLoading } = useConfig()
  const { isAuthenticated } = useAuth()

  // Show loading placeholder while config is loading
  if (configLoading) {
    return <ConfigLoadingPlaceholder type="home" />
  }

  const features = config?.content?.copy?.homepage?.features || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Navigation */}
      <PublicNavbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative py-20 lg:py-32">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="p-4 bg-primary rounded-full">
                  <Mic className="h-16 w-16 text-white" />
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                {config?.content?.copy?.homepage?.heroTitle || config?.content?.branding?.title || ''}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {config?.content?.copy?.homepage?.heroSubtitle || config?.content?.branding?.tagline || ''}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!isAuthenticated && (
                  <Link
                    to="/register"
                    className="btn-primary btn-lg px-8 py-4 text-lg font-semibold"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                )}
                
                <Link
                  to="/events"
                  className="btn-secondary btn-lg px-8 py-4 text-lg font-semibold"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  View Events
                </Link>
                
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="btn-outline btn-lg px-8 py-4 text-lg font-semibold"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {config?.content?.copy?.homepage?.whyChooseTitle || ''}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {config?.content?.copy?.homepage?.whyChooseSubtitle || ''}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              // Map feature titles to icons
              const iconMap = {
                'Discover Events': Calendar,
                'Find Venues': MapPin,
                'Connect': Users,
                'Showcase Talent': Star
              }
              const Icon = iconMap[feature.title] || Calendar
              
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4 group-hover:bg-primary-200 transition-colors">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {config?.content?.copy?.homepage?.ctaTitle || ''}
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            {config?.content?.copy?.homepage?.ctaSubtitle || ''}
          </p>
          <Link
            to="/register"
            className="btn-secondary btn-lg px-8 py-4 text-lg font-semibold"
          >
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Mic className="h-8 w-8 text-primary" />
              <span className="ml-2 text-2xl font-bold">
                {config?.app?.name || ''}
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              {config?.app?.description || ''}
            </p>
            <p className="text-sm text-gray-500">
              © 2024 {config?.app?.name || ''}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
