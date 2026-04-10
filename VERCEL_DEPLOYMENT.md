# 🚀 Quickshow - Vercel Deployment Guide

## Cost: FREE ✅

Vercel's free tier includes everything you need:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month (more than enough)
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Edge functions
- ✅ Environment variables

---

## Prerequisites

Before deploying, ensure:
- ✅ Local setup works (see QUICK_START.md)
- ✅ All API keys obtained
- ✅ GitHub account created
- ✅ Code pushed to GitHub
- ✅ Vercel account created

---

## Step-by-Step Deployment (25 minutes)

### Step 1: Prepare Your Repository (5 min)

```bash
# Make sure you're in project root
cd Quickshow-master

# Initialize Git (if not already done)
git init
git add .
git commit -m "Initial Quickshow setup with Aiven MySQL"

# Create GitHub repo
# 1. Go to https://github.com/new
# 2. Create repository "quickshow-app"
# 3. Don't initialize with README
# 4. Click Create

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/quickshow-app.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel (10 min)

#### Method A: Vercel CLI (Faster)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Follow prompts:
# - Link to GitHub? → Yes
# - Select GitHub account
# - Select repository
# - Is root correct? → Yes)
# - Framework? → Other
# - Build command? → (leave empty)
# - Output directory? → (leave empty)
```

#### Method B: Vercel Dashboard
1. Go to https://vercel.com
2. Click **New Project**
3. Click **Import Git Repository**
4. Select your GitHub repo
5. Click **Import**
6. Leave Framework as default
7. Click **Deploy**

### Step 3: Configure Environment Variables (8 min)

After initial deployment, Vercel will show your project dashboard.

1. Click **Settings** → **Environment Variables**
2. Add each variable from your `server/.env`:

```
DB_HOST = quickshow-[id].i.aivencloud.com
DB_USER = avnadmin
DB_PASS = your-aiven-password
DB_NAME = quickshow_db
DB_PORT = 23918
NODE_ENV = production
PORT = 3000
FRONTEND_URL = (see Step 4 below)

CLERK_SECRET_KEY = sk_test_...
CLERK_PUBLISHABLE_KEY = pk_test_...

STRIPE_SECRET_KEY = sk_test_...
STRIPE_PUBLISHABLE_KEY = pk_test_...
STRIPE_WEBHOOK_SECRET = whsec_test_...

TMDB_API_KEY = your-key-here

INNGEST_EVENT_KEY = your-key-here
INNGEST_SIGNING_KEY = signkey-prod_...

EMAIL_ID = your-email@gmail.com
EMAIL_PASSWORD = 16-char-app-password

CLOUDINARY_NAME = your-cloud-name
CLOUDINARY_KEY = your-key
CLOUDINARY_SECRET = your-secret

JWT_SECRET = your-secret-at-least-32-chars
```

**Important**: After adding variables, you **MUST redeploy**:
```bash
vercel --prod
```

### Step 4: Find Your Vercel URL

After deployment:
1. Go to Vercel dashboard
2. Find your project → **Deployments** tab
3. Latest deployment shows URL like: `https://quickshow-app.vercel.app`
4. This is your `FRONTEND_URL`

Add to Vercel Environment Variables:
```
FRONTEND_URL = https://quickshow-app.vercel.app
```

Then redeploy again:
```bash
vercel --prod
```

### Step 5: Update External Webhooks (5 min)

#### Update Clerk Webhook
1. Go to https://dashboard.clerk.com
2. **Webhooks** section
3. Edit existing webhook (or create new)
4. Change endpoint URL from:
   - `http://...` (local)
   - To: `https://quickshow-app.vercel.app/api/inngest`
5. Save

#### Update Stripe Webhook
1. Go to https://dashboard.stripe.com
2. **Developers** → **Webhooks**
3. Edit endpoint
4. Change URL to: `https://quickshow-app.vercel.app/api/stripe`
5. Save

---

## ✅ Verification Checklist

### API Endpoints
```bash
# Test 1: Server is running
curl https://quickshow-app.vercel.app/
# Expected: "Server is Live!"

# Test 2: Database connection
curl https://quickshow-app.vercel.app/api/test/all-users
# Expected: {"count":1,"users":[...]}

# Test 3: Create test user
curl -X POST https://quickshow-app.vercel.app/api/test/create-user
# Expected: {"success":true,"user":{...}}
```

### Check Vercel Logs
```bash
# View production logs
vercel logs --prod

# Should show:
# ✓ Environment configuration loaded
# 📡 Connecting to MySQL...
# ✅ MySQL Connected via Sequelize to Aiven...
```

### Test in Browser
1. Visit `https://quickshow-app.vercel.app` in browser
2. You should see the Quickshow app
3. Try signing up with Clerk
4. Check if user appears in database

---

## 🔧 Troubleshooting Vercel Deployment

### "500 Error" on API Endpoint

