# MonitorHub - Quick Reference

## 🚀 Getting Started (5 mins)

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local

# 3. Edit .env.local with:
#    - MONGODB_URI (required)
#    - JWT_SECRET (required, run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
#    - NEXT_PUBLIC_APP_URL (required)
#    - Optional: Redis, Email, Gemini

# 4. Start development server
npm run dev

# 5. Open http://localhost:3000
```

## 📍 Key Files & Directories

```
app/                    # Next.js pages and API routes
├── api/               # Backend API endpoints
│   ├── auth/          # Authentication (login, signup, refresh, logout)
│   ├── monitors/      # Monitor CRUD operations
│   ├── incidents/     # Incident listing and details
│   ├── analytics/     # Dashboard KPIs
│   ├── admin/         # Admin endpoints
│   └── cron/          # Scheduled health checks
├── dashboard/         # Main dashboard page
├── login/             # Login page
├── signup/            # Signup page
└── monitors/          # Monitor management page

components/           # React components
├── dashboard-*       # Dashboard UI components
├── monitor-card      # Monitor display component
├── incident-card     # Incident display component
└── ui/              # Radix UI components

lib/                 # Business logic & utilities
├── auth.ts          # JWT, password hashing, auth utils
├── monitor-health-check.ts  # HTTP health check engine
├── incident-service.ts      # Incident detection & resolution
├── email-service.ts         # HTML email alerts
├── gemini.ts        # AI analysis (6s timeout)
├── redis.ts         # Caching & distributed lock
├── rate-limit.ts    # Rate limiting (100 req/15 min)
├── logger.ts        # Structured JSON logging
├── error-handler.ts # Consistent error responses
├── validation.ts    # Zod schemas for inputs
├── env-validation.ts # Startup env validation
└── db.ts            # MongoDB connection

models/              # Mongoose schemas
├── User.ts          # User accounts & auth
├── Monitor.ts       # Websites to monitor
├── Incident.ts      # Downtime events
└── HealthLog.ts     # Health check history

middleware.ts        # Security headers (CSP, CORS, HSTS)

Documentation/
├── README.md                 # Overview & features
├── SETUP_GUIDE.md           # Installation & deployment
├── SYSTEM_DOCUMENTATION.md  # Architecture & APIs
└── QUICK_REFERENCE.md       # This file
```

## 🔐 Authentication Flow

```
User Signup/Login
    ↓
Email & Password Validation
    ↓
Password Hash Check (bcrypt)
    ↓
Create JWT Pair:
├─ Access Token (15 min)
├─ Refresh Token (7 days)
└─ Store refresh token in DB for rotation
    ↓
Set HTTP-only Cookies
    ↓
Redirect to Dashboard
```

## ⏱ Cron Job Flow

**How it works:**
1. Vercel/Cloud cron calls `POST /api/cron/monitor` every minute
2. Acquires Redis lock (prevents concurrent runs)
3. Fetches all active monitors
4. Processes in batches of 20
5. For each monitor:
   - Checks HTTP status (5s timeout)
   - Saves HealthLog
   - Updates Monitor status
   - Detects incidents (2-failure threshold)
   - Sends alerts (with 15-min cooldown)
6. Releases lock & returns

**Manual trigger (for testing):**
```bash
curl -X POST http://localhost:3000/api/cron/monitor
```

## 🧪 Testing the System

### 1. Create Test Monitor
```bash
# Use dashboard or API:
curl -X POST http://localhost:3000/api/monitors \
  -H "Cookie: accessToken=..." \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://httpstat.us/500",
    "name": "Test Failing Site",
    "interval": 60
  }'
```

### 2. Trigger Cron Job
```bash
curl -X POST http://localhost:3000/api/cron/monitor
```

### 3. Check Results
- HealthLog created in MongoDB
- Monitor status updated
- After 2 failures: Incident created
- After that: AI analysis runs
- Check email if configured

### 4. Monitor Recovery
```bash
# Change monitor to: https://httpstat.us/200
# Run cron again
# Should auto-resolve incident
```

## 📊 API Response Examples

### Get Monitors
```bash
curl -X GET http://localhost:3000/api/monitors
```
Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "url": "https://google.com",
      "name": "Google",
      "status": "UP",
      "lastResponseTime": 245,
      "uptimePercent": 98.5,
      "createdAt": "2025-01-27T10:00:00Z"
    }
  ]
}
```

### Get Incidents
```bash
curl -X GET "http://localhost:3000/api/incidents?status=ONGOING"
```

### Get Analytics
```bash
curl -X GET http://localhost:3000/api/analytics
```
Response:
```json
{
  "success": true,
  "data": {
    "totalMonitors": 5,
    "upMonitors": 4,
    "downMonitors": 1,
    "slowMonitors": 0,
    "incidents24h": 2,
    "averageResponseTime": 156,
    "uptime24h": 97.5
  }
}
```

