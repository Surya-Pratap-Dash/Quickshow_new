@echo off
REM 🔍 Quickshow Configuration Verification Script (Windows)
REM Run this to check if your setup is correct

setlocal enabledelayedexpansion

echo ================================
echo 🔍 Quickshow Setup Verification
echo ================================
echo.

set SUCCESS=0
set ERRORS=0
set WARNINGS=0

REM Check Node.js
echo 📋 Dependencies Check
echo -------------------
node --version >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ Node.js installed
    set /a SUCCESS+=1
) else (
    echo ❌ Node.js NOT installed
    set /a ERRORS+=1
)

npm --version >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ npm installed
    set /a SUCCESS+=1
) else (
    echo ❌ npm NOT installed
    set /a ERRORS+=1
)

git --version >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ Git installed
    set /a SUCCESS+=1
) else (
    echo ❌ Git NOT installed (optional)
    set /a WARNINGS+=1
)

echo.
echo 📁 Project Structure
echo -------------------

if exist "server" (
    echo ✅ Server directory exists
    set /a SUCCESS+=1
) else (
    echo ❌ Server directory NOT found
    set /a ERRORS+=1
)

if exist "client" (
    echo ✅ Client directory exists
    set /a SUCCESS+=1
) else (
    echo ❌ Client directory NOT found
    set /a ERRORS+=1
)

if exist "server\package.json" (
    echo ✅ server/package.json exists
    set /a SUCCESS+=1
) else (
    echo ❌ server/package.json NOT found
    set /a ERRORS+=1
)

if exist "client\package.json" (
    echo ✅ client/package.json exists
    set /a SUCCESS+=1
) else (
    echo ❌ client/package.json NOT found
    set /a ERRORS+=1
)

if exist "server\config\db.js" (
    echo ✅ server/config/db.js exists
    set /a SUCCESS+=1
) else (
    echo ❌ server/config/db.js NOT found
    set /a ERRORS+=1
)

if exist "server\config\dbConfig.js" (
    echo ✅ server/config/dbConfig.js exists
    set /a SUCCESS+=1
) else (
    echo ❌ server/config/dbConfig.js NOT found
    set /a ERRORS+=1
)

echo.
echo 📦 Dependencies Installed
echo ------------------------

if exist "server\node_modules" (
    echo ✅ server/node_modules exists
    set /a SUCCESS+=1
) else (
    echo ⚠️  server/node_modules NOT installed
    set /a WARNINGS+=1
)

if exist "client\node_modules" (
    echo ✅ client/node_modules exists
    set /a SUCCESS+=1
) else (
    echo ⚠️  client/node_modules NOT installed
    set /a WARNINGS+=1
)

if not exist "server\node_modules" (
    echo.
    echo Fix: Run this command in project root:
    echo npm install ^&^& cd server ^&^& npm install ^&^& cd ../client ^&^& npm install
)

echo.
echo 🔐 Environment Files
echo -------------------

if exist "server\.env" (
    echo ✅ server/.env exists
    set /a SUCCESS+=1
) else (
    echo ⚠️  server/.env NOT found
    set /a WARNINGS+=1
)

if exist "client\.env" (
    echo ✅ client/.env exists
    set /a SUCCESS+=1
) else (
    echo ⚠️  client/.env NOT found
    set /a WARNINGS+=1
)

if exist "server\.env.local" (
    echo ✅ server/.env.local template exists
    set /a SUCCESS+=1
) else (
    echo ⚠️  server/.env.local template NOT found
    set /a WARNINGS+=1
)

if exist "client\.env.local" (
    echo ✅ client/.env.local template exists
    set /a SUCCESS+=1
) else (
    echo ⚠️  client/.env.local template NOT found
    set /a WARNINGS+=1
)

if not exist "server\.env" (
    echo.
    echo Fix: Create server/.env from server/.env.local template
)

if not exist "client\.env" (
    echo Fix: Create client/.env from client/.env.local template
)

echo.
echo 📚 Documentation
echo ---------------

if exist "QUICK_START.md" (
    echo ✅ QUICK_START.md exists
    set /a SUCCESS+=1
) else (
    echo ⚠️  QUICK_START.md NOT found
    set /a WARNINGS+=1
)

if exist "COMPLETE_SETUP_GUIDE.md" (
    echo ✅ COMPLETE_SETUP_GUIDE.md exists
    set /a SUCCESS+=1
) else (
    echo ⚠️  COMPLETE_SETUP_GUIDE.md NOT found
    set /a WARNINGS+=1
)

if exist "VERCEL_DEPLOYMENT.md" (
    echo ✅ VERCEL_DEPLOYMENT.md exists
    set /a SUCCESS+=1
) else (
    echo ⚠️  VERCEL_DEPLOYMENT.md NOT found
    set /a WARNINGS+=1
)

if exist "ARCHITECTURE.md" (
    echo ✅ ARCHITECTURE.md exists
    set /a SUCCESS+=1
) else (
    echo ⚠️  ARCHITECTURE.md NOT found
    set /a WARNINGS+=1
)

if exist "ISSUES_AND_FIXES.md" (
    echo ✅ ISSUES_AND_FIXES.md exists
    set /a SUCCESS+=1
) else (
    echo ⚠️  ISSUES_AND_FIXES.md NOT found
    set /a WARNINGS+=1
)

if exist "README_SETUP.md" (
    echo ✅ README_SETUP.md exists
    set /a SUCCESS+=1
) else (
    echo ⚠️  README_SETUP.md NOT found
    set /a WARNINGS+=1
)

echo.
echo 🔧 Configuration Files
echo ---------------------

if exist "server\server.js" (
    echo ✅ server/server.js exists
    set /a SUCCESS+=1
) else (
    echo ❌ server/server.js NOT found
    set /a ERRORS+=1
)

if exist "server\vercel.json" (
    echo ✅ server/vercel.json exists
    set /a SUCCESS+=1
) else (
    echo ⚠️  server/vercel.json NOT found (optional)
    set /a WARNINGS+=1
)

if exist "vercel.json" (
    echo ✅ vercel.json exists
    set /a SUCCESS+=1
) else (
    echo ⚠️  vercel.json NOT found (optional)
    set /a WARNINGS+=1
)

if exist "client\vite.config.js" (
    echo ✅ client/vite.config.js exists
    set /a SUCCESS+=1
) else (
    echo ❌ client/vite.config.js NOT found
    set /a ERRORS+=1
)

echo.
echo =============================
echo 📊 Summary
echo =============================
echo ✅ Success: %SUCCESS%
echo ❌ Errors: %ERRORS%
echo ⚠️  Warnings: %WARNINGS%
echo.

if %ERRORS% equ 0 (
    echo ✨ Setup looks good!
    echo.
    echo 🚀 Next steps:
    echo 1. Create server\.env from server\.env.local
    echo 2. Create client\.env from client\.env.local
    echo 3. Fill in all API keys
    echo 4. Run: inngest dev (Terminal 1^)
    echo 5. Run: npm start (Terminal 2, in server\^)
    echo 6. Run: npm run dev (Terminal 3, in client\^)
    echo 7. Open: http://localhost:5173
    echo.
) else (
    echo ❌ Please fix the errors above before proceeding
    echo.
)

echo 📖 Read documentation:
echo   - QUICK_START.md (30-minute setup^)
echo   - COMPLETE_SETUP_GUIDE.md (detailed guide^)
echo   - VERCEL_DEPLOYMENT.md (deployment^)
echo   - ARCHITECTURE.md (system design^)
echo.
echo Press any key to exit...
pause >nul
