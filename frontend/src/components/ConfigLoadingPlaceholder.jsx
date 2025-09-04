export default function ConfigLoadingPlaceholder({ type = 'page' }) {
  if (type === 'page') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          {/* Header Placeholder */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-gray-200 rounded-full animate-pulse">
                <div className="h-12 w-12 bg-gray-300 rounded"></div>
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
          </div>
          
          {/* Form Placeholder */}
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        {/* Hero Section Placeholder */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative py-20 lg:py-32">
              <div className="text-center">
                <div className="flex justify-center mb-8">
                  <div className="p-4 bg-gray-200 rounded-full animate-pulse">
                    <div className="h-16 w-16 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="h-12 bg-gray-200 rounded animate-pulse mb-4 mx-auto max-w-2xl"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-8 mx-auto max-w-xl"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse mx-auto max-w-xs"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section Placeholder */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 mx-auto max-w-md"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto max-w-2xl"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gray-200 rounded-full animate-pulse">
                      <div className="h-8 w-8 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'layout') {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar Placeholder */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Content Placeholder */}
        <div className="flex-1 p-8">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-6 w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="loading-spinner" />
    </div>
  )
}
