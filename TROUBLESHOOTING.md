# MonitorHub - Comprehensive Troubleshooting Guide

## 🔍 Diagnostic Approach

### Step 1: Identify the Issue
1. **Where is it failing?**
   - Frontend (browser console)
   - Backend (server logs)
   - Database (connection issues)
   - External service (email, AI, Redis)

2. **When did it break?**
   - After code change
   - After environment change
   - After deployment
   - Randomly intermittent

3. **What's the error message?**
   - Exact error text
   - Stack trace
   - Status code

### Step 2: Check Logs
```bash
# Development
npm run dev
# Check terminal output

# Production (Vercel)
Dashboard → Deployments → Logs

# Production (Railway)
Dashboard → Logs tab

# Custom Server
journalctl -u monitorhub -f
tail -f /var/log/monitorhub.log
```

### Step 3: Test Connectivity
```bash
# MongoDB
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(e => console.log('❌ Error:', e.message))"

# Redis
redis-cli PING
# or for Upstash: curl -H "Authorization: Bearer TOKEN" https://INSTANCE.upstash.io/ping

# SMTP
node -e "const nodemailer = require('nodemailer'); const trans = nodemailer.createTransport({host: process.env.EMAIL_HOST, port: process.env.EMAIL_PORT, auth: {user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS}}); trans.verify((e) => console.log(e ? '❌ ' + e : '✅ Connected'))"

# Gemini
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY" -H "Content-Type: application/json" -d '{"contents":[{"parts":[{"text":"test"}]}]}'
```

### Step 4: Check Environment
```bash
# Verify env vars are set
echo $MONGODB_URI
echo $JWT_SECRET
echo $NEXT_PUBLIC_APP_URL

# View all (never in production!)
# env | grep MONGO
# env | grep JWT
```

---

## 🔴 Common Issues & Solutions

### 1. App Won't Start

#### Error: `Cannot find module 'next'`
```
Solution:
npm install
# or if using pnpm
pnpm install
```

#### Error: `ENOENT: no such file or directory, open '.env.local'`
```
Solution:
# Create .env.local from template
cp .env.example .env.local

# Verify required vars are set
cat .env.local | grep MONGODB_URI
cat .env.local | grep JWT_SECRET
cat .env.local | grep NEXT_PUBLIC_APP_URL
```

#### Error: `JwtError: jwt must be provided` or `JWT_SECRET is too short`
```
Solution:
# Generate a proper JWT_SECRET (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env.local
JWT_SECRET=<paste-generated-value>

# Restart app
npm run dev
```

#### Error: `EADDRINUSE: address already in use :::3000`
```
Solution (macOS):
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev

Solution (Linux):
sudo lsof -i :3000
sudo kill -9 <PID>
```

---

### 2. Database Connection Issues

#### Error: `connect ECONNREFUSED 127.0.0.1:27017`
```
Issue: MongoDB not running locally
Solution:
# Check if MongoDB running
brew services list  # macOS
systemctl status mongod  # Linux

# Start MongoDB
brew services start mongodb-community
sudo systemctl start mongod

# OR use MongoDB Atlas instead
# Update MONGODB_URI with Atlas connection string
```

#### Error: `getaddrinfo ENOTFOUND cluster0.mongodb.net`
```
Issue: MongoDB Atlas network issue
Solution:
# 1. Verify connection string format
# Should be: mongodb+srv://user:password@cluster.mongodb.net/dbname

# 2. Check Atlas whitelist
# MongoDB Atlas → Network Access → IP Whitelist
# Add your IP or 0.0.0.0/0 (less secure)

# 3. Verify credentials
# Check username & password in connection string
# Use URL-encoded special characters if needed

# 4. Test connection
mongo "mongodb+srv://user:password@cluster.mongodb.net/test"
```

#### Error: `MongoAuthError: Authentication failed`
```
Issue: Wrong username or password
Solution:
# 1. Verify credentials in .env.local
echo $MONGODB_URI

# 2. Check username has permissions
# MongoDB Atlas → Security → Database Users
# Verify user has readWrite role

# 3. Password has special characters?
# URL-encode: ! → %21, @ → %40, etc.
# Use: encodeURIComponent('password')

# 4. Try test connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('OK')).catch(e => console.log(e.message))"
```

---

### 3. Authentication Issues

