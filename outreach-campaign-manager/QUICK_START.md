# 🚀 Quick Start Guide

## ✅ Both Servers Are Currently Running!

**Backend:** http://localhost:3000 ✓
**Frontend:** http://localhost:5173 ✓

## 🔐 Login Now!

1. **Open your browser** to: http://localhost:5173

2. **Login with:**
   - Username: `admin`
   - Password: `admin123`

3. **You should see** the Campaign Dashboard with 1 sample campaign!

---

## 🛠️ If You Need to Restart

### Option 1: Use the Scripts (Easiest)

**Terminal 1 - Start Backend:**
```bash
cd /home/user/21day/outreach-campaign-manager
./start-backend.sh
```

**Terminal 2 - Start Frontend:**
```bash
cd /home/user/21day/outreach-campaign-manager
./start-frontend.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd /home/user/21day/outreach-campaign-manager/backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd /home/user/21day/outreach-campaign-manager/frontend
npm run dev
```

---

## ❓ Having Issues?

### Can't Login?

1. **Make sure you're using the correct credentials:**
   - Username: `admin` (lowercase)
   - Password: `admin123` (no spaces)

2. **Check the browser console for errors:**
   - Press F12
   - Click "Console" tab
   - Try logging in
   - Screenshot any red errors

3. **Run the connection test:**
   ```bash
   cd /home/user/21day/outreach-campaign-manager
   ./test-connection.sh
   ```

4. **Read the full troubleshooting guide:**
   ```bash
   cat TROUBLESHOOTING.md
   ```

### Backend Not Working?

```bash
# Check if it's running
curl http://localhost:3000/api/health

# Should return: {"status":"ok",...}
```

If not running:
```bash
cd /home/user/21day/outreach-campaign-manager/backend
npm start
```

### Frontend Not Working?

```bash
# Check if it's running
curl http://localhost:5173

# Should return HTML
```

If not running:
```bash
cd /home/user/21day/outreach-campaign-manager/frontend
npm run dev
```

---

## 📋 What to Do After Login

1. **Explore the Sample Campaign**
   - View "Q4 Enterprise Outreach"
   - Check contacts, sequence, metrics

2. **Create Your Own Campaign**
   - Click "New Campaign"
   - Follow the 4-step wizard
   - Import contacts (use sample CSV: `backend/sample-contacts.csv`)
   - Build a sequence
   - Launch!

3. **Browse Templates**
   - Click "Templates" in sidebar
   - 10 pre-loaded templates ready to use

4. **View Contacts**
   - Click "Contacts" in sidebar
   - Search and filter contacts

---

## 🧪 Test the Backend API

```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get campaigns (use token from above)
curl http://localhost:3000/api/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📁 Project Structure

```
outreach-campaign-manager/
├── backend/              # Node.js API
│   ├── database.db       # SQLite database (auto-created)
│   └── src/              # Source code
├── frontend/             # React app
│   └── src/              # Source code
├── start-backend.sh      # Easy backend startup
├── start-frontend.sh     # Easy frontend startup
├── test-connection.sh    # Test everything works
├── QUICK_START.md        # This file
├── TROUBLESHOOTING.md    # Detailed troubleshooting
└── README.md             # Full documentation
```

---

## 💡 Quick Tips

- **Both servers must run** for the app to work
- **Use separate terminals** for backend and frontend
- **Don't close terminals** or servers will stop
- **Press Ctrl+C** in a terminal to stop that server
- **Check browser console** (F12) if something doesn't work

---

## ✨ Everything is Working!

The connection tests confirm:
- ✅ Backend API is running
- ✅ Authentication works
- ✅ Database is connected
- ✅ Frontend is accessible
- ✅ Sample data is loaded

**Just open http://localhost:5173 and login with `admin` / `admin123`**

---

## 📞 Need More Help?

1. Read: `TROUBLESHOOTING.md`
2. Read: `README.md`
3. Check: `DEMO_GUIDE.md` for a full walkthrough
4. Run: `./test-connection.sh` to verify everything
