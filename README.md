# 🌐 MonitorHub - AI-Powered Website Health Dashboard

Production-grade SaaS platform for 24/7 website monitoring with AI-powered incident analysis, automated alerts, and comprehensive dashboards.

## ✨ Features

### 🔍 **Website Monitoring**
- Real-time HTTP health checks (configurable intervals: 60s - 60min)
- HTTP status code detection (UP/DOWN/SLOW)
- Response time measurement
- Automatic retry on failure

### 🚨 **Incident Detection & Management**
- Automatic incident creation on 2 consecutive failures
- AI-powered root cause analysis via Google Gemini
- Incident severity classification (LOW/MEDIUM/HIGH)
- Auto-resolution when service recovers
- Historical incident tracking

### 📧 **Smart Alerting**
- HTML email notifications on downtime
- Recovery alerts with downtime duration
- Alert cooldown (15 min) to prevent spam
- Graceful fallback if SMTP unavailable
- Async email sending (non-blocking)

### 📊 **Analytics & Dashboard**
- Real-time KPI cards (total monitors, uptime %, response time)
- Monitor grid with status badges and uptime history
- Incident timeline with AI explanations
- Health check history (30-day retention)
- 30-second cached analytics for performance

### 🔐 **Security**
- JWT authentication with refresh tokens
- Token rotation on refresh (prevents reuse)
- Bcrypt password hashing (12 salt rounds)
- HTTP-only, Secure, SameSite=Strict cookies
- Rate limiting (100 requests per 15 minutes)
- CSP headers, CORS validation
- Input validation with Zod schemas
- Structured logging (no sensitive data)

### 🚀 **Production Ready**
- Distributed cron lock (Redis) prevents duplicate runs
- Promise.allSettled batch processing (resilience)
- Timeout protection on all external calls
- Graceful fallbacks (works without Redis/Gemini/Email)
- Comprehensive error handling
- Observability through structured JSON logs

## 🏗 Architecture

```
MonitorHub
├── Frontend (Next.js Pages + Components)
│   ├── Dashboard (KPI cards, monitor grid, incidents)
│   ├── Monitor Management
│   ├── Auth Pages (Login, Signup)
│   └── Settings
├── Backend (Next.js API Routes)
│   ├── Authentication (JWT, refresh tokens)
│   ├── Monitor CRUD + Health Checks
│   ├── Incident Detection & Resolution
│   ├── Analytics Aggregation
│   └── Admin Operations
├── Services (Business Logic)
│   ├── Monitor Health Check Engine
│   ├── Incident Service (Detection, resolution)
│   ├── Email Service (SMTP alerts)
│   ├── AI Service (Gemini analysis)
│   └── Auth Service (JWT, passwords)
├── Database (MongoDB)
│   ├── Users (accounts, auth)
│   ├── Monitors (websites, config)
│   ├── Incidents (downtime events)
│   └── HealthLogs (check history)
├── Cache (Redis - Optional)
│   ├── Cron lock (concurrency control)
│   ├── Alert cooldown (spam prevention)
│   └── KPI cache (performance)
└── Cron Job (Scheduled Monitor Checks)
    ├── Batch processing (20 monitors/batch)
    ├── Incident detection (2-failure threshold)
    ├── AI analysis async
    └── Email alerts with cooldown
```

## 🛠 Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Radix UI Components

**Backend:**
- Next.js API Routes
- Node.js 18+
- TypeScript

**Database:**
- MongoDB with Mongoose
- TTL indexes (auto-cleanup)
- Compound indexes (performance)

**Cache & Locking:**
- Upstash Redis (optional, graceful fallback)
- Distributed lock pattern

**External Services:**
- Google Gemini 1.5 Flash (AI analysis)
- Nodemailer (SMTP email)
- JWT (authentication)
- Bcryptjs (password hashing)

**Validation & Security:**
- Zod (schema validation)
- CORS middleware
- CSP headers
- Rate limiting

## 📦 Installation

### Quick Start (5 minutes)

1. **Clone & Install**
   ```bash
   git clone <your-repo>
   cd monitorhub
   npm install
   ```

2. **Setup Environment** (see [SETUP_GUIDE.md](SETUP_GUIDE.md))
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Open http://localhost:3000
   - Sign up → Create monitor → Watch dashboard