#### Error: `Invalid email or password`
```
Issue: User doesn't exist or password wrong
Solution:
# 1. Check user exists in MongoDB
# MongoDB Atlas → Collections → Users
# Search for email address

# 2. Password case-sensitive
# Email: case-insensitive
# Password: case-sensitive

# 3. User might be inactive
# Check isActive=true in database

# 4. Reset password flow needed
# (Not yet implemented - create new user)
```

#### Error: `jwt malformed` or `invalid token`
```
Issue: Invalid or corrupted JWT
Solution:
# 1. Clear browser cookies
# DevTools → Application → Cookies → Delete all

# 2. Logout & login again
# POST /api/logout
# POST /api/auth/login

# 3. Check JWT_SECRET hasn't changed
# Old tokens invalid if secret changed
# All users must re-login

# 4. Token expired?
# Access tokens expire in 15 mins
# Should auto-refresh with refresh token
# If refresh fails: logout & login again
```

#### Error: `Error: NEXT_PUBLIC_APP_URL is required`
```
Issue: Public URL not configured
Solution:
# Set in .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Or production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Restart app
npm run dev
```

---

### 4. Monitor & Cron Issues

#### Cron Job Not Running
```
Issue: Health checks not executing
Symptoms:
- HealthLog table empty
- Monitor status not updating
- No incidents being created

Solution:
# 1. Test cron manually
curl -X POST http://localhost:3000/api/cron/monitor

# 2. Check response
# Should return: { success: true, data: { processed: X, failed: Y } }

# 3. Verify cron scheduled (production)
# Vercel: Dashboard → Cron Jobs tab
# Railway: Setup external cron job
# Custom: Check systemd or crontab

# 4. Check MongoDB for HealthLog entries
# MongoDB Atlas → Collections → HealthLogs
# Should have entries with recent timestamps

# 5. Check logs for errors
# npm run dev (check terminal)
# Vercel Logs tab
```

#### Monitor Status Not Updating
```
Issue: Monitor stuck with old status
Symptoms:
- Monitor shows UP but website is down
- Response time outdated
- No recent HealthLog entries

Solution:
# 1. Run cron manually
curl -X POST http://localhost:3000/api/cron/monitor

# 2. Check response time
# Should return quickly (<5s)

# 3. Verify monitor is active
# Check isActive=true in MongoDB

# 4. Check monitor URL is valid
# GET /api/monitors/[id]
# Verify URL is correct

# 5. Check rate limiting not blocking
# If getting 429: rate limit hit
# Need to wait 15 mins or increase limit

# 6. Check timeout not too short
# Default: 5s timeout per check
# Some websites might be slower
```

#### Cron Taking Too Long (>60s)
```
Issue: Health checks running slowly
Symptoms:
- Cron job timeout
- Not all monitors checked
- Inconsistent results

Solution:
# 1. Check monitor count
# Too many monitors (100+)?
# Processed in batches of 20
# Takes ~15-30s for 100 monitors

# 2. Check for slow websites
# Some websites might be 5+ seconds
# All monitors checked sequentially

# 3. Monitor your metrics
# npm run dev + watch terminal
# Look for slowest monitors

# 4. Optimize Cron
# Reduce check interval
# Remove dead monitors
# Increase batch size (code change needed)

# 5. Check Redis lock not stuck
# If Redis: GET monitorhub:cron:lock
# Should be empty most of time
```

#### Incidents Not Being Created
```
Issue: No incidents even with failing monitor
Symptoms:
- Monitor status DOWN
- But no incident in Incident table
- No email alerts

Solution:
# 1. Verify 2-failure threshold
# Incidents created after 2 consecutive failures
# Run cron at least twice

# 2. Check HealthLog entries
# Verify at least 2 with isUp=false
# In correct order (most recent first)

# 3. Verify monitor has userId
# Incident requires userId reference
# Check Monitor has userId field

# 4. Check for existing incident
# If ONGOING incident exists
# New failure increments failureCount
# Doesn't create duplicate

# 5. Check logs for errors
# npm run dev
# Look for incident-service errors

# 6. Manual test
# Add monitor with bad URL
# Run cron multiple times
# Check Incident collection
```

---

### 5. Email Issues

