import express from "express";
import cors from "cors";
import "dotenv/config";
// FIX: Ensure the folder name (config vs configs) matches your Windows folder exactly
import { connectDB, startKeepAlive } from "./config/db.js"; 
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

// Routes
import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";

// Controllers
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

// Models
import User from "./models/User.js";

// FIX: If you use nodeMailer, import it with the .js extension
// import nodeMailer from "./configs/nodeMailer.js"; 

const app = express();

// FIX: Use process.env.PORT for Railway, default to 3000 for local
const port = process.env.PORT || 3000;

// Validate required environment variables for Aiven MySQL
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME', 'DB_PORT'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('📋 Please ensure your .env file contains:');
  console.error('  - DB_HOST=quickshowdb-767-suryadashpratap-07e5.i.aivencloud.com');
  console.error('  - DB_USER=avnadmin');
  console.error('  - DB_PASS=your_password');
  console.error('  - DB_NAME=quickshow_db');
  console.error('  - DB_PORT=23918');
  process.exit(1);
}

// Validate JWT Secret for security
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  console.error('❌ JWT_SECRET must be at least 32 characters for production');
  process.exit(1);
}

console.log('✓ Environment configuration loaded');
console.log(`📡 Connecting to MySQL at: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

// Connect to Database
await connectDB();

// Start keep-alive mechanism to prevent connection timeout
startKeepAlive();
console.log('✅ [Database] Keep-alive mechanism started');

// Stripe Webhooks (Must be BEFORE express.json())
app.use(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS Configuration for Vercel (local + cloud)
const corsOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'localhost:5173',
  process.env.FRONTEND_URL || '',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''
].filter(Boolean);

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(clerkMiddleware());

// 🔔 CLERK WEBHOOK HANDLER - CRITICAL FOR USER SYNC
// Track webhook history for debugging
let clerkWebhookHistory = [];

// Convert Clerk webhooks to Inngest events
app.post("/api/webhooks/clerk", async (req, res) => {
  const event = req.body;
  const timestamp = new Date().toISOString();
  
  console.log("\n" + "█".repeat(100));
  console.log(`🔔 [CLERK WEBHOOK RECEIVED] ${timestamp}`);
  console.log(`📋 Event Type: ${event.type}`);
  console.log(`👤 User Email: ${event.data?.email_addresses?.[0]?.email_address || 'N/A'}`);
  console.log(`👤 User Name: ${event.data?.first_name} ${event.data?.last_name || ''}`);
  console.log(`👤 User ID: ${event.data?.id}`);
  console.log("█".repeat(100));
  
  // Store in history for debugging
  clerkWebhookHistory.push({
    timestamp,
    type: event.type,
    email: event.data?.email_addresses?.[0]?.email_address,
    userId: event.data?.id,
    firstName: event.data?.first_name,
    lastName: event.data?.last_name,
    status: 'received'
  });
  clerkWebhookHistory = clerkWebhookHistory.slice(-50); // Keep last 50
  
  try {
    // Map Clerk webhook types to Inngest events
    let inngestEventName = null;
    
    if (event.type === 'user.created') {
      inngestEventName = 'clerk/user.created';
      console.log(`\n✅ [Action] New user signup detected!`);
    } else if (event.type === 'user.updated') {
      inngestEventName = 'clerk/user.updated';
      console.log(`\n✅ [Action] User profile updated`);
    } else if (event.type === 'user.deleted') {
      inngestEventName = 'clerk/user.deleted';
      console.log(`\n✅ [Action] User deleted`);
    }
    
    if (!inngestEventName) {
      console.log(`⚠️  [Skip] Event type not handled: ${event.type}`);
      return res.json({ success: true, skipped: true, message: `Event type ${event.type} not handled` });
    }
    
    console.log(`\n📤 [Process] Converting to Inngest event: ${inngestEventName}`);
    console.log(`   Event Name: ${inngestEventName}`);
    console.log(`   Email: ${event.data?.email_addresses?.[0]?.email_address}`);
    console.log(`   Name: ${event.data?.first_name} ${event.data?.last_name}`);
    
    // Send as Inngest event
    console.log(`\n📨 [Send] Sending to Inngest event queue...`);
    
    const eventResult = await inngest.send({
      name: inngestEventName,
      data: event.data
    });
    
    const eventId = eventResult[0]?.ids?.[0] || 'processing';
    console.log(`✅ [Queued] Event sent to Inngest!`);
    console.log(`   Event ID: ${eventId}`);
    console.log(`   Status: Waiting for function execution...`);
    
    // Update history
    clerkWebhookHistory[clerkWebhookHistory.length - 1].status = 'queued';
    clerkWebhookHistory[clerkWebhookHistory.length - 1].inngestEventId = eventId;
    
    console.log("█".repeat(100) + "\n");
    
    res.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      inngestEvent: inngestEventName,
      eventId: eventId
    });
    
  } catch (error) {
    console.log(`\n❌ [ERROR] Failed to process webhook:`);
    console.log(`   Message: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
    console.log("█".repeat(80) + "\n");
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 🔔 CLERK WEBHOOK DEBUGGING ENDPOINT (for troubleshooting)
// This captures all Clerk webhook events
app.post("/api/debug/clerk-webhook", (req, res) => {
  const event = req.body;
  console.log("\n🔔 [Clerk Webhook] Received event");
  console.log("📋 Event type:", event.type);
  console.log("📦 Full payload:", JSON.stringify(event, null, 2));
  console.log("✅ Webhook received and logged\n");
  res.json({ success: true, message: "Webhook logged" });
});

// Get Clerk webhook events log
let clerkWebhookLog = [];
app.post("/api/debug/log-clerk-webhook", (req, res) => {
  const event = req.body;
  clerkWebhookLog.push({
    timestamp: new Date().toISOString(),
    type: event.type,
    userId: event.data?.id,
    email: event.data?.email_addresses?.[0]?.email_address,
    firstName: event.data?.first_name,
    fullPayload: event
  });
  // Keep only last 50 events
  clerkWebhookLog = clerkWebhookLog.slice(-50);
  console.log(`📊 [Webhook Log] Event stored. Total: ${clerkWebhookLog.length}`);
  res.json({ success: true, logged: true });
});

// View all Clerk webhook events
app.get("/api/debug/clerk-webhooks", (req, res) => {
  console.log(`📊 [Webhook Log] Returning ${clerkWebhookLog.length} events`);
  res.json({
    total: clerkWebhookLog.length,
    events: clerkWebhookLog,
    message: "These are all Clerk webhook events received since server started"
  });
});

// 🧪 DIAGNOSTIC ENDPOINTS
// Test if database is working - manually create a test user
app.post("/api/test/create-user", async (req, res) => {
  try {
    console.log("🔬 [Test] Attempting manual user creation...");
    const testUser = await User.create({
      id: `test-user-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      name: "Test User",
      image: "https://via.placeholder.com/150"
    });
    console.log("✅ [Test] User created successfully");
    res.json({ success: true, user: testUser.toJSON() });
  } catch (error) {
    console.error("❌ [Test] Failed to create user:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check all users in database
app.get("/api/test/all-users", async (req, res) => {
  try {
    console.log("🔬 [Test] Fetching all users from database...");
    const users = await User.findAll();
    console.log(`✅ [Test] Found ${users.length} user(s)`);
    res.json({ 
      count: users.length, 
      users: users.map(u => u.toJSON())
    });
  } catch (error) {
    console.error("❌ [Test] Failed to fetch users:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook event log (to see if webhooks are being received)
let webhookLog = [];
let inngestProcessingLog = [];

app.post("/api/test/webhook-log", (req, res) => {
  const event = req.body;
  console.log("🔔 [Webhook] Received event:", event.type || event.event);
  webhookLog.push({
    timestamp: new Date(),
    type: event.type || event.event,
    data: event.data || event
  });
  // Keep only last 20 events
  webhookLog = webhookLog.slice(-20);
  res.json({ logged: true });
});

// Get webhook log to see what events were received
app.get("/api/test/webhook-log", (req, res) => {
  res.json({ 
    totalReceived: webhookLog.length, 
    events: webhookLog 
  });
});

// Track Inngest webhook processing attempts
app.post("/api/test/log-inngest-event", (req, res) => {
  const { eventType, data, status } = req.body;
  inngestProcessingLog.push({
    timestamp: new Date(),
    eventType,
    data,
    status
  });
  inngestProcessingLog = inngestProcessingLog.slice(-50);
  console.log(`📊 [Inngest] ${eventType} - ${status}`);
  res.json({ logged: true });
});

// Get Inngest processing log
app.get("/api/test/inngest-processing-log", (req, res) => {
  res.json({
    totalProcessed: inngestProcessingLog.length,
    events: inngestProcessingLog
  });
});

// API Routes
app.get("/", (req, res) => res.send("Server is Live!"));

// 🔍 DIAGNOSTIC ENDPOINTS
// Check Inngest status
app.get("/api/diagnose/inngest-status", (req, res) => {
  console.log("\n🔍 [Diagnose] Checking Inngest status...");
  res.json({
    inngestConfigured: !!inngest,
    inngestId: inngest?.id,
    message: "Inngest is properly configured. Webhook URL: http://localhost:8288/api/inngest (for local dev with inngest dev running)",
    instructions: [
      "1. Make sure 'inngest dev' is running in Terminal 1",
      "2. Verify Clerk webhook URL is set to: http://localhost:8288/api/inngest",
      "3. NOT http://localhost:3000/api/inngest",
      "4. Go to https://dashboard.clerk.com → Webhooks section",
      "5. Click on your webhook endpoint",
      "6. Check 'Endpoint URL' field"
    ],
    status: "✅ Ready to receive webhooks on /api/inngest"
  });
});

// Check if webhooks are arriving
app.get("/api/diagnose/webhook-events", (req, res) => {
  const recentEvents = clerkWebhookLog.slice(-5);
  res.json({
    totalWebhooksReceived: clerkWebhookLog.length,
    lastReceivedTime: clerkWebhookLog[clerkWebhookLog.length - 1]?.timestamp || "Never",
    recentEvents: recentEvents,
    message: clerkWebhookLog.length === 0 ? "❌ No webhooks received yet. Check Clerk configuration." : "✅ Webhooks are being received"
  });
});

// Manual sync test
app.post("/api/diagnose/manual-sync", async (req, res) => {
  try {
    console.log("\n🔬 [Diagnose] Manual sync test - creating user...");
    const testUser = await User.create({
      id: `manual-sync-${Date.now()}`,
      email: `manual-${Date.now()}@example.com`,
      name: "Manual Sync Test",
      image: null
    });
    console.log("✅ [Diagnose] Manual sync successful!");
    res.json({
      success: true,
      message: "User created successfully via manual sync",
      user: testUser.toJSON()
    });
  } catch (error) {
    console.error("❌ [Diagnose] Manual sync failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Manual sync failed",
      error: error.message
    });
  }
});

// View webhook history and recent creations
app.get("/api/debug/webhook-history", async (req, res) => {
  try {
    // Get recent users from database
    const recentUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
      attributes: ['id', 'email', 'name', 'createdAt']
    });

    res.json({
      webhookHistory: clerkWebhookHistory,
      recentlyCreatedUsers: recentUsers.map(u => u.toJSON()),
      totalWebhooksReceived: clerkWebhookHistory.length,
      message: "Webhook history and recent user creations"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get users created in the last X minutes
app.get("/api/debug/recent-signups", async (req, res) => {
  try {
    const minutesAgo = parseInt(req.query.minutes || '5');
    const thresholdTime = new Date(Date.now() - minutesAgo * 60 * 1000);
    
    const recentUsers = await User.findAll({
      where: {
        createdAt: {
          [Op.gte]: thresholdTime
        }
      },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'email', 'name', 'createdAt']
    });

    res.json({
      searchCriteria: {
        minutesAgo: minutesAgo,
        afterTime: thresholdTime.toISOString()
      },
      recentSignups: recentUsers.map(u => ({
        ...u.toJSON(),
        signupTime: new Date(u.createdAt).toLocaleString()
      })),
      totalFound: recentUsers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Webhook processing status
app.get("/api/debug/status", async (req, res) => {
  try {
    const totalUsers = await User.count();
    const last5Users = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'email', 'name', 'createdAt']
    });

    res.json({
      status: "✅ Server is running",
      database: {
        connected: true,
        totalUsers: totalUsers,
        last5Users: last5Users.map(u => ({
          email: u.email,
          created: u.createdAt.toLocaleString()
        }))
      },
      webhooks: {
        totalReceived: clerkWebhookHistory.length,
        lastWebhook: clerkWebhookHistory[clerkWebhookHistory.length - 1] || null
      },
      services: {
        express: true,
        database: true,
        inngest: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Logger middleware for inngest endpoint
app.use((req, res, next) => {
  if (req.path === '/api/inngest') {
    console.log("\n" + "=".repeat(80));
    console.log(`🔔 [Webhook Received] ${new Date().toISOString()}`);
    console.log(`📍 Endpoint: ${req.method} ${req.path}`);
    console.log(`📦 Event Type: ${req.body?.type || req.body?.data?.id ? 'clerk event' : 'unknown'}`);
    
    const originalSend = res.send;
    res.send = function(data) {
      console.log(`✅ Response sent from /api/inngest`);
      console.log("=".repeat(80) + "\n");
      originalSend.call(this, data);
    };
  }
  next();
});

// Inngest webhook handler - THIS IS THE CRITICAL ENDPOINT
app.use("/api/inngest", (req, res, next) => {
  console.log("\n📝 [Inngest Handler] Processing webhook request");
  console.log(`   Body keys: ${Object.keys(req.body).join(', ')}`);
  if (req.body.type) console.log(`   Event Type: ${req.body.type}`);
  next();
}, serve({ client: inngest, functions }));
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

// 🔴 ERROR HANDLING
// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ [UNHANDLED REJECTION] Promise rejected without a catch handler');
  console.error('   Reason:', reason);
  console.error('   Promise:', promise);
  console.error('   Stack:', reason?.stack || 'No stack trace');
});

// Catch uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\n❌ [UNCAUGHT EXCEPTION] Unhandled error occurred');
  console.error('   Error:', error.message);
  console.error('   Stack:', error.stack);
  // Keep server running instead of crashing
});

// Express error handler for route errors
app.use((err, req, res, next) => {
  console.error('\n❌ [EXPRESS ERROR]', err.message);
  console.error('   File:', err.filename);
  console.error('   Line:', err.lineno);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Internal Server Error'
  });
});

app.listen(port, () =>
  console.log(`Server listening at http://localhost:${port}`)
);