# MonitorHub - Setup & Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (verify with `node --version`)
- npm or pnpm
- MongoDB instance (local or Atlas)
- Optional: Upstash Redis for rate limiting
- Optional: Gmail/SMTP for email alerts
- Optional: Google Gemini API key for AI analysis

### 1. Clone & Install

```bash
# Install dependencies
npm install
# or
pnpm install
```

### 2. Environment Configuration

Create `.env.local` in the project root:

```env
# REQUIRED - App will not start without these
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/monitorhub
JWT_SECRET=your-super-secret-key-must-be-at-least-32-characters-long-here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OPTIONAL - Some features won't work without these
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# OPTIONAL - AI analysis won't work without this
GEMINI_API_KEY=your_gemini_api_key

# OPTIONAL - Email alerts won't work without these
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# OPTIONAL - Protect cron job from unauthorized calls
CRON_SECRET=your-random-cron-secret
```

### 3. MongoDB Setup

#### Using MongoDB Atlas (Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/monitorhub`
4. Add `MONGODB_URI` to `.env.local`

#### Using Local MongoDB
```bash
# Install MongoDB (Mac)
brew install mongodb-community

# Start service
brew services start mongodb-community

# Connection string
MONGODB_URI=mongodb://localhost:27017/monitorhub
```

### 4. Redis Setup (Optional but Recommended)

#### Using Upstash (Easiest)
1. Go to https://upstash.com
2. Create free Redis database
3. Copy REST URL and TOKEN to `.env.local`

#### Using Local Redis
```bash
# Install Redis (Mac)
brew install redis

# Start service
redis-server
```

### 5. Email Setup (Optional)

#### Using Gmail (Recommended)
1. Enable 2FA on Gmail account
2. Create app password: https://myaccount.google.com/apppasswords
3. Use app password as `EMAIL_PASS`
4. Set `EMAIL_USER` to your Gmail

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

#### Using Other SMTP
```env
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-username
EMAIL_PASS=your-password
```

### 6. AI Setup (Optional)

1. Get Gemini API key: https://aistudio.google.com/app/apikey
2. Add to `.env.local`:
```env
GEMINI_API_KEY=your_api_key_here
```

### 7. Run Development Server

```bash
npm run dev
```

Access at: http://localhost:3000

### 8. Test the System

#### 1. Sign Up
- Go to http://localhost:3000/signup
- Create account with test email

#### 2. Add Monitor
- Go to Monitors page
- Create monitor pointing to any website
- Example: `https://google.com`

#### 3. Trigger Cron Job
```bash
curl -X POST http://localhost:3000/api/cron/monitor \
  -H "x-cron-secret: your-cron-secret"
```

Or without secret (if not set):
```bash
curl -X POST http://localhost:3000/api/cron/monitor
```

#### 4. Check Dashboard
- Go to Dashboard
- Should see health check results
- Response times, status codes

#### 5. Test Incident Detection
- Create monitor with invalid URL
- Wait for 2 consecutive failed checks
- Should create incident with AI analysis
- Email should send (if configured)

---

## 🌐 Production Deployment

### Option 1: Deploy to Vercel (Recommended)

```bash
# 1. Push code to GitHub
git push origin main

# 2. Go to https://vercel.com
# 3. Import your GitHub repository

# 4. Set environment variables in Vercel dashboard:
# MONGODB_URI, JWT_SECRET, etc.

# 5. Deploy
# Vercel will automatically build and deploy
```

### Option 2: Deploy to Railway

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Link project
railway init

# 4. Add variables
railway variables add MONGODB_URI=...
railway variables add JWT_SECRET=...
# ... add all env vars

# 5. Deploy
railway up
```

### Option 3: Deploy to Your Server

```bash
# 1. SSH into server
ssh user@your-server.com

# 2. Clone repository
git clone https://github.com/yourname/monitorhub.git
cd monitorhub

# 3. Install dependencies
npm install

# 4. Create .env file with all variables
# IMPORTANT: Set NODE_ENV=production

# 5. Build
npm run build

# 6. Start
npm start

# 7. Setup systemd service (Linux)
sudo nano /etc/systemd/system/monitorhub.service
```

Systemd service file:
```ini
[Unit]
Description=MonitorHub
After=network.target

[Service]
Type=simple
User=nodejs
WorkingDirectory=/home/nodejs/monitorhub
ExecStart=/usr/bin/node /home/nodejs/monitorhub/node_modules/.bin/next start
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl start monitorhub
sudo systemctl enable monitorhub
```

---

## ⏱ Setting Up Cron Job

### For Vercel
1. Vercel automatically detects cron routes
2. Endpoint: `yourdomain.com/api/cron/monitor`
3. Schedule: `* * * * *` (every minute)

### For Railway/Custom Server
Use a cron service:

```bash
# 1. Install cron-job.org service (free)
# Go to https://cron-job.org