#### Emails Not Sending
```
Issue: No email alerts on incidents
Symptoms:
- Incident created
- No email received
- Check spam folder (empty)

Solution:
# 1. Verify SMTP configured
echo $EMAIL_HOST
echo $EMAIL_USER
echo $EMAIL_PASS

# 2. Test SMTP connection
node -e "
const nodemailer = require('nodemailer');
const trans = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
trans.verify((err, success) => {
  if (err) console.log('Error:', err.message);
  else console.log('✅ SMTP Connected');
});
"

# 3. Check Gmail (if using)
# Verify 2FA enabled
# Verify app password (not regular password)
# Check "Less secure apps" if applicable

# 4. Check email in cooldown
# Alert cooldown: 15 minutes per monitor
# Can't send more than 1 alert per 15 mins
# Check Redis for: monitorhub:alert:cooldown:MONITOR_ID

# 5. Check user notification email
# Verify user.notificationEmail in MongoDB
# Should match email to receive alerts

# 6. Check logs
npm run dev
# Look for email-service errors
```

#### Wrong Email Address Receiving Alerts
```
Issue: Alerts sent to wrong email
Solution:
# 1. Check user notification email
# GET /api/auth/me
# Look for notificationEmail field

# 2. Update in MongoDB
# Users collection
# Update user.notificationEmail

# 3. Or update user profile
# (Dashboard → Settings - not yet implemented)
```

#### Email Looks Bad (Not HTML Formatted)
```
Issue: Email received as plain text
Solution:
# Email service sends HTML
# Check email client supports HTML
# Try in different email client
# Outlook/Gmail should work fine
```

---

### 6. AI Analysis Issues

#### AI Analysis Not Running
```
Issue: Incident has no aiExplanation
Symptoms:
- Incident created
- aiExplanation field empty
- suggestedFix field empty

Solution:
# 1. Check GEMINI_API_KEY set
echo $GEMINI_API_KEY

# 2. Verify API key valid
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'

# 3. Check API key has permissions
# Google Cloud Console → APIs & Services
# Enable generativeai.googleapis.com

# 4. Check rate limits
# Gemini has usage limits
# Check quota in Google Cloud Console

# 5. AI runs async
# Might take few seconds
# Check again after 5 seconds

# 6. Check logs
npm run dev
# Look for gemini-service errors
# Timeout errors (6 second limit)?
```

#### AI Analysis Timing Out (6s limit)
```
Issue: AI analysis not completing
Symptoms:
- No aiExplanation in incident
- Logs show timeout error
- Happens intermittently

Solution:
# 1. Gemini API might be slow
# Timeout is 6 seconds (hard limit)
# Nothing to change in code

# 2. Fallback analysis
# If Gemini fails, uses heuristics
# Based on HTTP status code
# More generic but still helpful

# 3. Monitor Gemini performance
# Might need to increase timeout (code change)
# Or find different AI provider

# 4. Check network latency
# Are you far from US (where Gemini is)?
# Latency affects response time
```

---

### 7. Redis Issues

#### Error: `connect ECONNREFUSED (Redis)`
```
Issue: Redis not available
Symptoms:
- Rate limiting falls back to memory
- Cron lock doesn't work across instances
- KPI cache doesn't work

Solution:
# 1. Redis optional - app still works
# But features degrade gracefully
# In-memory rate limit fallback
# Single-instance cron lock

# 2. If want Redis:
# Upstash: Create free instance
# Local: brew install redis && redis-server

# 3. Verify UPSTASH_REDIS_REST_URL set
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN

# 4. Test connection
redis-cli -u $UPSTASH_REDIS_REST_URL ping
# Should return PONG

# 5. Works without Redis!
# App degrades gracefully
# Can deploy without Redis
```

#### Cron Lock Stuck
```
Issue: Cron job won't run (lock held)
Symptoms:
- Cron fails with "lock not acquired"
- No health checks running
- Error in logs

Solution:
# 1. Check Redis for stuck lock
redis-cli GET monitorhub:cron:lock
# If returns a value: lock exists
# If empty: lock not stuck

# 2. Force release lock
redis-cli DEL monitorhub:cron:lock

# 3. Or wait 2 minutes
# Lock auto-expires after 2 mins

# 4. Check for crashed cron job
# If cron crashed, lock persists
# Manually delete to resume

# 5. Monitor logs
# Make sure next cron runs
# Check duration < 30s
```

---

### 8. Performance Issues

