# 🎬 Quickshow Application - Complete Setup & Deployment Guide

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Aiven MySQL Cloud Setup](#aiven-mysql-cloud-setup)
3. [Local Development Setup](#local-development-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Troubleshooting](#troubleshooting)
6. [Cost Analysis (Free!)](#cost-analysis)

---

## 🏗️ Architecture Overview

### Technology Stack
```
Frontend:  React 19 + Vite + Tailwind CSS + Clerk Auth
Backend:   Express.js + Sequelize ORM
Database:  Aiven MySQL (Cloud)
Services:  Clerk (Auth), Stripe (Payments), Inngest (Events)
Email:     Nodemailer (SMTP)
Media:     Cloudinary (Image hosting)
APIs:      TMDB (Movie data)
Deployment: Vercel (Frontend + Backend)
```

### Data Flow
```
Client (React/Vite)
    ↓ (Authenticated API calls)
Vercel Serverless Functions (Express)
    ↓ (Database queries)
Aiven MySQL Cloud Database
    ↓ (Event webhooks)
Inngest (Event processing)
    ↓ (Service integrations)
Stripe, Nodemailer, Clerk
```

### Database Schema
```
Users
├── id (Clerk ID)
├── name, email, image
├── isAdmin
├── Bookings (1:M)
└── Favorites (1:M)

Movies
├── id (TMDB ID)
├── title, overview, genres, casts
├── poster_path, backdrop_path
└── Shows (1:M)

Shows
├── id (UUID)
├── movieId (FK)
├── showDateTime, showPrice
├── occupiedSeats (JSON)
└── Bookings (1:M)

Bookings
├── id (UUID)
├── userId, showId (FKs)
├── bookedSeats (JSON array)
├── amount, isPaid, paymentLink
└── timestamps

Favorites
├── id (auto)
├── userId, movieId (FKs)
└── timestamps
```

---

## ☁️ Aiven MySQL Cloud Setup

### Step 1: Create Aiven Account
1. Go to https://aiven.io
2. Sign up (free tier available)
3. Create a new MySQL service
4. Select **MySQL 8.0 (latest)**
5. Choose **Free tier** (single node, Linux)
6. Name: `quickshow-db`
7. Region: Pick closest to your users
8. **Create Service** (takes ~2 minutes)

### Step 2: Get Connection Credentials
After service is created:
1. Go to **Connection Details**
2. Copy these (you'll need them):
   - **Host**: `quickshow-[id].i.aivencloud.com`
   - **Port**: `23918` (or shown in console)
   - **User**: `avnadmin`
   - **Password**: `[shown on screen, save it!]`
   - **Database**: Create a new DB named `quickshow_db`

### Step 3: Create Database
In Aiven console:
1. Click **Databases** tab
2. Click **Create Database**
3. Name: `quickshow_db`
4. Database collation: `utf8mb4_unicode_ci`
5. Create

### Step 4: Allow Connections
For local + Vercel access:
1. Click **IP Access List**
2. Add: `0.0.0.0/0` (allows all IPs - secure in production)
   - Or be specific: your local IP + Vercel IPs
3. Save

### Step 5: Test Connection
```bash
# From your terminal
mysql -h quickshow-[id].i.aivencloud.com \
      -P 23918 \
      -u avnadmin \
      -p quickshow_db
# Enter password when prompted
# If successful, you'll see mysql> prompt
```

---

## 🖥️ Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- MySQL client (optional, for testing)
- Git
- Vercel CLI (for testing Vercel functions locally)

### Step 1: Project Setup
```bash
# Clone or extract the project
cd Quickshow-master

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### Step 2: Create Local Environment Files

#### Create `server/.env`
```bash
# ============================================
# DATABASE (Aiven MySQL)
# ============================================
DB_HOST=quickshow-[your-id].i.aivencloud.com
DB_USER=avnadmin
DB_PASS=your-aiven-password-here
DB_NAME=quickshow_db
DB_PORT=23918

# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# ============================================
# CLERK AUTHENTICATION
# ============================================
CLERK_SECRET_KEY=sk_test_your-clerk-secret
CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-publishable

# ============================================
# EMAIL CONFIGURATION (Gmail)
# ============================================
EMAIL_ID=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# ============================================
# STRIPE PAYMENT (Test Keys)
# ============================================
STRIPE_SECRET_KEY=sk_test_your-stripe-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable

# ============================================
# TMDB API (Movie Data)
# ============================================
TMDB_API_KEY=your-tmdb-api-key

# ============================================
# INNGEST (Event Processing)
# ============================================
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=signkey-prod_your-inngest-key

# ============================================
# CLOUDINARY (Image Hosting)
# ============================================
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_KEY=your-cloudinary-key
CLOUDINARY_SECRET=your-cloudinary-secret

# ============================================
# JWT & SECURITY
# ============================================
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

#### Create `client/.env`
```bash
# Currency Symbol
VITE_CURRENCY=$

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-publishable

# API Base URL
VITE_BASE_URL=http://localhost:3000

# TMDB Image Base
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/original

# Stripe (Test Mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable
```

### Step 3: Get Required API Keys

#### Clerk (Authentication)
1. Go to https://dashboard.clerk.com
2. Create an account → new app
3. Copy **Secret Key** → `CLERK_SECRET_KEY`
4. Copy **Publishable Key** → `CLERK_PUBLISHABLE_KEY` & `VITE_CLERK_PUBLISHABLE_KEY`

#### Stripe (Payments)
1. Go to https://dashboard.stripe.com
2. Go to **Developers → API Keys**
3. Copy **Secret Key** → `STRIPE_SECRET_KEY`
4. Copy **Publishable Key** → `STRIPE_PUBLISHABLE_KEY` & `VITE_STRIPE_PUBLISHABLE_KEY`

#### TMDB (Movie Data)
1. Go to https://www.themoviedb.org/settings/api
2. Create API key
3. Copy → `TMDB_API_KEY`

#### Inngest (Event Processing)
1. Go to https://app.inngest.com
2. Create account
3. Create app → copy signing key
4. All keys are auto-generated

#### Gmail (Email)
1. Go to https://myaccount.google.com/apppasswords
2. Generate app password (not your main password!)
3. Copy → `EMAIL_PASSWORD`
4. Set `EMAIL_ID` to your Gmail

### Step 4: Start Development Servers

#### Terminal 1: Start Inngest Dev (needed for webhooks)
```bash
# Install Inngest CLI (one time)
npm install -g inngest-cli

# Start Inngest dev server
inngest dev
# You'll see: ✓ Dev server listening at http://localhost:8288
```

#### Terminal 2: Start Backend Server
```bash
cd server
npm start
# You'll see:
# ✓ Environment configuration loaded
# 📡 Connecting to MySQL...
# ✅ MySQL Connected via Sequelize to Aiven...
# ✅ Database synchronized...
# Server listening at http://localhost:3000
```

#### Terminal 3: Start Frontend Dev Server
```bash
cd client
npm run dev
# You'll see:
#   VITE v6.3.5  ready in 589 ms
#   ➜  Local:   http://localhost:5173/
```

### Step 5: Verify Everything Works
```bash
# Test backend (Terminal 4)
curl http://localhost:3000/

# Test database connection
curl http://localhost:3000/api/test/create-user

# Check if user was created
curl http://localhost:3000/api/test/all-users

# View frontend
Open http://localhost:5173 in browser
```

---

## 🚀 Vercel Deployment

### Prerequisites
- Vercel account (free)
- GitHub account (to push code)
- All environment variables ready

### Step 1: Prepare Repository

```bash
# If not using Git yet
git init
git add .
git commit -m "Initial commit for Quickshow deployment"

# Create GitHub repository
# Push your code to GitHub
git remote add origin https://github.com/your-username/quickshow.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd your-project-root
vercel

# Follow prompts:
# - Link to GitHub repo? Yes
# - Framework? "Other"
# - Root directory? "./server" for the function
# - Build command? Leave blank
```

#### Option B: Using Vercel Dashboard
1. Go to https://vercel.com
2. Click **New Project**
3. Import your GitHub repo
4. Framework Preset: **Other**
5. Root Directory: **./server**
6. Continue

### Step 3: Configure Environment Variables

In Vercel Dashboard:
1. Go to your project → **Settings → Environment Variables**
2. Add all variables from your `.env` file:
   ```
   DB_HOST=your-aiven-host
   DB_USER=avnadmin
   DB_PASS=your-password
   DB_NAME=quickshow_db
   DB_PORT=23918
   NODE_ENV=production
   PORT=3000
   FRONTEND_URL=https://your-vercel-domain.vercel.app
   CLERK_SECRET_KEY=sk_test_...
   CLERK_PUBLISHABLE_KEY=pk_test_...
   ... (all other keys)
   ```

### Step 4: Update Configuration Files

#### Update `server/vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node",
      "config": {
        "maxDuration": 60,
        "includeFiles": [
          "config/**",
          "controllers/**",
          "models/**",
          "routes/**",
          "middleware/**",
          "inngest/**",
          "package.json"
        ]
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "regions": ["sfo1"]
}
```

#### Update `client/package.json` Build Script
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Step 5: Update Root `vercel.json`
If deploying both frontend and backend from root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/vite.config.js",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "client/dist"
      }
    },
    {
      "src": "server/server.js",
      "use": "@vercel/node",
      "config": {
        "maxDuration": 60
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "client/dist/$1"
    },
    {
      "src": "/(.*)",
      "dest": "client/dist/index.html",
      "status": 200
    }
  ]
}
```

### Step 6: Update API URLs

#### Update `client/src/main.jsx`
```javascript
// Set up axios base URL
import axios from 'axios';

const apiUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
axios.defaults.baseURL = apiUrl;
```

### Step 7: Deploy
```bash
# Push to GitHub
git add .
git commit -m "Add Vercel configuration"
git push

# Vercel will automatically deploy when you push
# Check deployment status at https://vercel.com/dashboard
```

### Step 8: Post-Deployment Configuration

#### Update Clerk Webhooks
1. Go to https://dashboard.clerk.com
2. Webhooks → Update webhook URL
3. Change from `http://localhost:8288/api/inngest`
4. To: `https://your-vercel-domain.vercel.app/api/inngest`
5. Save

#### Update Stripe Webhooks
1. Go to https://dashboard.stripe.com
2. Developers → Webhooks
3. Update endpoint URL to: `https://your-vercel-domain.vercel.app/api/stripe`

#### Test Production
```bash
# Test if backend is working
curl https://your-vercel-domain.vercel.app/

# Test database connection
curl https://your-vercel-domain.vercel.app/api/test/create-user

# Check users
curl https://your-vercel-domain.vercel.app/api/test/all-users
```

---

## 🔧 Troubleshooting

### "Cannot connect to Aiven MySQL"
**Solution:**
1. Verify credentials in `.env`
2. Check IP allowlist in Aiven → IP Access List
3. Test from terminal: `mysql -h host -P port -u user -p`
4. Enable SSL: already configured in `config/db.js`

### "Inngest functions not triggering"
**Solution (Local):**
1. Start `inngest dev` first
2. Update Clerk webhook URL to `http://localhost:8288/api/inngest`
3. Check webhook log: `curl http://localhost:3000/api/debug/clerk-webhooks`

**Solution (Production):**
1. Deploy to Vercel first
2. Update Clerk webhook to Vercel URL
3. Inngest automatically processes events

### "Database disconnects/Connection drops"
**Solution:**
1. Increase pool size in `config/db.js`: `pool: { max: 10 }`
2. Add connection retry logic
3. Check Aiven MySQL service status (not overloaded)

### "CORS errors on Vercel"
**Solution:**
Update `server.js` CORS configuration:
```javascript
const corsOrigins = [
  process.env.FRONTEND_URL || 'YOUR_VERCEL_DOMAIN',
  'https://your-vercel-domain.vercel.app',
  'http://localhost:5173'
].filter(Boolean);
```

### "Environment variables not loading"
**Solution:**
1. Check Vercel → Settings → Environment Variables
2. Redeploy: `vercel --prod`
3. Or create `.env.production` for local production testing

---

## 💰 Cost Analysis

### Free Services ✅
| Service | Free Tier | Cost |
|---------|-----------|------|
| **Vercel** | 100 GB/mo bandwidth, unlimited deployments | $0 |
| **Aiven MySQL** | Single node, 5 conn, 1 CPU, 1GB RAM | $0 |
| **Clerk** | Up to 10k monthly active users | $0 |
| **Stripe** | No setup fees | 2.9% + $0.30 per transaction |
| **Inngest** | 2.5M events/month | $0 |
| **Nodemailer** | Self-hosted email | $0 |
| **TMDB** | Movie data API | $0 |
| **Cloudinary** | 25 GB/mo storage | $0 |
| **GitHub** | Unlimited public repos | $0 |

### Total Monthly Cost: **$0** ✅

### Upgrade When Needed
- **Aiven MySQL**: $19/mo (dedicated, high availability)
- **Vercel Pro**: $20/mo (more compute, priority support)
- **Clerk Pro**: Usage-based after free tier
- **Stripe**: Only when processing real payments (2.9% + $0.30)

---

## ✅ Deployment Checklist

- [ ] Aiven MySQL account created
- [ ] Database `quickshow_db` created
- [ ] Local `.env` file created with all keys
- [ ] Local development tested (all 3 servers running)
- [ ] GitHub repository created and code pushed
- [ ] Vercel project created and linked
- [ ] All environment variables added to Vercel
- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] Clerk webhook updated to Vercel URL
- [ ] Stripe webhook updated to Vercel URL
- [ ] Production URLs tested
- [ ] Database connection verified on Vercel
- [ ] Error logs checked in Vercel

---

## 📚 Useful Commands

```bash
# Development
npm run dev          # Start all servers
inngest dev         # Start Inngest dev
npm start           # Start backend
cd client && npm run dev  # Start frontend

# Deployment
git push            # Deploy to Vercel automatically
vercel --prod       # Deploy current branch

# Testing
curl http://localhost:3000/api/test/all-users
curl https://your-vercel-app.vercel.app/api/test/all-users

# Database
mysql -h host -P port -u user -p database
SELECT COUNT(*) FROM Users;

# Logs
vercel logs             # View Vercel logs
tail -f server.log      # Local server logs
```

---

## 🎯 Next Steps

1. **Aiven Setup** (15 min): Create MySQL database
2. **Local Setup** (30 min): Install dependencies, create `.env`
3. **Get API Keys** (30 min): Clerk, Stripe, TMDB, etc.
4. **Test Locally** (15 min): Run all 3 servers, verify connection
5. **Deploy to Vercel** (15 min): Push to GitHub, configure deployment
6. **Production Config** (15 min): Update webhooks, test endpoints
7. **Monitor** (ongoing): Check Vercel logs, Aiven metrics

**Total estimated time: 2-3 hours for complete setup**

---

## 🆘 Getting Help

- **Vercel Docs**: https://vercel.com/docs
- **Aiven Docs**: https://aiven.io/docs
- **Sequelize Docs**: https://sequelize.org
- **Clerk Docs**: https://clerk.com/docs
- **Inngest Docs**: https://www.inngest.com/docs
- **Stripe Docs**: https://stripe.com/docs

---

**Created**: April 2026 | **Updated**: Latest
**Quickshow v1.0** - Full-Stack Movie Booking Platform
