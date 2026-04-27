# SIWES Connect Deployment Guide

## Pre-Deployment Checklist

- [ ] Database configured (PostgreSQL 13+)
- [ ] Environment variables filled in
- [ ] Third-party services configured (SendGrid, Cloudinary)
- [ ] SSL certificates in place (for production)
- [ ] Secrets manager setup (vault, AWS Secrets Manager, etc.)
- [ ] Monitoring configured (error tracking, logs)
- [ ] Backups configured for database

## Database Setup

### Local Development
Database is started via Docker Compose:
```bash
docker compose up -d
npx prisma migrate dev
```

### Production Deployment

#### 1. PostgreSQL Setup
- Create a managed PostgreSQL instance (AWS RDS, Google Cloud SQL, DigitalOcean, etc.)
- Ensure SSL/TLS connections are enforced
- Backup strategy enabled (automated daily backups)
- Connection pooling enabled for high traffic (PgBouncer, pgpool)

#### 2. Create Initial Database
```bash
# Via SSH/bastion host
psql -h <db-host> -U postgres
CREATE DATABASE siwes_production;
GRANT ALL PRIVILEGES ON DATABASE siwes_production TO <app-user>;
```

#### 3. Apply Migrations
```bash
export DATABASE_URL="postgresql://<user>:<password>@<host>:5432/siwes_production"
npx prisma migrate deploy
```

#### 4. Seed Initial Data (Optional)
Create seed script in `backend/prisma/seed.ts` for:
- Default institutions
- Initial announcements
- Test users (if development/staging)

## Third-Party Services

### SendGrid Email Service

1. **Create Account**
   - Go to sendgrid.com
   - Create free tier account (~100 emails/day)

2. **Generate API Key**
   - Settings → API Keys → Create API Key
   - Copy to `SENDGRID_API_KEY`

3. **Verify Sender Email**
   - Settings → Sender Authentication
   - Add verified sender domain or email
   - Set `SENDGRID_FROM_EMAIL` to verified address

4. **Create Email Templates** (Optional)
   - Dynamic Templates → Create Template
   - Templates used: email verification, password reset, announcements

### Cloudinary File Uploads

1. **Create Account**
   - Go to cloudinary.com
   - Create free tier account (25GB storage)

2. **Get Credentials**
   - Dashboard → Account
   - Copy Cloud Name, API Key, API Secret

3. **Create Folders** (for organization)
   - Media Library → Folders
   - Create: `resumes`, `documents`, `avatars`

4. **Setup Upload Presets** (Optional)
   - Settings → Upload → Upload Presets
   - Create presets for each file type with validation

## Environment Variables

### Backend `.env`

```env
# Database
DATABASE_URL=postgresql://user:password@db-host:5432/siwes_production

# JWT (use strong random strings from `openssl rand -base64 32`)
JWT_SECRET=your-strong-random-secret-string-here
JWT_REFRESH_SECRET=your-strong-random-refresh-secret-string-here

# Email (SendGrid)
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# File Uploads (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Security
COORDINATOR_INVITE_CODE=STRONG_INVITE_CODE_WITH_NUMBERS_AND_LETTERS

# Frontend URL (for CORS and Socket.io)
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# Node Environment
NODE_ENV=production

# Optional: Logging
LOG_LEVEL=info
```

### Frontend `.env.production`

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
FRONTEND_URL=https://yourdomain.com
```

## Building for Production

### Backend
```bash
cd backend
npm install --production
npx prisma generate
npm run build
```

### Frontend
```bash
cd frontend
npm install --production
npm run build
```

## Deployment Options

### Option 1: Docker + Kubernetes

```dockerfile
# backend/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci --production && npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

Deploy with Docker Compose or Kubernetes manifests.

### Option 2: PaaS (Recommended for MVP)

#### Vercel (Frontend)
1. Connect repository to Vercel
2. Set frontend environment variables
3. Auto-deploys on push to main

#### Railway/Render (Backend)
1. Connect repository
2. Select backend workspace
3. Set backend environment variables
4. Set build command: `npm run build`
5. Set start command: `npm start`

#### Database Hosting
- AWS RDS
- Google Cloud SQL
- DigitalOcean Managed Databases
- Railway PostgreSQL

### Option 3: Traditional VPS

1. **Server Setup**
   ```bash
   # Ubuntu 22.04 LTS
   apt update && apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   apt install -y nodejs postgresql-client
   ```

2. **Deploy Backend**
   ```bash
   git clone <repo> /opt/siwes-backend
   cd /opt/siwes-backend
   npm install --production
   npm run build
   ```

