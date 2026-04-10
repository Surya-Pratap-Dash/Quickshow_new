# 🚀 Quickshow - Quick Start Guide (30 minutes)

## Prerequisites
- Node.js 18+ installed
- npm or yarn
- Aiven MySQL account (free tier)
- Clerk account (free tier)
- Stripe account (test mode)
- GitHub account
- Vercel account (free tier)

---

## ⚡ 5-Minute Setup Checklist

### 1. Clone/Extract Project
```bash
cd Quickshow-master
npm install -g inngest-cli
```

### 2. Install Dependencies
```bash
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Copy Environment Files
```bash
# Copy template to local
cp server/.env.local server/.env
cp client/.env.local client/.env

# Edit both files with YOUR credentials
# See "Getting API Keys" section below
```

### 4. Start Services (3 Terminals)
```bash
# Terminal 1: Start Inngest Dev (MUST BE FIRST)
inngest dev
# You'll see: ✓ Development server listening at http://localhost:8288

# Terminal 2: Start Backend
cd server && npm start
# You'll see: ✅ MySQL Connected via Sequelize to Aiven...

# Terminal 3: Start Frontend
cd client && npm run dev
# You'll see: VITE ready in 589 ms
```

### 5. Open in Browser
```
http://localhost:5173
```

---

## 🔑 Getting API Keys (15 minutes)

### Clerk (Authentication)
1. Go to https://dashboard.clerk.com
2. Sign up → Create App
3. Choose authentication method
4. Copy from **API Keys**:
   - Secret Key → `CLERK_SECRET_KEY`
   - Publishable Key → `CLERK_PUBLISHABLE_KEY`
5. Also set `VITE_CLERK_PUBLISHABLE_KEY` in client/.env

### Stripe (Payments)
1. Go to https://dashboard.stripe.com
2. Go to **Developers → API Keys**
3. Copy (Test Mode):
   - Secret Key → `STRIPE_SECRET_KEY`
   - Publishable Key → `STRIPE_PUBLISHABLE_KEY`
4. Also set `VITE_STRIPE_PUBLISHABLE_KEY` in client/.env

### TMDB (Movie Data)
1. Go to https://www.themoviedb.org/settings/api
2. Create account → Create API Key
3. Copy to `TMDB_API_KEY`

### Aiven MySQL (Database)
1. Go to https://aiven.io
2. Create account → Create MySQL service (free tier)
3. Copy connection details:
   - `DB_HOST` (the hostname)
   - `DB_USER` (usually `avnadmin`)
   - `DB_PASS` (save somewhere safe!)
   - `DB_NAME` (create database called `quickshow_db`)
   - `DB_PORT` (usually `23918`)

### Gmail (Email)
1. Go to https://myaccount.google.com/apppasswords
2. Generate app password for "Mail" + "Windows"
3. Copy 16-character password → `EMAIL_PASSWORD`
4. Set `EMAIL_ID` to your Gmail address

### Inngest (Event Processing)
- Auto-generated when you create account at https://app.inngest.com
- Copy keys provided

---

## ✅ Verify Everything Works

```bash
# Test 1: Database Connection
curl http://localhost:3000/api/test/create-user -X POST

# Expected response:
# {"success":true,"user":{"id":"...", "name":"Test User", ...}}

# Test 2: Get All Users
curl http://localhost:3000/api/test/all-users

# Expected response:
# {"count":1,"users":[...]}

# Test 3: Open Frontend
# Visit http://localhost:5173
# You should see the Quickshow app
```

---

## 📋 Common Issues & Fixes

### "Cannot connect to database"
```bash
# 1. Check Aiven credentials
# 2. Make sure DB_HOST, DB_USER, DB_PASS correct in .env
# 3. Verify Aiven IP allowlist includes 0.0.0.0/0
# 4. Test connection: mysql -h HOST -P PORT -u USER -p DBNAME
```

### "Clerk webhook not working"
```bash
# 1. Start inngest dev FIRST
inngest dev

# 2. Update Clerk webhook URL in dashboard
# From: http://localhost:3000/api/inngest
# To: http://localhost:8288/api/inngest

# 3. Check webhook log
curl http://localhost:3000/api/debug/clerk-webhooks
```

### "CORS errors"
```bash
# Already fixed in latest version
# If still having issues:
# 1. Check FRONTEND_URL in server/.env
# 2. Should be http://localhost:5173 for local dev
```

---

## 🎯 Next: Deploy to Vercel

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) after local setup works.

---

## 📚 File Structure
```
Quickshow-master/
├── server/                    # Express backend + Aiven MySQL
│   ├── config/               # Database configuration
│   ├── controllers/          # API logic
│   ├── models/              # Sequelize models (User, Show, Booking, etc)
│   ├── routes/              # API routes
│   ├── middleware/          # Auth, etc
│   ├── inngest/             # Event processing
│   ├── server.js            # Express app
│   ├── .env                 # Your credentials (create this!)
│   └── vercel.json          # Vercel config
├── client/                   # React frontend + Vite
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── App.jsx         # Main app
│   ├── .env                 # Frontend env (create this!)
│   └── vite.config.js      # Vite config
├── COMPLETE_SETUP_GUIDE.md   # Detailed setup guide
├── ISSUES_AND_FIXES.md       # Known issues & solutions
└── VERCEL_DEPLOYMENT.md      # Deploy to Vercel (coming)
```

---

## 🆘 Can't Find a Key?

1. **Clerk Keys**: https://dashboard.clerk.com → API Keys
2. **Stripe Keys**: https://dashboard.stripe.com → Developers → API Keys (Test mode)
3. **Aiven**: https://console.aiven.io → Your MySQL service → Connection Details
4. **TMDB**: https://www.themoviedb.org → Settings → API
5. **Gmail**: https://myaccount.google.com → Security → App passwords

---

## ✨ Success Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (npm install)
- [ ] Aiven MySQL account created
- [ ] All API keys obtained
- [ ] `.env` files created in server/ and client/
- [ ] Inngest dev running
- [ ] Backend server running (shows "✅ MySQL Connected")
- [ ] Frontend running (shows VITE ready)
- [ ] Can see app at http://localhost:5173
- [ ] API test endpoints work

---

**Estimated Time to Full Setup**: 30 minutes

**Next Step**: Once local setup works → See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
