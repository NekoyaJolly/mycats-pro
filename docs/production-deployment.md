# 🚀 Production Deployment Guide

This guide provides step-by-step instructions for deploying the Cat Management System to a production environment.

## 📋 Pre-Deployment Checklist

### ✅ Security Requirements

- [ ] All dependencies updated to latest secure versions
- [ ] Environment variables properly configured
- [ ] CORS origins set to production domains only
- [ ] JWT secrets are strong (32+ characters)
- [ ] Database credentials are secure
- [ ] HTTPS is enforced
- [ ] Security headers are enabled

### ✅ Infrastructure Requirements

- [ ] Node.js 20.x or 22.x installed
- [ ] PostgreSQL 15+ running and accessible
- [ ] Reverse proxy (nginx) configured
- [ ] SSL certificates installed
- [ ] Firewall rules configured
- [ ] Monitoring tools setup

## 🔧 Environment Configuration

1. **Create production environment file**:

   ```bash
   cp .env.production.example .env.production
   ```

2. **Configure required variables**:

   ```bash
   # Database
   DATABASE_URL="postgresql://user:password@host:5432/mycats_prod"

   # Security
   JWT_SECRET="your-256-bit-production-secret-key-here"
   NODE_ENV=production

   # Network
   PORT=3004
   CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com"

   # Health checks
   HEALTH_CHECK_DATABASE=true
   ```

3. **Validate configuration**:
   ```bash
   node -e "
   require('dotenv').config({ path: '.env.production' });
   const { validateProductionEnvironment } = require('./backend/dist/common/environment.validation');
   try {
     validateProductionEnvironment();
     console.log('✅ Environment validation passed');
   } catch (error) {
     console.error('❌ Environment validation failed:', error.message);
     process.exit(1);
   }
   "
   ```

## 🏗️ Build Process

1. **Run production build**:

   ```bash
   ./scripts/build-production.sh
   ```

2. **Apply database migrations**:

   ```bash
   pnpm -w run db:deploy
   ```

3. **Verify build outputs**:
   ```bash
   ls -la backend/dist/
   ls -la frontend/.next/
   ```

## 🚀 Deployment Steps

### 1. Pre-deployment Verification

```bash
# Security audit
pnpm audit --audit-level moderate

# Health check endpoint test
curl -f http://localhost:3004/health || echo "Health check failed"

# Database connectivity test
pnpm -w run test:api
```

### 2. Application Startup

```bash
# Start backend (production mode)
cd backend && NODE_ENV=production node dist/main.js

# Start frontend (production mode)
cd frontend && npm run start
```

### 3. Post-deployment Verification

```bash
# Verify API is responding
curl -f https://yourdomain.com/health

# Check application logs
tail -f logs/application.log

# Monitor system resources
htop
```

## 🔒 Security Hardening

### 1. Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. Firewall Configuration

```bash
# Allow only necessary ports
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP (redirect)
ufw allow 443/tcp  # HTTPS
ufw enable
```

## 📊 Monitoring Setup

### 1. Application Monitoring

```bash
# Health check cron job
echo "*/5 * * * * curl -f https://yourdomain.com/health || echo 'Health check failed' | mail -s 'API Health Alert' admin@yourdomain.com" | crontab -
```

### 2. Log Monitoring

```bash
# Application logs
tail -f /var/log/mycats/application.log

# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

## 🔄 Maintenance Procedures

### 1. Updates and Patches

```bash
# Security updates
pnpm audit
pnpm update

# Rebuild and redeploy
./scripts/build-production.sh
```

### 2. Database Maintenance

```bash
# Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Apply new migrations
pnpm -w run db:deploy
```

### 3. Log Rotation

```bash
# Setup logrotate for application logs
cat > /etc/logrotate.d/mycats << EOF
/var/log/mycats/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 www-data www-data
    sharedscripts
    postrotate
        systemctl reload nginx
    endscript
}
EOF
```

## 🚨 Incident Response

### 1. Application Not Starting

```bash
# Check logs
journalctl -u mycats-api -n 50

# Verify environment
env | grep -E "(DATABASE_URL|JWT_SECRET|NODE_ENV)"

# Test database connection
psql $DATABASE_URL -c "SELECT 1"
```

### 2. High Memory Usage

```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head -10

# Restart services if needed
systemctl restart mycats-api
systemctl restart nginx
```

### 3. Database Connection Issues

```bash
# Check PostgreSQL status
systemctl status postgresql

# Check connection limits
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Reset connections if needed
systemctl restart postgresql
```

## 📞 Support Contacts

- **Technical Lead**: [contact information]
- **Database Admin**: [contact information]
- **DevOps Team**: [contact information]

## 📚 Additional Resources

- [System Design Documentation](./docs/system-design.md)
- [Operations Manual](./docs/operations.md)
- [API Documentation](./docs/api-specification.md)
- [Troubleshooting Guide](./docs/troubleshooting.md)
