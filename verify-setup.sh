#!/bin/bash
# 🔍 Quickshow Configuration Verification Script
# Run this to check if your setup is correct

echo "================================"
echo "🔍 Quickshow Setup Verification"
echo "================================"
echo ""

# Track results
ERRORS=0
WARNINGS=0
SUCCESS=0

# Color codes
GREEN="\\033[0;32m"
RED="\\033[0;31m"
YELLOW="\\033[1;33m"
NC="\\033[0m" # No Color

# Check function
check() {
    local name=$1
    local cmd=$2
    local critical=$3 # true or false
    
    if eval "$cmd" > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} $name"
        ((SUCCESS++))
    else
        echo -e "${RED}❌${NC} $name"
        if [ "$critical" = true ]; then
            ((ERRORS++))
        else
            ((WARNINGS++))
        fi
    fi
}

# Warning function
warn() {
    local message=$1
    echo -e "${YELLOW}⚠️${NC}  $message"
    ((WARNINGS++))
}

echo "📋 Dependencies Check"
echo "-------------------"
check "Node.js installed" "node --version" true
check "npm installed" "npm --version" true
check "Git installed" "git --version" true

echo ""
echo "📁 Project Structure"
echo "-------------------"
check "Server directory exists" "test -d server" true
check "Client directory exists" "test -d client" true
check "server/package.json exists" "test -f server/package.json" true
check "client/package.json exists" "test -f client/package.json" true
check "server/config/db.js exists" "test -f server/config/db.js" true
check "server/config/dbConfig.js exists" "test -f server/config/dbConfig.js" true

echo ""
echo "📦 Dependencies Installed"
echo "------------------------"
check "server/node_modules exists" "test -d server/node_modules" false
check "client/node_modules exists" "test -d client/node_modules" false

if [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
    warn "Run: npm install && cd server && npm install && cd ../client && npm install"
fi

echo ""
echo "🔐 Environment Files"
echo "-------------------"
check "server/.env exists" "test -f server/.env" false
check "client/.env exists" "test -f client/.env" false
check "server/.env.local template exists" "test -f server/.env.local" false
check "client/.env.local template exists" "test -f client/.env.local" false

if [ ! -f "server/.env" ]; then
    warn "Create server/.env from server/.env.local template"
fi

if [ ! -f "client/.env" ]; then
    warn "Create client/.env from client/.env.local template"
fi

echo ""
echo "🌍 Environment Variables (if .env exists)"
echo "----------------------------------------"

if [ -f "server/.env" ]; then
    check "DB_HOST is set" "grep -q '^DB_HOST=' server/.env" true
    check "DB_USER is set" "grep -q '^DB_USER=' server/.env" true
    check "DB_PASS is set" "grep -q '^DB_PASS=' server/.env" true
    check "DB_NAME is set" "grep -q '^DB_NAME=' server/.env" true
    check "DB_PORT is set" "grep -q '^DB_PORT=' server/.env" true
    check "CLERK_SECRET_KEY is set" "grep -q '^CLERK_SECRET_KEY=' server/.env" false
    check "STRIPE_SECRET_KEY is set" "grep -q '^STRIPE_SECRET_KEY=' server/.env" false
    check "TMDB_API_KEY is set" "grep -q '^TMDB_API_KEY=' server/.env" false
else
    warn "server/.env not found - Environment check skipped"
fi

echo ""
echo "📚 Documentation"
echo "---------------"
check "QUICK_START.md exists" "test -f QUICK_START.md" false
check "COMPLETE_SETUP_GUIDE.md exists" "test -f COMPLETE_SETUP_GUIDE.md" false
check "VERCEL_DEPLOYMENT.md exists" "test -f VERCEL_DEPLOYMENT.md" false
check "ARCHITECTURE.md exists" "test -f ARCHITECTURE.md" false
check "ISSUES_AND_FIXES.md exists" "test -f ISSUES_AND_FIXES.md" false
check "README_SETUP.md exists" "test -f README_SETUP.md" false

echo ""
echo "🔧 Configuration Files"
echo "---------------------"
check "server/server.js exists" "test -f server/server.js" true
check "server/vercel.json exists" "test -f server/vercel.json" false
check "vercel.json exists" "test -f vercel.json" false
check "client/vite.config.js exists" "test -f client/vite.config.js" true

echo ""
echo "============================="
echo "📊 Summary"
echo "============================="
echo -e "✅ Success: $SUCCESS"
echo -e "${RED}❌ Errors: $ERRORS${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✨ Setup looks good!${NC}"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Create server/.env from server/.env.local"
    echo "2. Create client/.env from client/.env.local"
    echo "3. Fill in all API keys"
    echo "4. Run: inngest dev (Terminal 1)"
    echo "5. Run: npm start (Terminal 2, in server/)"
    echo "6. Run: npm run dev (Terminal 3, in client/)"
    echo "7. Open: http://localhost:5173"
    echo ""
else
    echo -e "${RED}❌ Please fix the errors above before proceeding${NC}"
    echo ""
fi

echo "📖 Read documentation:"
echo "  - QUICK_START.md (30-minute setup)"
echo "  - COMPLETE_SETUP_GUIDE.md (detailed guide)"
echo "  - VERCEL_DEPLOYMENT.md (deployment)"
echo "  - ARCHITECTURE.md (system design)"
