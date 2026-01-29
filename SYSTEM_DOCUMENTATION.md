# MonitorHub - Production-Grade Website Health Monitoring Platform

A comprehensive SaaS system for monitoring website uptime, detecting incidents, and providing AI-powered analysis.

## 🏗 Architecture Overview

### Tech Stack
- **Frontend**: Next.js 16 with React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Cache/Locking**: Upstash Redis
- **AI Analysis**: Google Gemini API
- **Email**: Nodemailer with SMTP
- **Authentication**: JWT with refresh tokens
- **Validation**: Zod schema validation

### Core Features
1. **Monitor Health Checks** - HTTP checks every minute with 5s timeout
2. **Incident Detection** - Smart detection after 2 consecutive failures
3. **AI Analysis** - Gemini-powered root cause analysis and fix suggestions
4. **Email Alerts** - HTML-formatted alerts with 15-min cooldown
5. **Analytics** - Real-time KPIs and uptime calculations
6. **Admin Dashboard** - User management and system monitoring
7. **Cron Worker** - Batch processing with Redis locking

## 🔐 Security Features

### Authentication
- JWT access tokens (15 min expiry)
- JWT refresh tokens (7 day expiry)
- HttpOnly, Secure, SameSite=Strict cookies
- Bcrypt password hashing (12 salt rounds)
- Token rotation on refresh
- Refresh token invalidation on logout

### API Security
- Rate limiting (100 req/15 min per IP)
- CORS whitelist with origin validation
- Content Security Policy headers
- X-Frame-Options (clickjacking protection)
- HSTS enforcement (production)
- NoSQL injection prevention
- Input validation with Zod

### Data Protection
- Password hashing with bcrypt
- Sensitive data redaction in logs
- Secure error messages (no stack traces in prod)
- Database indexes for query performance

## 📊 Database Models

### User
```typescript
{
  name: string
  email: string (unique)
  passwordHash: string
  role: 'USER' | 'ADMIN'
  isActive: boolean
  notificationPreferences: {
    emailAlerts: boolean
    weeklyReport: boolean
    incident: boolean
  }
  lastLogin: Date
  lastRefreshToken: string (for token rotation)
  createdAt: Date
  updatedAt: Date
}
```

### Monitor
```typescript
{
  userId: ObjectId (ref: User)
  name: string
  url: string
  interval: number (60-3600 seconds)
  status: 'UP' | 'DOWN' | 'SLOW'
  isActive: boolean
  consecutiveFailures: number
  lastCheckedAt: Date
  lastStatusCode: number
  lastResponseTime: number
  createdAt: Date
  updatedAt: Date
}
```

### Incident
```typescript
{
  monitorId: ObjectId (ref: Monitor)
  userId: ObjectId (ref: User)
  startedAt: Date
  resolvedAt: Date
  durationSeconds: number
  status: 'ONGOING' | 'RESOLVED'
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  failureCount: number
  aiExplanation: string
  suggestedFix: string
  createdAt: Date
  updatedAt: Date
}
```

### HealthLog
```typescript
{
  monitorId: ObjectId (ref: Monitor)
  statusCode: number
  responseTime: number
  isUp: boolean
  errorMessage: string
  checkedAt: Date (TTL index: 30 days)
}
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/signup` - Create account
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/logout` - Logout and invalidate tokens

### Monitors
- `GET /api/monitors` - List user's monitors (with uptime stats)
- `POST /api/monitors` - Create monitor
- `GET /api/monitors/[id]` - Get monitor details + health history
- `PUT /api/monitors/[id]` - Update monitor
- `DELETE /api/monitors/[id]` - Delete monitor

### Incidents
- `GET /api/incidents` - List incidents (filterable by status)

### Analytics
- `GET /api/analytics` - Get KPIs (cached 30s)
  - Total monitors
  - Uptime % (24h)
  - Average response time
  - Incidents (24h)
  - Status breakdown

### Admin
- `GET /api/admin/users` - List all users (paginated)

## ⏱ Cron Job Flow

```
POST /api/cron/monitor (every 1 minute)
↓
Acquire Redis lock (prevents concurrent runs)
↓
Fetch active monitors
↓
Batch health checks (20 at a time)
  ├─ HTTP GET with 5s timeout
  ├─ Capture status code, response time
  ├─ Determine status (UP/SLOW/DOWN)
  └─ Store in HealthLog
↓
Update monitor status & consecutive failures
↓
Check incident logic:
  ├─ 2 consecutive failures → Create incident
  │  └─ AI analysis async (6s timeout)
  │  └─ Send downtime email (if not in cooldown)
  └─ Recovery (UP after DOWN) → Resolve incident
      └─ Send recovery email
↓
Release Redis lock
↓
Return results { success, processed, failed, durationMs }
```

## 🤖 AI Analysis Flow

```
Incident created
↓
Async call to Gemini API (6s timeout)
↓
Generate JSON with:
  - explanation (root cause)
  - severity (LOW/MEDIUM/HIGH)
  - suggestedFix (action to resolve)
