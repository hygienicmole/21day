# Demo Guide - Multi-Channel Outreach Campaign Manager

## Quick Start (5 minutes)

### 1. Start the Application

**Terminal 1 - Backend:**
```bash
cd outreach-campaign-manager/backend
npm start
```
Wait for: `🚀 Server running on http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd outreach-campaign-manager/frontend
npm run dev
```
Wait for: `Local: http://localhost:5173`

### 2. Login

1. Open browser to `http://localhost:5173`
2. Use demo credentials:
   - Username: `admin`
   - Password: `admin123`

## Demo Walkthrough

### Part 1: Explore Existing Campaign (2 minutes)

The database comes pre-seeded with a sample campaign!

1. **Dashboard View**
   - You'll see "Q4 Enterprise Outreach" campaign
   - Notice the metrics: 5 contacts, 10 steps, touchpoint counts
   - See open rate and response rate percentages

2. **View Campaign Details**
   - Click the "eye" icon on the campaign card
   - Review the campaign settings

### Part 2: Create a New Campaign (5 minutes)

1. **Click "New Campaign"**

2. **Step 1: Campaign Details**
   - Name: "Spring 2024 Outreach"
   - Industry: "SaaS/Technology"
   - Goal: "Lead Generation"
   - Start Date: Pick today's date
   - Click "Next"

3. **Step 2: Import Contacts**

   **Option A - Upload CSV:**
   - Use the sample file: `backend/sample-contacts.csv`
   - Click "Upload CSV File"
   - See contacts imported instantly

   **Option B - Add Manually:**
   - Click "Add Contact Manually"
   - Fill in: Name, Email, Company, Title
   - Click "Add Contact"
   - Add 2-3 contacts this way

   - Click "Next"

4. **Step 3: Build Sequence**

   This is the most powerful feature!

   - **Select Day 0** from the left sidebar
   - Click the 📧 (Email) icon to add an email touchpoint
   - In the modal:
     - Click "Use Template"
     - Select "Day 0 - Initial Email"
     - Notice how the template loads with variables
     - Click "Save Changes"

   - **Select Day 2**
   - Add another Email touchpoint
   - Use "Day 2 - Follow-up Email" template

   - **Select Day 3**
   - Add a WhatsApp touchpoint (💬 icon)
   - Use the WhatsApp template

   - **Continue building your sequence** (or skip to next step)
   - Click "Next: Review & Launch"

5. **Step 4: Review & Launch**
   - Review your campaign summary
   - See total contacts, steps, and touchpoints
   - Notice the channel breakdown
   - Select "Launch Now (Simulation Mode)"
   - Click "Launch Campaign"

### Part 3: Explore Other Features (3 minutes)

1. **Contact Management**
   - Click "Contacts" in the sidebar
   - See all contacts across all campaigns
   - Try the search bar
   - Filter by status

2. **Template Library**
   - Click "Templates" in the sidebar
   - Browse 10 pre-loaded templates
   - Filter by channel (Email, Call, Voicemail, WhatsApp)
   - Click "New Template" to create your own
   - Try creating a custom template:
     ```
     Name: "My Custom Email"
     Channel: Email
     Subject: Quick question for {{Name}}
     Content: Hi {{Name}}, I saw that {{Company}}...
     ```

### Part 4: Manage Campaigns (2 minutes)

1. **Back to Dashboard**
   - Click "Campaigns" in sidebar
   - See your newly created campaign

2. **Campaign Actions**
   - **Pause/Resume**: Click the pause button
   - **Edit**: Click the edit icon
   - **Delete**: Click the trash icon (careful!)

## Key Features Demonstrated

✅ **Campaign Creation** - 4-step wizard
✅ **Contact Import** - CSV upload and manual entry
✅ **Sequence Builder** - 21-day multi-channel timeline
✅ **Template Library** - Pre-loaded and custom templates
✅ **Variable Substitution** - {{Name}}, {{Company}}, etc.
✅ **Multi-Channel** - Email, Call, Voicemail, WhatsApp
✅ **Campaign Metrics** - Open rates, response rates
✅ **Contact Management** - Search, filter, track

## Advanced Features to Explore

### CSV Import Format
The app accepts CSV files with these columns:
```csv
Name,Email,Phone,Company,Title
John Doe,john@example.com,+1-555-0100,Acme Corp,CEO
```

### API Testing (Optional)
You can also interact with the API directly:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get campaigns (use token from login)
curl http://localhost:3000/api/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Database Exploration
The SQLite database is at `backend/database.db`

You can explore it with any SQLite browser or CLI:
```bash
sqlite3 backend/database.db
.tables
SELECT * FROM campaigns;
SELECT * FROM templates;
```

## Troubleshooting

**Backend won't start:**
- Make sure you're in the `backend` folder
- Run `npm install` again
- Check if port 3000 is free: `lsof -i :3000`

**Frontend won't start:**
- Make sure backend is running first
- Make sure you're in the `frontend` folder
- Run `npm install` again
- Check if port 5173 is free

**Can't login:**
- Check browser console (F12) for errors
- Verify backend is running
- Try: username `admin`, password `admin123`

**No data showing:**
- Run the seed script again: `node backend/src/seed.js`

## Tips for Best Experience

1. **Create multiple campaigns** to see how the dashboard scales
2. **Import the sample CSV** to see bulk operations
3. **Build a full 21-day sequence** with all channels
4. **Customize templates** with your own messaging
5. **Use the search and filters** in contacts and templates

## What's Simulated

Since this is a demo application without actual integrations:
- No real emails are sent
- No actual phone calls are made
- No WhatsApp messages are delivered
- Touchpoint statuses are randomized for demonstration

This makes it perfect for:
- Testing workflows
- Training teams
- Prototyping campaigns
- Understanding multi-channel outreach

## Next Steps

Want to extend this application? Consider:
- Integrating with SendGrid for real emails
- Adding Twilio for SMS/WhatsApp
- Connecting to a CRM like HubSpot
- Building more detailed analytics
- Adding a calendar view
- Implementing A/B testing for sequences

---

**Enjoy exploring the Multi-Channel Outreach Campaign Manager!**
