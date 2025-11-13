# Troubleshooting Guide

## Both Servers Are Running Successfully! ✓

The connection tests confirm:
- ✓ Backend is running on `http://localhost:3000`
- ✓ Frontend is running on `http://localhost:5173`
- ✓ Login endpoint is working
- ✓ Authentication is functional
- ✓ Database is connected

## If You Can't Login, Try These Steps:

### Step 1: Verify You're on the Correct Page

Open your browser to: **http://localhost:5173**

You should see a login page with:
- "Outreach Campaign Manager" title
- Username field
- Password field
- Blue "Sign In" button
- Demo credentials shown at the bottom

### Step 2: Use the Exact Credentials

**Important:** Copy and paste these exactly:

```
Username: admin
Password: admin123
```

### Step 3: Check Browser Console for Errors

1. Open browser DevTools (Press F12 or Right-click → Inspect)
2. Click the "Console" tab
3. Try to login
4. Look for any red error messages

**Common errors and solutions:**

#### Error: "Network Error" or "Failed to fetch"
**Solution:** The frontend can't reach the backend.

```bash
# In terminal 1 (if not running):
cd /home/user/21day/outreach-campaign-manager/backend
npm start

# In terminal 2 (if not running):
cd /home/user/21day/outreach-campaign-manager/frontend
npm run dev
```

#### Error: "Invalid credentials"
**Solution:** Make sure you're using `admin` and `admin123` exactly (case-sensitive)

#### Error: CORS related
**Solution:** Clear browser cache and reload:
- Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
- Clear cache
- Reload the page

### Step 4: Test Backend Directly

Run this command in a terminal to verify the backend works:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

You should see a response with a token. If not:

```bash
# Restart the backend
cd /home/user/21day/outreach-campaign-manager/backend
npm start
```

### Step 5: Clear Browser Storage

Sometimes old tokens or data cause issues:

1. Open DevTools (F12)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Click "Local Storage" → "http://localhost:5173"
4. Right-click and select "Clear"
5. Refresh the page and try logging in again

### Step 6: Try a Different Browser

If Chrome isn't working, try:
- Firefox
- Edge
- Safari (Mac)

### Step 7: Verify Database Has User

```bash
cd /home/user/21day/outreach-campaign-manager/backend
sqlite3 database.db "SELECT id, username FROM users;"
```

You should see:
```
1|admin
```

If not, re-seed the database:

```bash
node src/seed.js
```

### Step 8: Check for Port Conflicts

Make sure ports 3000 and 5173 aren't being used by other apps:

```bash
# Check port 3000
lsof -i :3000

# Check port 5173
lsof -i :5173
```

If another process is using these ports:
- Kill that process, OR
- Change ports in the config files

### Step 9: Restart Everything Fresh

```bash
# Kill all processes
pkill -f "node src/server.js"
pkill -f "vite"

# Start backend
cd /home/user/21day/outreach-campaign-manager/backend
npm start

# In a new terminal, start frontend
cd /home/user/21day/outreach-campaign-manager/frontend
npm run dev
```

### Step 10: Check Network Tab

1. Open DevTools (F12)
2. Click "Network" tab
3. Try to login
4. Look for the request to `/api/auth/login`
5. Check the response:
   - Status should be 200
   - Response should contain a token

If you see a 404, 500, or CORS error, that tells us where the problem is.

## Specific Error Messages

### "Invalid credentials"
- Double-check username: `admin` (lowercase)
- Double-check password: `admin123` (no spaces)
- Make sure database is seeded: `node backend/src/seed.js`

### "Network Error"
- Backend isn't running
- Wrong URL (should be http://localhost:3000)
- Firewall blocking the connection

### "CORS Error"
- Clear browser cache
- Make sure you're accessing via `http://localhost:5173` (not `127.0.0.1` or `0.0.0.0`)

### Button Does Nothing
- Check browser console for JavaScript errors
- Try hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

## Still Not Working?

### Run the Test Script

```bash
cd /home/user/21day/outreach-campaign-manager
./test-connection.sh
```

This will tell you exactly what's working and what's not.

### Get More Information

**Backend logs:**
- Look at the terminal where you ran `npm start` in the backend folder
- Any errors will be shown there

**Frontend logs:**
- Look at the terminal where you ran `npm run dev` in the frontend folder
- Any build errors will be shown there

**Browser console:**
- Press F12
- Check both Console and Network tabs
- Take a screenshot if you see errors

## Quick Reset (Nuclear Option)

If nothing works, reset everything:

```bash
cd /home/user/21day/outreach-campaign-manager

# Kill all processes
pkill -f "node"

# Backend
cd backend
rm -f database.db
node src/db.js
node src/seed.js
npm start &

# Frontend (in new terminal)
cd ../frontend
npm run dev
```

Then try logging in with `admin` / `admin123`

## Contact Information for Help

If you're still stuck, provide:

1. Screenshot of the login page
2. Screenshot of browser console (F12 → Console tab)
3. Screenshot of network tab showing the login request
4. Output of `./test-connection.sh`
5. Browser and OS you're using

This will help diagnose the exact issue!
