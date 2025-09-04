#!/bin/bash

# Next Performer PWA Startup Script

echo "🚀 Starting Next Performer Progressive Web App..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please review and update the configuration if needed."
fi

# Start services
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if backend is healthy
echo "🔍 Checking backend health..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend is not responding yet, but containers are starting..."
fi

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec -T backend npm run migrate

# Seed database (optional)
echo "🌱 Seeding database..."
docker-compose exec -T backend npm run seed

echo ""
echo "🎉 Next Performer PWA is now running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "🗄️  Database: localhost:5432"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart services: docker-compose restart"
echo "  - Run migrations: docker-compose exec backend npm run migrate"
echo "  - Seed database: docker-compose exec backend npm run seed"
echo ""
echo "🔗 Open http://localhost:3000 in your browser to get started!"