## 🔧 Environment Variables Cheat Sheet

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| MONGODB_URI | ✅ | Database connection | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| JWT_SECRET | ✅ | Token signing (32+ chars) | `abc123...xyz789` (32 chars min) |
| NEXT_PUBLIC_APP_URL | ✅ | App domain | `http://localhost:3000` |
| UPSTASH_REDIS_REST_URL | ⚠️ | Redis cache URL | `https://instance.upstash.io` |
| UPSTASH_REDIS_REST_TOKEN | ⚠️ | Redis token | `token...` |
| EMAIL_HOST | ⚠️ | SMTP server | `smtp.gmail.com` |
| EMAIL_USER | ⚠️ | Email address | `you@gmail.com` |
| EMAIL_PASS | ⚠️ | App password | `16-char-password` |
| GEMINI_API_KEY | ⚠️ | AI API key | `AIza...` |
| CRON_SECRET | ⚠️ | Cron protection | `secret123...` |

✅ = Required for app to start
⚠️ = Optional, some features won't work without it

## 🐛 Debugging Tips

### Check Logs
```bash
# In development, check terminal output
# In production (Vercel): Dashboard → Logs
# Custom server: journalctl -u monitorhub -f
```

### Test Database Connection
```bash
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected!'))
  .catch(err => console.error('Error:', err.message));
"
```

### Test Email
```bash
node -e "
const nodemailer = require('nodemailer');
const trans = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});
trans.verify((err) => console.log(err ? 'Error: ' + err : 'Connected!'));
"
```

### Test Gemini
```bash
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Test"}]}]}'
```

### Check Cron Lock
```bash
# In Redis CLI:
GET monitorhub:cron:lock
# Should return lock value if currently running, null otherwise
```

## 🚀 Production Checklist

- [ ] Generate strong JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Set NEXT_PUBLIC_APP_URL to production domain
- [ ] Enable HTTPS (auto on Vercel/Railway)
- [ ] Configure email with app password
- [ ] Get Gemini API key from aistudio.google.com
- [ ] Setup Redis for rate limiting & lock
- [ ] Enable database backups
- [ ] Test cron job runs every minute
- [ ] Monitor logs for errors
- [ ] Configure alerting on 500 errors
- [ ] Test incident detection flow
- [ ] Load test with 100+ monitors
- [ ] Security scan (.gitignore, no secrets in code)
- [ ] Document team's incident response procedures

## 💡 Common Tasks

### Add New Monitor
1. Go to http://localhost:3000/monitors
2. Click "Add Monitor"
3. Enter URL and name
4. Set check interval
5. Save

### View Incidents
1. Go to Dashboard
2. Scroll to "Recent Incidents"
3. Click incident for details
4. View AI analysis and suggested fixes

### Debug Monitor Not Checking
1. Verify monitor is active (isActive=true)
2. Check cron job ran: POST /api/cron/monitor
3. Check HealthLog table for entries
4. Check logs for errors

### Change Alert Email
1. Edit user profile (FUTURE: add in settings page)
2. Or update User.email directly in DB

### Pause Monitoring
1. Edit monitor
2. Uncheck "Active"
3. Save

## 📚 Documentation Map

- **Getting Started** → SETUP_GUIDE.md
- **Architecture & APIs** → SYSTEM_DOCUMENTATION.md
- **Deployment** → SETUP_GUIDE.md (#deployment)
- **Security** → SYSTEM_DOCUMENTATION.md (#security)
- **Troubleshooting** → SETUP_GUIDE.md (#troubleshooting)
- **API Reference** → SYSTEM_DOCUMENTATION.md (#api-endpoints)

## 🎯 Key Performance Metrics

| Metric | Target | How to Check |
|--------|--------|-------------|
| Cron job duration | <30s (100 monitors) | API logs |
| Dashboard load time | <200ms | Browser DevTools |
| Health check timeout | 5s | Code: monitor-health-check.ts |
| SLOW threshold | 3s response time | Code: monitor-health-check.ts |
| Rate limit | 100 req/15 min | Code: rate-limit.ts |
| Uptime % | >99% | Dashboard analytics |

## 🆘 Quick Support

| Issue | Solution |
|-------|----------|
| App won't start | Check .env.local has all required vars |
| Can't login | Check MongoDB connection & JWT_SECRET |
| Cron not running | Ensure endpoint accessible & cron scheduled |
| Emails not sending | Check SMTP vars & verify connection |
| AI analysis failing | Check GEMINI_API_KEY or logs |
| Rate limit errors | Check IP in rate limiting, increase if needed |
| Database errors | Check MONGODB_URI & network connectivity |

---

**Need help?** See README.md, SETUP_GUIDE.md, or SYSTEM_DOCUMENTATION.md

**Version**: 1.0.0
