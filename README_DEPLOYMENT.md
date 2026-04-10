# 🎬 Quickshow - Movie Booking Application

> A complete full-stack movie ticket booking application with Aiven MySQL cloud database, built for free on Vercel.

## ✨ Features

- 🎭 **Movie Discovery** - Browse trending & popular movies
- 🎫 **Smart Seat Selection** - Visual seat map with real-time availability
- 💳 **Secure Payments** - Stripe integration for safe transactions
- 👤 **User Accounts** - Clerk authentication with profile management  
- ❤️ **Favorites System** - Save favorite movies
- 📊 **Admin Dashboard** - Manage shows and bookings
- ☁️ **Cloud Database** - Aiven MySQL (free tier)
- 🚀 **Serverless Deployment** - Vercel auto-scaling
- 📧 **Email Notifications** - Booking confirmations via Gmail
- ⚡ **Event Processing** - Inngest for reliable workflows

## 🚀 Quick Start (30 minutes)

### 1. Prerequisites
- Node.js 18+ installed
- GitHub account
- Free tier accounts:
  - Aiven (MySQL database)
  - Vercel (hosting)
  - Clerk (authentication)
  - Stripe (payments)

### 2. Clone & Install
```bash
cd Quickshow-master

# Install dependencies
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Setup Environment
```bash
# Copy template files
cp server/.env.local server/.env
cp client/.env.local client/.env

# Edit with your API keys (see step 4)
```

### 4. Get API Keys
Get these free keys from:
- **Clerk**: https://dashboard.clerk.com (Auth)
- **Stripe**: https://dashboard.stripe.com (Payments)
- **TMDB**: https://www.themoviedb.org/settings/api (Movies)
- **Aiven**: https://aiven.io (Database)
- **Gmail**: https://myaccount.google.com/apppasswords (Email)

### 5. Start Development
```bash
# Terminal 1: Inngest (handles webhooks)
inngest dev

# Terminal 2: Backend server
cd server && npm start

# Terminal 3: Frontend dev server
cd client && npm run dev
```

Open http://localhost:5173 and you're done! 🎉

---

## 📚 Documentation

Choose your learning style:

| Document | Purpose | Time |
|----------|---------|------|
| **[QUICK_START.md](./QUICK_START.md)** | Get running in 30 minutes | ⚡ 30 min |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Understand the system design | 📖 20 min |
| **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** | Comprehensive setup guide | 📚 50 min |
| **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** | Deploy to production | 🚀 25 min |
| **[ISSUES_AND_FIXES.md](./ISSUES_AND_FIXES.md)** | Troubleshooting reference | 🔧 As needed |
| **[README_SETUP.md](./README_SETUP.md)** | Setup guide index | 🗺️ 5 min |

## 🏗️ Technology Stack

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Clerk** - User authentication

### Backend
- **Express.js** - REST API server
- **Sequelize** - ORM for database
- **MySQL** - Relational database (Aiven)

### Services
- **Stripe** - Payment processing
- **Inngest** - Event processing
- **TMDB API** - Movie database
- **Nodemailer** - Email notifications
- **Vercel** - Serverless hosting

## 💰 Cost: FREE ✅

All services use free tiers:
- ✅ Vercel (100GB bandwidth/month)
- ✅ Aiven MySQL (1GB storage)
- ✅ Clerk (up to 5,000 users)
- ✅ Inngest (up to 2.5M events)
- ✅ Stripe (no setup fee)
- ✅ TMDB (free API)

**Total monthly cost: $0**

## 🗂️ Project Structure

```
Quickshow-master/
├── server/                    # Express API
│   ├── config/               # Database configuration
│   ├── controllers/          # Business logic
│   ├── models/              # Database schemas
│   ├── routes/              # API routes
│   ├── middleware/          # Auth & validation
│   ├── inngest/             # Event handlers
│   └── server.js            # Main server
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Global state
│   │   └── App.jsx         # Main app
│   └── vite.config.js      # Vite configuration
├── QUICK_START.md           # 30-minute setup
├── ARCHITECTURE.md          # System design
├── COMPLETE_SETUP_GUIDE.md  # Comprehensive guide
├── VERCEL_DEPLOYMENT.md     # Deployment guide
└── README_SETUP.md          # Documentation index
```

## 🔍 Verify Your Setup

Run the verification script:

**Windows:**
```bash
verify-setup.bat
```

**Mac/Linux:**
```bash
bash verify-setup.sh
```

This checks:
- ✅ Dependencies installed
- ✅ Project structure
- ✅ Environment files
- ✅ Configuration files

## 🚀 Deploy to Vercel

One command to deploy to production with auto-scaling:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed steps.

## 🆘 Getting Help

### Quick Reference
- **FAQ & Common Issues**: [ISSUES_AND_FIXES.md](./ISSUES_AND_FIXES.md)
- **System Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Deployment Help**: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

### External Resources
- [Vercel Docs](https://vercel.com/docs)
- [Sequelize Docs](https://sequelize.org)
- [Clerk Documentation](https://clerk.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [React Documentation](https://react.dev)
- [Inngest Guide](https://www.inngest.com/docs)

## 📋 Commands Reference

### Development
```bash
# Start all services
inngest dev              # Terminal 1
npm start               # Terminal 2 (in server/)
npm run dev             # Terminal 3 (in client/)
```

### Testing
```bash
# Create test user
curl -X POST http://localhost:3000/api/test/create-user

# Get all users
curl http://localhost:3000/api/test/all-users

# Check webhook log
curl http://localhost:3000/api/debug/clerk-webhooks
```

### Deployment
```bash
# Push to GitHub
git push

# Deploy to Vercel (with Vercel CLI)
vercel --prod

# View logs
vercel logs --prod
```

## ✅ Pre-Deployment Checklist

- [ ] Local setup works (all 3 servers running)
- [ ] Database connection successful
- [ ] Clerk sign-up/login working
- [ ] Stripe payments in test mode working
- [ ] Email notifications sending
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Webhooks updated to production URL
- [ ] All API endpoints returning 200 OK

## 🎯 Next Steps

1. **Just starting?** → Read [QUICK_START.md](./QUICK_START.md) (30 min)
2. **Want to understand everything?** → Read [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Ready to deploy?** → Follow [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
4. **Troubleshooting?** → Check [ISSUES_AND_FIXES.md](./ISSUES_AND_FIXES.md)

## 📊 Project Stats

- **Backend**: ~500 lines of Express code
- **Frontend**: ~2000 lines of React code
- **Database**: 5 tables with relationships
- **API Endpoints**: 15+ REST endpoints
- **Event Handlers**: 4 Inngest functions
- **Documentation**: 50+ pages of guides

## 👤 Author

Created for learning full-stack development with cloud services.

## 📄 License

MIT License - Feel free to use as template

## 🎉 Ready?

```bash
# Let's go!
npm install && cd server && npm install && cd ../client && npm install
```

Then read [QUICK_START.md](./QUICK_START.md) for next steps!

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Status**: Production Ready ✅

**Questions?** See [README_SETUP.md](./README_SETUP.md) for documentation index.
