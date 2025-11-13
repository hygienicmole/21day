# Windows Setup Guide

Complete guide to set up and run the Multi-Channel Outreach Campaign Manager on Windows.

---

## 📋 Prerequisites

### 1. Install Node.js

1. Go to https://nodejs.org/
2. Download **LTS version** (18.x or higher)
3. Run the installer
4. Check "Automatically install necessary tools" option
5. Verify installation:

```cmd
node --version
npm --version
```

Should show versions like `v18.x.x` and `9.x.x` or higher.

### 2. Install Git (Optional but Recommended)

1. Go to https://git-scm.com/download/win
2. Download and run installer
3. Use default settings
4. Verify:

```cmd
git --version
```

### 3. Text Editor (Optional)

- **VS Code**: https://code.visualstudio.com/ (Recommended)
- **Notepad++**: https://notepad-plus-plus.org/
- Or use Windows Notepad

---

## 🚀 Installation Steps

### Step 1: Get the Project

**If you cloned from Git:**
```cmd
cd path\to\outreach-campaign-manager
```

**If you downloaded as ZIP:**
1. Extract the ZIP file
2. Open Command Prompt or PowerShell
3. Navigate to the extracted folder:
```cmd
cd C:\path\to\outreach-campaign-manager
```

### Step 2: Run Setup

**Option A: Using PowerShell (Recommended)**

1. Open **PowerShell** (search for it in Start menu)
2. Navigate to project folder:
```powershell
cd C:\path\to\outreach-campaign-manager
```

3. Run setup:
```powershell
# Allow script execution (one time only, if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run setup
.\setup-windows.ps1
```

**Option B: Using Command Prompt**

1. Open **Command Prompt** (cmd)
2. Navigate to project folder:
```cmd
cd C:\path\to\outreach-campaign-manager
```

3. Run setup:
```cmd
setup-windows.bat
```

**Option C: Manual Setup**

If scripts don't work, install manually:

```cmd
REM Install backend dependencies
cd backend
npm install

REM Initialize database
node src\db.js
node src\seed.js

REM Go back and install frontend
cd ..\frontend
npm install

cd ..
```

---

## 🏃 Running the Application

You need **TWO** terminal windows running simultaneously:

### Terminal 1: Start Backend

**PowerShell:**
```powershell
cd C:\path\to\outreach-campaign-manager
.\start-backend-windows.ps1
```

**Command Prompt:**
```cmd
cd C:\path\to\outreach-campaign-manager
start-backend-windows.bat
```

