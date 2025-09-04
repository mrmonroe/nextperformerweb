import { useParams } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, Star } from 'lucide-react'

export default function EventDetailsPage() {
  const { id } = useParams()

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="card-content">
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Event Details
              </h1>
              <p className="text-gray-600">
                Event ID: {id}
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Event details page coming soon...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