3. **Process Manager** (PM2)
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name "siwes-api"
   pm2 save
   pm2 startup
   ```

4. **Reverse Proxy** (Nginx)
   ```nginx
   server {
     listen 443 ssl;
     server_name api.yourdomain.com;
     
     location / {
       proxy_pass http://localhost:3001;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
     }
   }
   ```

## Socket.io Configuration

### Production Considerations
- CORS must match frontend URL
- Use connection pooling for WebSocket connections
- Consider sticky sessions for load balancing
- Monitor WebSocket connection metrics

### Redis Adapter (for multiple backend instances)
```bash
npm install socket.io-redis
```

Update `backend/src/sockets/index.ts`:
```typescript
import { createAdapter } from "@socket.io/redis-adapter";

const pubClient = createRedisClient();
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

## Cron Job Configuration

### Single Server
Jobs run in the main API process (current setup). Safe for single-server deployments.

### Multiple Servers
For horizontal scaling, migrate to external job queue:
- Bull (Redis-backed)
- AWS Lambda
- Google Cloud Tasks
- Kue

## Monitoring & Logging

### Application Monitoring
- Error tracking: Sentry, LogRocket, or Rollbar
- Performance: New Relic, DataDog, or AppDynamics
- Uptime: StatusPage.io or UptimeRobot

### Logs
- Centralize logs: ELK Stack, CloudWatch, or LogRocket
- Alert on errors/warnings
- Archive logs for 30+ days

### Database Monitoring
- Query performance
- Connection pool usage
- Disk space

## SSL/TLS Certificates

### Using Let's Encrypt
```bash
apt install certbot python3-certbot-nginx
certbot certonly --nginx -d yourdomain.com -d api.yourdomain.com
```

### Renewal
```bash
systemctl enable certbot.timer
systemctl start certbot.timer
```

## Scaling Considerations

### Horizontal Scaling
- API servers: Stateless, can scale up/down freely
- Database: Use managed services with failover
- File uploads: Cloudinary handles distribution
- Real-time: Add Redis adapter for Socket.io

### Performance Tuning
- Database connection pooling
- Frontend static asset CDN
- Backend response caching (Redis)
- Compression (gzip)
- Database query optimization

## Backup & Disaster Recovery

### Database Backups
- Automated daily backups (managed service)
- Point-in-time recovery enabled
- Test restore procedure monthly

### Application Code
- All code in version control
- Deployments from tagged releases
- Quick rollback capability

### File Uploads
- Cloudinary handles redundancy
- Download/archive important files regularly

## Security Hardening

### Environment
- Secrets never in version control
- Use secrets manager for credentials
- Limit SSH access
- Enable firewall rules
- Regular security patches

### Application
- Rate limiting (configured)
- HELMET security headers (configured)
- CSRF protection (if adding forms)
- SQL injection prevention (Prisma handles this)
- XSS protection (React/Next.js handles this)

### API
- All endpoints require HTTPS
- API key rotation strategy
- Request signing (if needed)
- Audit logging (configured)

## Post-Deployment

1. **Smoke Tests**
   - Login flow works
   - File uploads work
   - Email delivery works
   - Real-time notifications work

2. **Performance Baseline**
   - Record response times
   - Database query times
   - WebSocket latency

3. **Monitoring Setup**
   - Alerts configured
   - Dashboards created
   - On-call rotation established

4. **Documentation**
   - Runbook for common issues
   - Escalation procedures
   - Contact information

## Troubleshooting

### Common Issues

**Database Connection Refused**
```bash
# Check PostgreSQL is running and accessible
psql -h <host> -U <user> -c "SELECT 1"
# Verify DATABASE_URL is correct
echo $DATABASE_URL
```

**Email Not Sending**
```bash
# Check SENDGRID_API_KEY is set
# Check sender email is verified
# Check logs for SendGrid API errors
```

**File Uploads Failing**
```bash
# Check Cloudinary credentials
# Check file size limits
# Check CORS configuration
```

**Socket.io Connection Issues**
```bash
# Check FRONTEND_URL matches
# Check WebSocket port is open
# Check CORS headers
```

## Rollback Procedure

If deployment fails:
```bash
# 1. Revert to previous version
git checkout <previous-tag>

# 2. Rebuild
npm run build

# 3. Reapply previous database state (if schema changed)
npx prisma migrate resolve --rolled-back <migration-name>

# 4. Restart services
pm2 restart siwes-api
```

## Support & Monitoring

- Error tracking: Set up alerts for critical errors
- Database: Monitor disk usage and connection counts
- API: Monitor response times and error rates
- Frontend: Monitor Core Web Vitals
- On-call: Establish escalation procedures
