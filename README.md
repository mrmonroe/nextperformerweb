# Next Performer - Progressive Web App

A mobile-first Progressive Web App (PWA) for discovering and managing open mic events. Built with React, Node.js, PostgreSQL, and Docker.

## 🚀 Features

- **Progressive Web App**: Installable on mobile devices with offline capabilities
- **Mobile-First Design**: Optimized for mobile devices with responsive design
- **Configuration-Driven**: All content and features driven by configuration files
- **Real-time Updates**: Live data synchronization
- **Authentication**: Secure user authentication with JWT
- **Event Management**: Create, edit, and manage events
- **Venue Management**: Discover and manage venues
- **Profile Management**: User profiles and settings
- **Offline Support**: Works offline with service worker caching

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **PWA** - Progressive Web App features

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **Knex.js** - SQL query builder
- **JWT** - Authentication
- **Joi** - Validation
- **bcryptjs** - Password hashing

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (production)

## 📁 Project Structure

```
web/
├── frontend/                 # React PWA frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   ├── package.json
│   ├── vite.config.js      # Vite configuration
│   └── Dockerfile
├── backend/                # Node.js API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── migrations/     # Database migrations
│   │   └── seeds/          # Database seeds
│   ├── package.json
│   └── Dockerfile
├── config/                 # Configuration files
│   └── app.config.js      # App configuration
├── database/               # Database files
│   └── init/              # Database initialization
├── docker-compose.yml     # Docker Compose configuration
├── env.example            # Environment variables example
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL (for local development)

### Using Docker (Recommended)

1. **Clone and navigate to the project**
   ```bash
   cd web
   ```

2. **Copy environment variables**
   ```bash
   cp env.example .env
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec backend npm run migrate
   ```

5. **Seed the database (optional)**
   ```bash
   docker-compose exec backend npm run seed
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Local Development

1. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

2. **Start PostgreSQL**
   ```bash
   # Using Docker
   docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

4. **Run database migrations**
   ```bash
   cd backend
   npm run migrate
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## 🔧 Configuration

The app uses a configuration-driven architecture. All content, features, and settings are managed through configuration files:

### App Configuration (`config/app.config.js`)

- App metadata (name, version, environment)
- API settings (base URL, timeout, retry attempts)
- Database configuration
- Authentication settings
- UI theme and styling
- Feature flags
- Content and copy
- Validation messages

### Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Environment (development/production)
- `PORT` - Backend port (default: 3001)
- `CORS_ORIGIN` - Frontend URL for CORS

## 📱 PWA Features

### Installation
- **Mobile**: Add to home screen from browser
- **Desktop**: Install button in browser address bar
- **Offline**: Works without internet connection

### Service Worker
- Caches API responses for offline access
- Caches static assets
- Background sync for form submissions
- Push notifications (configurable)

### Manifest
- App name, description, and icons
- Theme colors and display mode
- Start URL and scope
- Orientation preferences

## 🗄️ Database Schema

### Users
- `id` - UUID primary key
- `email` - Unique email address
- `password_hash` - Hashed password
- `first_name`, `last_name` - User names
- `display_name` - Public display name
- `bio` - User biography
- `avatar_url` - Profile picture URL
- `is_verified` - Email verification status
- `created_at`, `updated_at` - Timestamps

### Venues
- `id` - UUID primary key
- `name` - Venue name
- `description` - Venue description
- `address`, `city`, `state`, `zip_code` - Location
- `phone`, `website` - Contact information
- `latitude`, `longitude` - GPS coordinates
- `is_active` - Soft delete flag
- `created_at`, `updated_at` - Timestamps

### Events
- `id` - UUID primary key
- `title` - Event title
- `description` - Event description
- `venue_id` - Foreign key to venues
- `created_by` - Foreign key to users
- `event_date`, `start_time`, `end_time` - Timing
- `is_spotlight` - Featured event flag
- `max_attendees` - Capacity limit
- `image_url` - Event image
- `is_active` - Soft delete flag
- `created_at`, `updated_at` - Timestamps

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/change-password` - Change password

### Events
- `GET /api/events` - List events (with pagination, search, filters)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (authenticated)
- `PUT /api/events/:id` - Update event (authenticated)
- `DELETE /api/events/:id` - Delete event (authenticated)

### Venues
- `GET /api/venues` - List venues (with pagination, search, filters)
- `GET /api/venues/:id` - Get venue details
- `POST /api/venues` - Create venue (authenticated)
- `PUT /api/venues/:id` - Update venue (authenticated)
- `DELETE /api/venues/:id` - Delete venue (authenticated)

### Users
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)

### Configuration
- `GET /api/config` - Get app configuration

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Run all tests with Docker
docker-compose exec backend npm test
```

## 🚀 Deployment

### Production with Docker

1. **Build production images**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
   ```

2. **Start production services**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://yourdomain.com
```

## 📊 Performance

- **Lighthouse Score**: 90+ on all metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

## 🔒 Security

- JWT authentication with secure tokens
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation and sanitization
- SQL injection prevention with Knex.js
- XSS protection with helmet.js

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
4. Contact the development team

## 🔄 Updates

The app is designed for easy updates:

- **Configuration Changes**: Update config files without code changes
- **Content Updates**: Modify content configuration for new copy
- **Feature Rollouts**: Use feature flags for gradual rollouts
- **A/B Testing**: Built-in support for A/B testing different configurations

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