#### App Loading Slowly
```
Issue: Dashboard takes 5+ seconds to load
Symptoms:
- Network tab shows slow requests
- API calls hanging
- CPU/Memory high

Solution:
# 1. Check database connection
# Might have too many active connections
# Check MongoDB Atlas dashboard

# 2. Check for slow queries
# Query large collections without limits
# Monitor.find({}) on 1000 monitors?

# 3. Increase page size limit
# GET /api/monitors?limit=100
# Default: sensible limits set

# 4. Check rate limiting not interfering
# If getting 429: you're rate limited
# Wait 15 mins or increase limit

# 5. Check network latency
# AWS region match?
# CDN configured?

# 6. Browser DevTools
# Network tab: which request slow?
# Performance tab: timeline
```

#### Cron Job Slow (>30s for 100 monitors)
```
Issue: Health checks taking too long
Symptoms:
- Logs show duration >30s
- Monitors not checked frequently enough
- Rate limiting kicking in

Solution:
# 1. Check website response times
# Some websites slow? (5+ seconds)
# Filter out slow monitors

# 2. Check batch size
# Currently: 20 monitors per batch
# More batches = more time
# Reduce batch size or increase parallelism

# 3. Check concurrent requests limit
# Default: safe limits to not overwhelm servers
# Could increase but risky

# 4. Check MongoDB performance
# Is update query slow?
# Check index on Monitor

# 5. Monitor actual duration
# npm run dev
# Look at cron log output
# Identify bottleneck
```

#### High Memory Usage
```
Issue: App using lots of RAM
Symptoms:
- Process memory growing over time
- App eventually crashes
- OOM killer invoked

Solution:
# 1. Check for memory leaks
# Restart daily in crontab
# 0 0 * * * systemctl restart monitorhub

# 2. Check for large arrays
# HealthLog queries returning 1000+ docs?
# Add limit to queries

# 3. Check Redis caching
# Large values in Redis?
# Configure TTL properly

# 4. Monitor with tools
# Custom server: free -h
# Vercel: Function size monitor
# Monitor trends daily
```

---

### 9. Security Issues

#### 429 Rate Limited
```
Issue: Too many requests, getting 429
Symptoms:
- API returns 429 Too Many Requests
- After 100 requests in 15 mins
- Message: "Rate limit exceeded"

Solution:
# 1. Check your request rate
# 100 requests per 15 minutes per IP
# = ~6.7 requests per minute

# 2. If legit usage:
# Throttle requests from client
# Add delays between requests
# Batch operations

# 3. If different IP:
# Rate limit per IP
# If behind proxy, check x-forwarded-for

# 4. Increase limit (code change)
# lib/rate-limit.ts
# Change MAX_REQUESTS or WINDOW_MS

# 5. Disable in development
# Rate limit enabled in production
# Disabled locally for testing
```

#### CORS Error
```
Issue: Browser blocks request - CORS error
Symptoms:
- Console error: "No 'Access-Control-Allow-Origin' header"
- Request blocked by browser
- Frontend can't talk to API

Solution:
# 1. Verify NEXT_PUBLIC_APP_URL set
echo $NEXT_PUBLIC_APP_URL

# 2. CORS should be auto-configured
# middleware.ts handles CORS
# Should allow same-origin requests

# 3. Check if proxy issue
# Some development setups use proxy
# Check package.json: "proxy" field

# 4. Check for typo in URL
# API: http://localhost:3000
# Frontend: http://localhost:3000
# Must match exactly

# 5. Custom domain?
# Update NEXT_PUBLIC_APP_URL
# Rebuild & redeploy
```

#### Suspicious Activity / Hacking
```
Issue: Seeing strange logs, potential hack
Solution:
# 1. Check rate limiting is working
# lib/rate-limit.ts active?
# Check logs for 429 responses

# 2. Review auth logs
# Check login attempts
# Failed logins in logs?

# 3. Check database for unusual data
# Unexpected users created?
# Unexpected monitors/incidents?

# 4. Check API audit logs
# Any unusual API calls?
# Admin operations by unknown user?

# 5. Immediate actions:
# Rotate JWT_SECRET (all users logout)
# Change all passwords
# Review code for vulnerabilities
# Enable 2FA (when implemented)

# 6. Review logs
# Check timestamp of first unusual activity
# What changed around that time?
```

---

### 10. Deployment Issues

#### Vercel Deployment Failed
```
Issue: Build fails on Vercel
Symptoms:
- Deployment marked as failed
- Build tab shows error
- Can't access app

Solution:
# 1. Check build logs
# Vercel Dashboard → Deployments → [deployment] → View

# 2. Common errors:
# "Cannot find module X"
# → npm install missing dependency

# "Build failed with 1 error"
# → TypeScript compilation error
# Check for type issues

# "Failed to load env"
# → Required env var not set
# Check Vercel → Settings → Environment Variables

# 3. Verify locally first
npm run build
npm start

# 4. Rebuild if needed
# Vercel → Deployments → Redeploy
```

