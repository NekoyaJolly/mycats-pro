#!/bin/bash

# Cat Management System - Setup Script
# This script sets up the development environment

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "${GREEN}🐱 Cat Management System - Development Setup${NC}"
echo -e "${GREEN}=============================================${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo -e "${YELLOW}Please install Docker from https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker found: $(docker --version)${NC}"

# Check if Docker Compose is available
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not available${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker Compose found: $(docker compose version)${NC}"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 .env file not found. Please create it from the template${NC}"
    echo -e "${GREEN}✅ Please edit .env file with your configuration${NC}"
fi

# Function to start development environment
start_development() {
    echo -e "${BLUE}🚀 Starting development environment...${NC}"
    
    # Build and start services
    docker compose up --build -d
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Development environment started successfully!${NC}"
        echo ""
        echo -e "${CYAN}📱 Application URLs:${NC}"
        echo -e "${WHITE}   Cat Management: http://localhost:3000${NC}"
        echo -e "${WHITE}   New Pedigree:   http://localhost:3002${NC}"
        echo -e "${WHITE}   API Docs:       http://localhost:3001/api/docs${NC}"
        echo -e "${WHITE}   Nginx Proxy:    http://localhost${NC}"
        echo ""
        echo -e "${CYAN}🛠️  Available commands:${NC}"
        echo -e "${WHITE}   ./setup.sh logs    - View logs${NC}"
        echo -e "${WHITE}   ./setup.sh stop    - Stop all services${NC}"
        echo -e "${WHITE}   ./setup.sh restart - Restart all services${NC}"
        echo -e "${WHITE}   ./setup.sh clean   - Clean up everything${NC}"
    else
        echo -e "${RED}❌ Failed to start development environment${NC}"
        exit 1
    fi
}

# Function to show logs
show_logs() {
    echo -e "${BLUE}📋 Showing logs...${NC}"
    docker compose logs -f
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    docker compose down
    echo -e "${GREEN}✅ All services stopped${NC}"
}

# Function to restart services
restart_services() {
    echo -e "${BLUE}🔄 Restarting all services...${NC}"
    docker compose restart
    echo -e "${GREEN}✅ All services restarted${NC}"
}

# Function to clean up
clean_environment() {
    echo -e "${YELLOW}🧹 Cleaning up environment...${NC}"
    echo -e "${RED}⚠️  This will remove all containers, volumes, and images!${NC}"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose down -v --rmi all
        docker system prune -f
        echo -e "${GREEN}✅ Environment cleaned up${NC}"
    else
        echo -e "${YELLOW}❌ Cleanup cancelled${NC}"
    fi
}

# Function to setup production environment
setup_production() {
    echo -e "${BLUE}🏭 Setting up production environment...${NC}"
    
    if [ ! -f ".env.production" ]; then
        echo -e "${RED}❌ .env.production file not found!${NC}"
        echo -e "${YELLOW}Please create .env.production with your production configuration${NC}"
        exit 1
    fi
    
    docker compose -f docker-compose.production.yml up --build -d
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Production environment started successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to start production environment${NC}"
        exit 1
    fi
}

# Function to run database migrations
run_migrations() {
    echo -e "${BLUE}🗃️  Running database migrations...${NC}"
    docker compose exec backend npm run prisma:migrate
    docker compose exec backend npm run prisma:generate
    echo -e "${GREEN}✅ Database migrations completed${NC}"
}

# Function to seed database
seed_database() {
    echo -e "${BLUE}🌱 Seeding database...${NC}"
    docker compose exec backend npm run seed
    echo -e "${GREEN}✅ Database seeded${NC}"
}

# Function to show help
show_help() {
    echo "Usage: ./setup.sh [command]"
    echo ""
    echo -e "${CYAN}Available commands:${NC}"
    echo -e "${WHITE}  start      - Start development environment (default)${NC}"
    echo -e "${WHITE}  logs       - Show service logs${NC}"
    echo -e "${WHITE}  stop       - Stop all services${NC}"
    echo -e "${WHITE}  restart    - Restart all services${NC}"
    echo -e "${WHITE}  clean      - Clean up everything${NC}"
    echo -e "${WHITE}  production - Start production environment${NC}"
    echo -e "${WHITE}  migrate    - Run database migrations${NC}"
    echo -e "${WHITE}  seed       - Seed database with sample data${NC}"
    echo -e "${WHITE}  help       - Show this help message${NC}"
}

# Main script logic
case "${1:-start}" in
    "start")
        start_development
        ;;
    "logs")
        show_logs
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "clean")
        clean_environment
        ;;
    "production")
        setup_production
        ;;
    "migrate")
        run_migrations
        ;;
    "seed")
        seed_database
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