↓
Fallback to heuristic analysis if timeout/failure
↓
Save to Incident document
```

## 📧 Email Alert System

### Cooldown Mechanism
- After alert sent, Redis cooldown key set for 15 minutes
- Prevents alert spam for same monitor
- Separate cooldown per monitor

### Email Types
1. **Welcome** - When user signs up
2. **Downtime Alert** - When monitor fails 2x
3. **Recovery Alert** - When monitor recovers

### Email Features
- HTML templates with branding
- Incident details
- AI-generated explanation
- Action links to dashboard
- Retry logic (2 attempts)

## 🔄 Health Check Engine

```typescript
checkMonitorHealth(url: string)
↓
Validate URL (http/https only)
↓
AbortController + 5s timeout
↓
Fetch with User-Agent header
↓
Determine status:
  ├─ < 3s & 2xx → UP
  ├─ 3s-5s → SLOW
  └─ ≥5s or error → DOWN
↓
Return { isUp, statusCode, responseTime, status, errorMessage }
```

## 📈 Dashboard Metrics

**KPI Cards:**
- Total Monitors (with active count)
- Uptime % (24h) with UP count
- Avg Response Time with DOWN count
- Incidents (24h) with ONGOING count

**Monitor Grid:**
- Status badge (UP/SLOW/DOWN)
- Response time
- Uptime percentage
- Latest status code

**Incident List:**
- Monitor name
- Start time
- Severity badge
- Status (ONGOING/RESOLVED)
- AI explanation

## 🛠 Development Setup

### Prerequisites
```
Node.js 18+
MongoDB Atlas or local MongoDB
Upstash Redis (optional)
Gmail or SMTP server
Google Gemini API key
```

### Environment Variables
```env
# Required
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key-min-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
GEMINI_API_KEY=...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=app-password

# Cron
CRON_SECRET=your-cron-secret
```

### Installation
```bash
npm install
npm run dev
```

### Running Cron Job Locally
```bash
curl -X POST http://localhost:3000/api/cron/monitor \
  -H "x-cron-secret: $CRON_SECRET"
```

## 🧪 Production Deployment

### Pre-flight Checks
- [ ] All environment variables configured
- [ ] MongoDB backups enabled
- [ ] Redis configured with persistence
- [ ] SMTP credentials verified
- [ ] CORS origins whitelisted
- [ ] JWT_SECRET is >32 chars and random
- [ ] HTTPS enabled
- [ ] Rate limiting tested

### Deployment Steps
1. Set `NODE_ENV=production`
2. Run database migrations/indexes
3. Deploy to hosting (Vercel, Railway, etc.)
4. Configure cron job trigger
5. Monitor error logs
6. Test incident flow end-to-end

### Health Checks
```bash
# API health
GET /api/auth/me

# Cron job status
GET /api/cron/monitor logs

# Database connection
mongodb connectivity check

# Redis connection
redis ping
```

## 📋 Performance Optimizations

- **MongoDB Indexes**: Optimized for queries in filters
- **Lean Queries**: `.lean()` for read-only operations
- **Connection Pooling**: Single MongoDB connection per process
- **Batch Processing**: Cron processes monitors in batches of 20
- **Promise.allSettled**: Resilient concurrent operations
- **Redis Caching**: KPIs cached for 30 seconds
- **TTL Index**: Health logs auto-deleted after 30 days

## 🚨 Error Handling

All errors follow this format:
```json
{
  "success": false,
  "message": "Human-readable message",
  "code": "ERROR_CODE"
}
```

Never expose:
- Stack traces in production
- Database connection strings
- API keys or secrets
- Internal error details

## 📝 Logging

Structured JSON logging with sensitive field redaction:
- Timestamps in ISO format
- Log levels: debug, info, warn, error
- Context labels for grouping
- Automatic sanitization of passwords, tokens, keys

## 🔍 Monitoring

Key metrics to track:
- API response times
- Cron job duration
- Error rates (by endpoint)
- Health check success rate
- Email delivery rate
- Database query performance
- Redis cache hit rate

## 📚 Documentation

- API Documentation: Use Postman collection
- Architecture: See design documents
- Deployment: See deployment guide
- Troubleshooting: See error logs and monitoring

## 🤝 Contributing

- Follow TypeScript best practices
- Validate all inputs with Zod
- Add error handling with try/catch
- Use async/await, never promises
- Test cron jobs locally first
- Document new features

## ✅ Testing Checklist

- [ ] User signup/login flow
- [ ] Monitor CRUD operations
- [ ] Health check detects status changes
- [ ] Incident created on 2nd failure
- [ ] AI analysis generates fix
- [ ] Email alerts sent with cooldown
- [ ] Incident resolved on recovery
- [ ] KPIs calculated correctly
- [ ] Rate limiting works
- [ ] Cron job runs without errors
- [ ] Admin can view all users
- [ ] Refresh token rotation works
- [ ] Logout invalidates tokens

---

**Last Updated**: January 27, 2026
**Status**: Production Ready ✅