#### Cron Job Not Scheduled (Vercel)
```
Issue: Cron endpoint exists but not running
Symptoms:
- Manual call works: curl /api/cron/monitor
- But automatic execution not happening
- No scheduled jobs in Vercel dashboard

Solution:
# 1. Vercel auto-detects /api/cron/* routes
# Should create automatically
# Check: Dashboard → Cron Jobs tab

# 2. If not showing:
# Endpoint might be wrong format
# Should be: /api/cron/[anything]
# Example: /api/cron/monitor ✅

# 3. Redeploy to trigger detection
# Make small code change
# Deploy again

# 4. Manual setup if needed
# Use external service: cron-job.org
# Set frequency: every 1 minute
# URL: https://yourdomain.vercel.app/api/cron/monitor

# 5. Check cron ran
# Vercel Dashboard → Cron Invocations tab
# Should show recent successful runs
```

#### High Vercel Costs
```
Issue: Unexpected Vercel bill
Solution:
# 1. Check Function logs
# Dashboard → Usage → Functions
# See which endpoints using most

# 2. Optimize cron job
# Might be running more than expected
# Check Cron Invocations tab

# 3. Check for excessive database queries
# Each monitor check = 1-2 queries
# 100 monitors * 60 checks/day = 6000 queries

# 4. Upgrade to Pro if needed
# 5000 monthly function invocations free
# Beyond that = $0.50 per 100K invocations

# 5. Optimize code
# Cache queries with Redis
# Batch operations
# Reduce API calls
```

---

## 🧰 Debugging Tools & Commands

### MongoDB CLI
```bash
# Connect to Atlas
mongo "mongodb+srv://user:pass@cluster.mongodb.net/db"

# List databases
show databases

# Switch database
use monitorhub

# List collections
show collections

# Query examples
db.users.find()
db.monitors.find({userId: ObjectId("...")})
db.incidents.find({status: "ONGOING"})
db.healthlogs.find().sort({checkedAt: -1}).limit(10)

# Count
db.monitors.countDocuments()

# Update
db.users.updateOne({email: "user@example.com"}, {$set: {isActive: true}})

# Delete
db.healthlogs.deleteMany({checkedAt: {$lt: new Date(Date.now() - 30*24*60*60*1000)}})
```

### Testing with curl
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get monitors
curl -X GET http://localhost:3000/api/monitors \
  -H "Cookie: accessToken=YOUR_TOKEN"

# Create monitor
curl -X POST http://localhost:3000/api/monitors \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -d '{"url":"https://example.com","name":"Example","interval":60}'

# Run cron
curl -X POST http://localhost:3000/api/cron/monitor \
  -H "x-cron-secret: your-secret"

# Get analytics
curl -X GET http://localhost:3000/api/analytics \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

### VS Code Debugging
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

---

## 📝 Creating Debug Logs

### Add to Your Code
```typescript
import { logger } from '@/lib/logger';

logger.info('Monitor health check', {
  monitorId: monitor._id,
  url: monitor.url,
  statusCode: response.status,
  responseTime: duration
});

logger.error('Health check failed', {
  monitorId: monitor._id,
  error: err.message
});
```

### View Structured Logs
```bash
# Development - appears in terminal
npm run dev

# Production - check logs
# Vercel: Dashboard → Logs
# Railway: Dashboard → Logs
# Custom: journalctl -u monitorhub -f
```

---

## 🆘 When All Else Fails

1. **Check the docs first**
   - README.md - overview
   - SETUP_GUIDE.md - setup help
   - SYSTEM_DOCUMENTATION.md - architecture
   - QUICK_REFERENCE.md - commands

2. **Review the error message carefully**
   - Search for exact error text
   - Read full stack trace

3. **Test in isolation**
   - Test MongoDB connection only
   - Test SMTP connection only
   - Test API endpoint separately

4. **Restore from backup**
   - If database corrupted
   - MongoDB Atlas has built-in backups

5. **Rollback code**
   - If issue after code change
   - Previous deployment still available

6. **Ask for help**
   - Provide: error message, logs, reproduction steps
   - Attach: relevant code, environment config (no secrets!)

---

**Version**: 1.0.0
**Last Updated**: January 27, 2026
