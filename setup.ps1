# Cat Management System - Setup Script for Windows
# ⚠️ DEPRECATED: This PowerShell script is deprecated. 
# Please use npm scripts instead: npm run dev, npm run stop, etc.
# See package.json and README.md for the new unified command structure.
# This script sets up the development environment

Write-Host "🐱 Cat Management System - Development Setup" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "⚠️  NOTICE: This PowerShell script is deprecated." -ForegroundColor Yellow
Write-Host "   Please use npm scripts instead:" -ForegroundColor Yellow
Write-Host "   npm run dev    # Start development environment" -ForegroundColor White
Write-Host "   npm run stop   # Stop services" -ForegroundColor White
Write-Host "   npm run logs   # View logs" -ForegroundColor White
Write-Host "   npm run help   # See all commands" -ForegroundColor White
Write-Host ""

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is available
try {
    $composeVersion = docker compose version
    Write-Host "✅ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not available" -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env" ".env.local" -ErrorAction SilentlyContinue
    Write-Host "✅ Please edit .env file with your configuration" -ForegroundColor Green
}

# Function to build and start services
function Start-Development {
    Write-Host "🚀 Starting development environment..." -ForegroundColor Blue
    
    # Build and start services
    docker compose up --build -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Development environment started successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📱 Application URLs:" -ForegroundColor Cyan
        Write-Host "   Cat Management: http://localhost:3000" -ForegroundColor White
        Write-Host "   New Pedigree:   http://localhost:3002" -ForegroundColor White
        Write-Host "   API Docs:       http://localhost:3001/api/docs" -ForegroundColor White
        Write-Host "   Nginx Proxy:    http://localhost" -ForegroundColor White
        Write-Host ""
        Write-Host "🛠️  Available commands:" -ForegroundColor Cyan
        Write-Host "   .\setup.ps1 logs    - View logs" -ForegroundColor White
        Write-Host "   .\setup.ps1 stop    - Stop all services" -ForegroundColor White
        Write-Host "   .\setup.ps1 restart - Restart all services" -ForegroundColor White
        Write-Host "   .\setup.ps1 clean   - Clean up everything" -ForegroundColor White
        Write-Host "   .\setup.ps1 test    - Test API endpoints" -ForegroundColor White
        Write-Host "   .\setup.ps1 status  - Check service status" -ForegroundColor White
    } else {
        Write-Host "❌ Failed to start development environment" -ForegroundColor Red
        exit 1
    }
}

# Function to show logs
function Show-Logs {
    Write-Host "📋 Showing logs..." -ForegroundColor Blue
    docker compose logs -f
}

# Function to stop services
function Stop-Services {
    Write-Host "🛑 Stopping all services..." -ForegroundColor Yellow
    docker compose down
    Write-Host "✅ All services stopped" -ForegroundColor Green
}

# Function to restart services
function Restart-Services {
    Write-Host "🔄 Restarting all services..." -ForegroundColor Blue
    docker compose restart
    Write-Host "✅ All services restarted" -ForegroundColor Green
}

# Function to clean up
function Clean-Environment {
    Write-Host "🧹 Cleaning up environment..." -ForegroundColor Yellow
    Write-Host "⚠️  This will remove all containers, volumes, and images!" -ForegroundColor Red
    $confirmation = Read-Host "Are you sure? (y/N)"
    
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        docker compose down -v --rmi all
        if ($LASTEXITCODE -eq 0) {
            docker system prune -f
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Environment cleaned up" -ForegroundColor Green
            } else {
                Write-Host "❌ System prune failed" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Docker compose down failed" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Cleanup cancelled" -ForegroundColor Yellow
    }
}

# Function to setup production environment
function Setup-Production {
    Write-Host "🏭 Setting up production environment..." -ForegroundColor Blue
    
    if (-not (Test-Path ".env.production")) {
        Write-Host "❌ .env.production file not found!" -ForegroundColor Red
        Write-Host "Please create .env.production with your production configuration" -ForegroundColor Yellow
        exit 1
    }
    
    docker compose -f docker-compose.production.yml up --build -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Production environment started successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to start production environment" -ForegroundColor Red
        exit 1
    }
}

# Function to run database migrations
function Run-Migrations {
    Write-Host "🗃️  Running database migrations..." -ForegroundColor Blue
    docker compose exec backend npm run prisma:migrate
    if ($LASTEXITCODE -eq 0) {
        docker compose exec backend npm run prisma:generate
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database migrations completed" -ForegroundColor Green
        } else {
            Write-Host "❌ Prisma generate failed" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Database migration failed" -ForegroundColor Red
    }
}