**Manual (if scripts don't work):**
```cmd
cd backend
npm start
```

Wait for:
```
🚀 Server running on http://localhost:3000
📊 API endpoints available at http://localhost:3000/api
```

### Terminal 2: Start Frontend

**PowerShell:**
```powershell
cd C:\path\to\outreach-campaign-manager
.\start-frontend-windows.ps1
```

**Command Prompt:**
```cmd
cd C:\path\to\outreach-campaign-manager
start-frontend-windows.bat
```

**Manual (if scripts don't work):**
```cmd
cd frontend
npm run dev
```

Wait for:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 3: Open in Browser

1. Open your web browser (Chrome, Edge, Firefox)
2. Go to: **http://localhost:5173**
3. Login with:
   - Username: `admin`
   - Password: `admin123`

---

## 🛑 Stopping the Application

Press **Ctrl+C** in each terminal window to stop the servers.

---

## 🔧 Troubleshooting

### Problem: "npm is not recognized"

**Solution:**
1. Node.js is not installed or not in PATH
2. Reinstall Node.js from https://nodejs.org/
3. Make sure to check "Add to PATH" during installation
4. Restart Command Prompt/PowerShell
5. Try again

### Problem: "Cannot run scripts" (PowerShell)

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try running the script again.

### Problem: Port 3000 or 5173 already in use

**Solution:**
Find and kill the process using the port:

```cmd
REM Check what's using port 3000
netstat -ano | findstr :3000

REM Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

REM Check what's using port 5173
netstat -ano | findstr :5173

REM Kill the process
taskkill /PID <PID> /F
```

### Problem: "Module not found" errors

**Solution:**
Dependencies not installed. Run:

```cmd
cd backend
npm install

cd ..\frontend
npm install
```

### Problem: Database errors

**Solution:**
Reset the database:

```cmd
cd backend
del database.db
node src\db.js
node src\seed.js
cd ..
```

### Problem: Can't access http://localhost:5173

**Solution:**
1. Make sure frontend server is running (check Terminal 2)
2. Make sure you're using `localhost`, not `127.0.0.1`
3. Check Windows Firewall isn't blocking Node.js
4. Try a different browser

### Problem: Login doesn't work

**Solution:**
1. Make sure backend is running (check Terminal 1)
2. Press F12 in browser, check Console for errors
3. Verify database exists:
```cmd
cd backend
dir database.db
```

If database doesn't exist:
```cmd
node src\db.js
node src\seed.js
```

4. Use exact credentials: `admin` / `admin123`

---

## 📁 File Structure (Windows Paths)

```
C:\path\to\outreach-campaign-manager\
├── backend\
│   ├── src\
│   │   ├── routes\
│   │   ├── services\
│   │   ├── middleware\
│   │   └── utils\
│   ├── database.db          (created after setup)
│   ├── package.json
│   └── node_modules\        (created after npm install)
├── frontend\
│   ├── src\
│   │   ├── pages\
│   │   ├── components\
│   │   ├── utils\
│   │   └── context\
│   ├── package.json
│   └── node_modules\        (created after npm install)
├── README.md
├── INTEGRATIONS_GUIDE.md
└── setup-windows.ps1
```

---

## 🎯 Quick Test

After setup, verify everything works:

### Test Backend:
```cmd
curl http://localhost:3000/api/health
```

Or open in browser: http://localhost:3000/api/health

Should show:
```json
{"status":"ok","message":"Outreach Campaign Manager API is running"}
```

### Test Frontend:
Open browser to: http://localhost:5173

Should show login page.

---

## 💡 Tips for Windows Users

### 1. Use PowerShell for Better Experience
- PowerShell has better command support
- Press `Windows Key + X` → Select "Windows PowerShell"

### 2. Add to Windows Terminal (Windows 11)
- Install Windows Terminal from Microsoft Store
- Open multiple tabs for backend/frontend
- Better UI than Command Prompt

### 3. Create Desktop Shortcuts

**Backend Shortcut:**
1. Right-click Desktop → New → Shortcut
2. Location: `C:\Windows\System32\cmd.exe /k "cd C:\path\to\project\backend && npm start"`
3. Name: "Outreach Backend"

**Frontend Shortcut:**
1. Right-click Desktop → New → Shortcut
2. Location: `C:\Windows\System32\cmd.exe /k "cd C:\path\to\project\frontend && npm run dev"`
3. Name: "Outreach Frontend"

### 4. Check Windows Defender

If having issues:
1. Open Windows Security
2. Go to Firewall & Network Protection
3. Allow Node.js through firewall if prompted

### 5. Use Admin Mode (If Needed)

If getting permission errors:
1. Right-click Command Prompt or PowerShell
2. Select "Run as Administrator"
3. Try commands again

---

## 📱 Development on Windows

### Using VS Code:
1. Open VS Code
2. File → Open Folder → Select `outreach-campaign-manager`
3. Open Terminal in VS Code: `Ctrl + ` (backtick)
4. Run commands directly in VS Code terminal

### Recommended VS Code Extensions:
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **ES7+ React/Redux/React-Native snippets**: React helpers
- **SQLite Viewer**: View database

---

## 🔄 Updating the Application

If you pulled new changes:

```cmd
REM Update backend
cd backend
npm install
cd ..

REM Update frontend
cd frontend
npm install
cd ..

REM Restart both servers
```

---

## 🌐 Accessing from Other Devices

To test on your phone/tablet on same WiFi:

1. Find your computer's IP address:
```cmd
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

2. Update frontend config:
Edit `frontend\vite.config.ts`:
```typescript
server: {
  host: '0.0.0.0',
  port: 5173,
  ...
}
```

3. Restart frontend server

4. On other device, go to: `http://YOUR-IP:5173`
   (e.g., http://192.168.1.100:5173)

---

## 🔐 Windows Firewall Rules

If you can't access from other devices:

1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Rule Type: Port
5. Port: 5173 (frontend) and 3000 (backend)
6. Allow the connection
7. Apply to all profiles
8. Name: "Outreach Manager"

---

## 📊 Performance Tips

### 1. Close Unnecessary Programs
- Free up RAM for Node.js
- Close other browsers/apps

### 2. Exclude from Windows Defender
If running slow:
1. Windows Security → Virus & threat protection
2. Manage settings → Exclusions
3. Add folder exclusion for `node_modules`

### 3. Use SSD (If Available)
- Place project on SSD for faster loading
- Much faster than HDD

---

## 🆘 Getting Help

### Check Logs

**Backend errors:**
- Look at Terminal 1 (backend)
- Errors shown in red

**Frontend errors:**
- Look at Terminal 2 (frontend)
- Press F12 in browser → Console tab

### Common Error Codes

**EADDRINUSE**: Port already in use (see troubleshooting above)
**ENOENT**: File not found (check paths)
**EACCES**: Permission denied (run as admin)
**MODULE_NOT_FOUND**: Run `npm install`

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Node.js installed (`node --version` works)
- [ ] Backend dependencies installed (`backend\node_modules` exists)
- [ ] Frontend dependencies installed (`frontend\node_modules` exists)
- [ ] Database created (`backend\database.db` exists)
- [ ] Backend starts without errors (Terminal 1)
- [ ] Frontend starts without errors (Terminal 2)
- [ ] Can access http://localhost:5173
- [ ] Can login with `admin` / `admin123`
- [ ] See sample campaign on dashboard

---

## 🎉 Next Steps

Once everything is running:

1. ✅ Explore the **Master Dashboard**
2. ✅ Go to **Settings** to configure integrations
3. ✅ Create a **test campaign**
4. ✅ Read **INTEGRATIONS_GUIDE.md** for API setup
5. ✅ Check **DEMO_GUIDE.md** for features walkthrough

---

## 📞 Support Resources

- **Node.js Issues**: https://nodejs.org/docs/
- **npm Errors**: https://docs.npmjs.com/
- **Windows Path Issues**: Use `\` instead of `/`
- **Project Docs**: Check README.md

---

**Windows is fully supported! Happy outreaching! 🚀**