# 2. Create job:
# URL: https://yourdomain.com/api/cron/monitor
# Schedule: Every 1 minute
# Headers: x-cron-secret: your-secret

# OR use curl in crontab:
# 3. Add to crontab
crontab -e

# Add line:
* * * * * curl -X POST https://yourdomain.com/api/cron/monitor -H "x-cron-secret: your-secret"
```

---

## 🔒 Security Checklist

- [ ] JWT_SECRET is 32+ characters, random, never committed
- [ ] MongoDB password is strong and unique
- [ ] NEXT_PUBLIC_APP_URL matches your domain
- [ ] CORS origins whitelisted
- [ ] Emails encrypted (SMTP uses TLS)
- [ ] Cron job protected with CRON_SECRET
- [ ] Rate limiting enabled
- [ ] HTTPS enforced in production
- [ ] Database backups enabled
- [ ] Logs monitored for errors
- [ ] Sensitive env vars not logged
- [ ] Admin users have 2FA (manual implementation)

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
```
Error: connect ECONNREFUSED 127.0.0.1:27017

Solution:
1. Check MONGODB_URI is correct
2. If using Atlas, ensure IP is whitelisted
3. Check network connection
4. Verify username/password in URI
```

### "JWT_SECRET must be at least 32 characters"
```
Generate strong secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### "Email not sending"
```
Troubleshoot:
1. Check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
2. For Gmail: Use app password, not regular password
3. Enable "Less secure apps" if using Gmail
4. Check spam folder
5. Test SMTP connection:
   
   node -e "
   const nodemailer = require('nodemailer');
   const trans = nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 587,
     auth: { user: 'your@email.com', pass: 'app-password' }
   });
   trans.verify((err, success) => {
     if (err) console.log('Error:', err);
     else console.log('Connected!');
   });
   "
```

### "Cron job not running"
```
Check:
1. Cron endpoint is accessible: POST /api/cron/monitor
2. CRON_SECRET matches if set
3. Redis lock not stuck (clear manually if needed)
4. Check logs for errors
5. Verify MONGODB_URI works in cron context
```

### "Incidents not being created"
```
Debug:
1. Check health check is running (POST /api/cron/monitor)
2. Monitor should have 2 consecutive failures
3. Check HealthLog table has entries
4. Check Incident table
5. Verify incident service isn't throwing errors
```

### "AI analysis not working"
```
Check:
1. GEMINI_API_KEY is set correctly
2. API key has permissions for generativeai.googleapis.com
3. Not hitting API rate limits
4. Timeout: AI calls have 6s limit
5. Check console logs for Gemini errors
```

---

## 📊 Monitoring & Logs

### View Logs in Production

**Vercel:**
- Dashboard → Deployments → Logs tab

**Railway:**
- Dashboard → Logs tab

**Custom Server:**
```bash
# View real-time logs
tail -f /var/log/monitorhub.log

# Search for errors
grep ERROR /var/log/monitorhub.log

# Check system logs
journalctl -u monitorhub -f
```

### Key Metrics to Monitor
- API response times (target: <200ms)
- Cron job duration (target: <30s for 100 monitors)
- Error rates (target: <1%)
- Database query times (target: <100ms)
- Email delivery rate (target: >99%)
- Uptime % (target: >99.9%)

---

## 🆘 Getting Help

1. Check SYSTEM_DOCUMENTATION.md for detailed info
2. Review error logs
3. Test endpoints with curl/Postman
4. Check MongoDB for data consistency
5. Monitor Redis connection if using it
6. Look at GitHub Issues section

---

## 📋 Deployment Checklist

Before going live:

- [ ] All env vars configured
- [ ] MongoDB Atlas cluster created + IP whitelisted
- [ ] SMTP server configured and tested
- [ ] Gemini API key obtained and tested
- [ ] Redis configured (if using)
- [ ] Domain purchased and DNS configured
- [ ] SSL certificate configured (auto on Vercel/Railway)
- [ ] Cron job scheduled
- [ ] Monitoring/alerting setup
- [ ] Database backups enabled
- [ ] Test full incident flow end-to-end
- [ ] Load test with multiple monitors
- [ ] Documentation reviewed
- [ ] Team trained on system
- [ ] Support plan documented

---

## 🎉 You're Ready!

Your production-grade MonitorHub instance is now running. Monitor your websites 24/7 with AI-powered incident analysis!

**Next Steps:**
1. Add monitors for your websites
2. Configure team members
3. Setup alerts distribution list
4. Monitor dashboard daily
5. Plan scaling as you grow

---

**Version**: 1.0.0
**Last Updated**: January 27, 2026
