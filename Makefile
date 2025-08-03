# Cat Management System - Docker Commands

# Build and start all services
up:
	docker-compose up -d

# Build and start with logs
up-logs:
	docker-compose up

# Stop all services
down:
	docker-compose down

# Stop and remove volumes
down-volumes:
	docker-compose down -v

# Build all images
build:
	docker-compose build

# Build without cache
build-no-cache:
	docker-compose build --no-cache

# View logs
logs:
	docker-compose logs -f

# View specific service logs
logs-backend:
	docker-compose logs -f backend

logs-frontend-cat:
	docker-compose logs -f frontend-cat-management

logs-frontend-pedigree:
	docker-compose logs -f frontend-new-pedigree

logs-postgres:
	docker-compose logs -f postgres

logs-nginx:
	docker-compose logs -f nginx

# Database operations
db-migrate:
	docker-compose exec backend npm run prisma:migrate

db-generate:
	docker-compose exec backend npm run prisma:generate

db-studio:
	docker-compose exec backend npm run prisma:studio

db-seed:
	docker-compose exec backend npm run seed

# Development helpers
shell-backend:
	docker-compose exec backend sh

shell-postgres:
	docker-compose exec postgres psql -U catuser -d catmanagement

# Clean up
clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

# Production build
prod-build:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

prod-up:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Health check
health:
	@echo "Checking service health..."
	@curl -f http://localhost/health || echo "Main app: DOWN"
	@curl -f http://localhost:3001/api/v1/health || echo "Backend API: DOWN"
	@echo "Health check completed"