### Full Documentation
- **Setup & Deployment**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **System Architecture**: [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)
- **API Documentation**: See [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md#-api-endpoints)

## 🚀 Deployment

### Fastest (Vercel)
```bash
# Connect GitHub repo to Vercel
# Add env vars in Vercel dashboard
# Deploy
```

### Alternative Platforms
- **Railway**: [SETUP_GUIDE.md](SETUP_GUIDE.md#option-2-deploy-to-railway)
- **Custom Server**: [SETUP_GUIDE.md](SETUP_GUIDE.md#option-3-deploy-to-your-server)
- **Docker**: Coming soon

### Cron Job Setup
Endpoint: `POST /api/cron/monitor`
Schedule: Every 1 minute
- Vercel: Auto-configured
- Others: Use cron-job.org or systemd

## 📊 API Endpoints

**Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/logout` - Logout & invalidate token

**Monitors**
- `GET /api/monitors` - List user's monitors
- `POST /api/monitors` - Create new monitor
- `GET /api/monitors/[id]` - Get monitor + history
- `PUT /api/monitors/[id]` - Update monitor
- `DELETE /api/monitors/[id]` - Delete monitor

**Incidents**
- `GET /api/incidents` - List user's incidents
- `GET /api/incidents/[id]` - Get incident details

**Analytics**
- `GET /api/analytics` - Dashboard KPIs

**Admin**
- `GET /api/admin/users` - List all users

See [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md#-api-endpoints) for full details.

## 🔧 Configuration

### Environment Variables

**Required:**
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-32-char-secret
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Optional (but recommended):**
```env
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your@email.com
EMAIL_PASS=app-password
GEMINI_API_KEY=...
CRON_SECRET=...
```

See [.env.example](.env.example) for full list with descriptions.

## 💾 Database Schema

**User**
- Email (unique), password hash, role, settings
- JWT refresh token tracking for security
- Last login timestamp

**Monitor**
- URL, name, check interval
- Current status (UP/DOWN/SLOW)
- Last response code & time
- Failure tracking for incident detection

**Incident**
- Monitor & user reference
- Status (ONGOING/RESOLVED)
- Severity (LOW/MEDIUM/HIGH)
- AI analysis (explanation, suggested fix)
- Timeline (created, resolved dates)

**HealthLog**
- Monitor reference, timestamp
- HTTP status code, response time
- TTL index for 30-day auto-cleanup

See [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md#-database-schema) for detailed schema.

## 🧪 Testing

### Manual Testing
1. Sign up at http://localhost:3000/signup
2. Create monitor (e.g., https://google.com)
3. Trigger cron: `curl -X POST http://localhost:3000/api/cron/monitor`
4. Check dashboard for results

### Test Incident Flow
1. Add monitor with bad URL
2. Run cron twice (2 failures = incident)
3. Check Incident collection for new entry
4. Verify AI analysis completed
5. Check email if configured

### API Testing
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Create monitor
curl -X POST http://localhost:3000/api/monitors \
  -H "Cookie: accessToken=..." \
  -d '{"url":"https://google.com","name":"Google"}'
```

See [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md#-testing) for full test checklist.

## 📈 Performance

- **Cron job**: ~20-30s for 100 monitors (20 per batch)
- **Dashboard load**: <200ms (cached analytics)
- **Monitor response**: <5s check timeout, 3s SLOW threshold
- **Database queries**: <100ms with indexes

## 🔒 Security

✅ **Authentication**: JWT + Refresh tokens + Token rotation
✅ **Passwords**: Bcrypt 12-round hashing
✅ **Cookies**: HTTP-only, Secure, SameSite=Strict
✅ **API**: Rate limiting (100 req/15 min), CORS validation
✅ **Headers**: CSP, X-Frame-Options, HSTS, Permissions-Policy
✅ **Logs**: Automatic sanitization of sensitive fields
✅ **Validation**: Zod schemas for all inputs
✅ **Database**: Connection pooling, parameterized queries

See [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md#-security) for security details.

## 🚨 Incident Flow

```
Monitor Check Failed
    ↓
HealthLog Created (statusCode, responseTime)
    ↓
Check Last 3 Logs for Failures
    ↓
2+ Consecutive Failures?
    ├─ YES → Check Existing Incident
    │         ├─ Exists → Increment failureCount
    │         └─ None → Create New Incident
    │                   ↓
    │                   Run AI Analysis (async, 6s timeout)
    │                   ↓
    │                   Check Alert Cooldown
    │                   ├─ Available → Send Email
    │                   │              ↓
    │                   │              Set 15-min Cooldown
    │                   └─ On Cooldown → Skip Email
    └─ NO → Check for Recovery
            ├─ Status was DOWN, now UP?
            │  ├─ YES → Resolve Incident
            │  │         ↓
            │  │         Send Recovery Email
            │  │         (include downtime duration)
            │  └─ NO → Update Monitor Status
            └─ Done
```

## 📞 Support

1. **Documentation**: [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)
2. **Setup Guide**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
3. **Troubleshooting**: [SETUP_GUIDE.md](SETUP_GUIDE.md#-troubleshooting)

## 📄 License

MIT - See LICENSE file for details

## 🎯 Roadmap

- [ ] Webhook notifications (Slack, Discord)
- [ ] Team collaboration features
- [ ] Custom alert templates
- [ ] Public status page
- [ ] Advanced analytics (trends, predictions)
- [ ] API key authentication
- [ ] Two-factor authentication
- [ ] Mobile app
- [ ] SMS alerts
- [ ] PagerDuty integration

## 🤝 Contributing

Contributions welcome! Please see CONTRIBUTING.md for guidelines.

---

**MonitorHub** - Keep your websites healthy 24/7 🚀

**Version**: 1.0.0
**Last Updated**: January 27, 2026