**Check logs**:
```bash
vercel logs --prod
```

**Common causes**:
1. **Missing environment variable**
   - Solution: Add to Vercel → Settings → Environment Variables
   - Then: `vercel --prod` (redeploy)

2. **Database connection failed**
   - Check: Is DB_HOST, DB_USER, DB_PASS correct?
   - Check: Is Aiven MySQL service running?
   - Check: IP allowlist includes Vercel (auto-configured)

3. **Inngest not processing events**
   - Solution: Check Clerk webhook pointing to correct Vercel URL
   - Verify: Inngest account linked
   - Check: Vercel logs for Inngest errors

### "CORS Error"

**This should NOT happen with our config**, but if it does:
1. Check client `.env` has correct `VITE_BASE_URL`
2. Verify Vercel `FRONTEND_URL` is set correctly
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Database Connection Timeouts

**On Vercel (serverless functions)**:
1. Connections are automatically managed
2. Timeouts already configured (60 seconds)
3. If still happening:
   - Reduce query time
   - Check Aiven MySQL performance
   - Consider upgrading Aiven tier

### Stripe Webhooks Not Firing

**Verify webhook is registered**:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Check endpoint shows recent API calls
3. If no calls:
   - Test payment in app
   - Check Stripe webhook has correct URL
   - Verify event types are selected

---

## 📊 Monitoring & Logs

### View Logs
```bash
vercel logs --prod              # All logs
vercel logs --prod --follow     # Stream logs in real-time
```

### Check Deployment Status
```bash
vercel ls
vercel info                     # Show project details
```

### Rollback to Previous Deployment
```bash
vercel deploy --prod [hash]     # Deploy specific hash
vercel ls                       # Find hash of previous deployment
```

---

## 🔄 Continuous Deployment

Every time you push to GitHub, Vercel automatically:
1. Detects push
2. Runs build command
3. Deploys new version
4. Shows URL

No manual steps needed!

```bash
# Make a change locally
git add .
git commit -m "Add feature XYZ"
git push

# Automatically deployed to Vercel ✨
```

---

## 💰 Cost Breakdown

| Service | Cost |
|---------|------|
| Vercel (hosting) | Free |
| Aiven MySQL (database) | Free (up to 1GB) |
| Clerk (auth) | Free (up to 5000 users) |
| Stripe (payments) | 2.9% + $0.30 per transaction* |
| Inngest (events) | Free (up to 2.5M events/month) |
| **Total** | **$0 (unless you process payments)** |

*Stripe only charges when you actually process real payments

---

## 🆘 Need Custom Domain?

### Setup Custom Domain (Optional)

1. In Vercel → Settings → Domains
2. Add your domain (e.g., quickshow.com)
3. Update DNS records with values shown
4. Wait for DNS propagation (5-30 minutes)

### Update Environment Variables for Custom Domain

```
FRONTEND_URL = https://quickshow.com
```

Then redeploy:
```bash
vercel --prod
```

---

## 📝 Post-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] All environment variables added
- [ ] API endpoints returning 200 OK
- [ ] Clerk webhook updated to Vercel URL
- [ ] Stripe webhook updated to Vercel URL
- [ ] Can see app at https://quickshow-app.vercel.app
- [ ] Database connection working
- [ ] Email sending tested
- [ ] Real payment test completed

---

## 🚀 Success Indicators

1. **Vercel shows "Ready"** for deployment
2. **Logs show no errors**:
   ```
   ✓ Environment configuration loaded
   ✅ MySQL Connected via Sequelize to Aiven...
   ```
3. **API test returns data**:
   ```bash
   curl https://quickshow-app.vercel.app/api/test/all-users
   # Returns user list
   ```
4. **Frontend loads** without errors
5. **Clerk sign-up works** and creates users
6. **Payments work** in test mode

---

## 🔐 Security Checklist

- [ ] All secrets stored in Vercel (not in code)
- [ ] Database password never committed to GitHub
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Clerk webhook verified with secret
- [ ] Stripe webhook verified with secret
- [ ] JWT_SECRET unique and 32+ chars
- [ ] No API keys in public code

---

## 📞 Support

- **Vercel Status**: https://vercel.com/status
- **Vercel Docs**: https://vercel.com/docs
- **Aiven Dashboard**: https://console.aiven.io
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Stripe Dashboard**: https://dashboard.stripe.com

---

## 🎉 You're Live!

Your Quickshow app is now deployed to Vercel with:
- ✅ Cloud MySQL database (Aiven)
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Unlimited scalability
- ✅ Free tier (no credit card needed)
- ✅ Automatic deployments on git push

**Share your link**: `https://quickshow-app.vercel.app`

---

**Estimated Total Time**: 2-3 hours (including local setup)
- Local setup: 30 min
- Getting API keys: 30 min
- Vercel deployment: 25 min
- Testing: 30 min

**You're done!** 🎬🍿