# Function to seed database
function Seed-Database {
    Write-Host "🌱 Seeding database..." -ForegroundColor Blue
    docker compose exec backend npm run seed
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database seeded" -ForegroundColor Green
    } else {
        Write-Host "❌ Database seeding failed" -ForegroundColor Red
    }
}

# Function to test API endpoints
function Test-API {
    Write-Host "🔍 Testing API endpoints..." -ForegroundColor Blue
    
    # Test health endpoint
    try {
        Write-Host "Testing health endpoint..." -ForegroundColor Yellow
        $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get -TimeoutSec 10
        Write-Host "✅ Health endpoint: OK" -ForegroundColor Green
        Write-Host "   Response: $($health | ConvertTo-Json -Compress)" -ForegroundColor White
    } catch {
        Write-Host "❌ Health endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test cats endpoint
    try {
        Write-Host "Testing cats endpoint..." -ForegroundColor Yellow
        $cats = Invoke-RestMethod -Uri "http://localhost:3001/api/cats" -Method Get -TimeoutSec 10
        Write-Host "✅ Cats endpoint: OK ($($cats.Count) cats found)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Cats endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test users endpoint
    try {
        Write-Host "Testing users endpoint..." -ForegroundColor Yellow
        $users = Invoke-RestMethod -Uri "http://localhost:3001/api/users" -Method Get -TimeoutSec 10
        Write-Host "✅ Users endpoint: OK ($($users.Count) users found)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Users endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "🔍 API testing completed" -ForegroundColor Blue
}

# Function to check service status
function Check-Status {
    Write-Host "📊 Checking service status..." -ForegroundColor Blue
    
    # Check Docker services
    $services = docker compose ps --format json | ConvertFrom-Json
    foreach ($service in $services) {
        $status = if ($service.State -eq "running") { "OK" } else { "ERROR" }
        $color = if ($service.State -eq "running") { "Green" } else { "Red" }
        Write-Host "   [$status] $($service.Service): $($service.State)" -ForegroundColor $color
    }
    
    # Check endpoints
    Write-Host ""
    Write-Host "🌐 Checking endpoints..." -ForegroundColor Blue
    
    $endpoints = @(
        @{ Name = "Cat Management Frontend"; Url = "http://localhost:3000" },
        @{ Name = "New Pedigree Frontend"; Url = "http://localhost:3002" },
        @{ Name = "Backend API"; Url = "http://localhost:3001/health" },
        @{ Name = "Nginx Proxy"; Url = "http://localhost" }
    )
    
    foreach ($endpoint in $endpoints) {
        try {
            $response = Invoke-WebRequest -Uri $endpoint.Url -Method Get -TimeoutSec 5 -UseBasicParsing
            Write-Host "   [OK] $($endpoint.Name): Accessible (Status: $($response.StatusCode))" -ForegroundColor Green
        } catch {
            Write-Host "   [ERROR] $($endpoint.Name): Not accessible" -ForegroundColor Red
        }
    }
}

# Main script logic
$Command = $args[0]
if (-not $Command) { $Command = "start" }

switch ($Command.ToLower()) {
    "start" { Start-Development }
    "logs" { Show-Logs }
    "stop" { Stop-Services }
    "restart" { Restart-Services }
    "clean" { Clean-Environment }
    "production" { Setup-Production }
    "migrate" { Run-Migrations }
    "seed" { Seed-Database }
    "test" { Test-API }
    "status" { Check-Status }
    default {
        Write-Host "Usage: .\setup.ps1 [command]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Available commands:" -ForegroundColor Cyan
        Write-Host "  start      - Start development environment (default)" -ForegroundColor White
        Write-Host "  logs       - Show service logs" -ForegroundColor White
        Write-Host "  stop       - Stop all services" -ForegroundColor White
        Write-Host "  restart    - Restart all services" -ForegroundColor White
        Write-Host "  clean      - Clean up everything" -ForegroundColor White
        Write-Host "  production - Start production environment" -ForegroundColor White
        Write-Host "  migrate    - Run database migrations" -ForegroundColor White
        Write-Host "  seed       - Seed database with sample data" -ForegroundColor White
        Write-Host "  test       - Test API endpoints" -ForegroundColor White
        Write-Host "  status     - Check service and endpoint status" -ForegroundColor White
    }
}
