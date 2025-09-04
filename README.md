# Next Performer

A configuration-driven web application with admin panel and role-based access control (RBAC) for managing open mic events and venues.

## Features

- 🎤 **Event Management**: Create and manage open mic events
- 🏢 **Venue Management**: Manage venues and their details
- 👥 **User Management**: Complete user management with role assignment
- 🔐 **Role-Based Access Control**: Configurable roles and permissions
- ⚙️ **Configuration-Driven**: All content and features configurable via admin panel
- 🔒 **Secure Admin Panel**: Protected admin interface for system management
- 📱 **Progressive Web App**: Mobile-first design with offline capabilities
- 🐳 **Dockerized**: Complete containerized development environment

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- React Query for state management
- PWA capabilities with service worker

### Backend
- Node.js with Express
- PostgreSQL database
- Knex.js for database migrations
- JWT authentication
- Role-based access control

### Infrastructure
- Docker & Docker Compose
- PostgreSQL database
- Nginx (production ready)

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mrmonroe/nextperformerweb.git
   cd nextperformerweb
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3001
   - Admin Panel: http://localhost:3002/admin

### Default Admin Credentials
- Username: `admin`
- Password: `admin123`

## Configuration

The application is fully configuration-driven. All content, features, and settings can be managed through the admin panel:

- **App Settings**: Title, description, branding
- **Content Management**: Homepage content, copy, messaging
- **Feature Toggles**: Enable/disable features
- **User Roles**: Create and manage custom roles
- **Permissions**: Configure granular permissions

## User Roles

### Admin
- Full access to all features
- Admin panel access
- User and role management
- System configuration

### Host
- Event and venue management
- User management (non-admin)
- No admin panel access

### Performer
- View events and venues
- Sign up for events
- Profile management

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/config` - Get configuration
- `PUT /api/admin/config/:key` - Update configuration

### Users
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users/:id/roles` - Assign role to user
- `DELETE /api/admin/users/:id/roles/:roleId` - Remove role from user

### Roles
- `GET /api/admin/roles` - Get all roles
- `POST /api/admin/roles` - Create role
- `PUT /api/admin/roles/:id` - Update role
- `DELETE /api/admin/roles/:id` - Delete role

## Development

### Project Structure
```
web/
├── backend/           # Node.js/Express API
│   ├── src/
│   │   ├── config/    # Database configuration
│   │   ├── migrations/ # Database migrations
│   │   ├── routes/    # API routes
│   │   ├── services/  # Business logic
│   │   └── middleware/ # Express middleware
├── frontend/          # React application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/     # Page components
│   │   ├── hooks/     # Custom React hooks
│   │   └── services/  # API services
└── docker-compose.yml # Docker configuration
```

### Database Migrations
```bash
# Run migrations
docker-compose exec backend npx knex migrate:latest

# Rollback migrations
docker-compose exec backend npx knex migrate:rollback
```

### Adding New Features
1. Create database migrations if needed
2. Add backend API endpoints
3. Create frontend components
4. Update role permissions if needed
5. Add configuration options

## Security

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- SQL injection protection
- CORS configuration
- Environment variable protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub.

---

Built with ❤️ for the open mic community