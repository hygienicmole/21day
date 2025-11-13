# Multi-Channel Outreach Campaign Manager

A full-stack web application for managing multi-channel outreach campaigns with email, calls, voicemail, and WhatsApp touchpoints over a 21-day sequence.

## Features

### Campaign Management
- Create, edit, pause, resume, and delete campaigns
- Track campaign metrics (open rates, response rates, touchpoints)
- Campaign status management (draft, active, paused, completed)
- Real-time analytics dashboard

### Campaign Builder (4-Step Wizard)
1. **Campaign Details**: Set name, industry, goal, and start date
2. **Contact Import**: Upload CSV or add contacts manually
3. **Sequence Builder**: Create 21-day multi-channel sequences with drag-and-drop
4. **Review & Launch**: Preview and launch campaigns

### Contact Management
- Import contacts via CSV
- Manual contact entry
- View all contacts with filtering and search
- Track touchpoints and responses per contact
- Contact status management (active, responded, unsubscribed)

### Template Library
- Pre-populated with 10 sample templates
- Create custom templates for each channel
- Template categories and organization
- Variable support ({{Name}}, {{Company}}, {{Title}}, {{Industry}})

### Multi-Channel Support
- 📧 Email (with subject lines)
- 📞 Phone Calls (with scripts)
- 🎙️ Voicemail (with scripts)
- 💬 WhatsApp Messages

### Campaign Simulation
- Simulate campaign execution
- Mock touchpoint sending with status updates
- Activity feed showing recent interactions

## Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API
- **SQLite** with **better-sqlite3** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File uploads
- **csv-parser** - CSV processing

### Frontend
- **React 18** + **TypeScript** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API client
- **Zustand/Context API** - State management
- **date-fns** - Date utilities
- **Lucide React** - Icons

## Project Structure

```
outreach-campaign-manager/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js          # Authentication endpoints
│   │   │   ├── campaigns.js     # Campaign CRUD
│   │   │   ├── contacts.js      # Contact management + CSV import
│   │   │   ├── sequences.js     # Sequence steps
│   │   │   ├── templates.js     # Template library
│   │   │   └── touchpoints.js   # Touchpoint execution
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT authentication middleware
│   │   ├── utils/
│   │   │   └── csvParser.js     # CSV parsing utility
│   │   ├── db.js                # Database initialization
│   │   ├── seed.js              # Sample data seeder
│   │   └── server.js            # Express server
│   ├── database.db              # SQLite database (auto-generated)
│   ├── sample-contacts.csv      # Sample CSV for testing
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx               # App layout with navigation
│   │   │   ├── Step1CampaignDetails.tsx # Campaign wizard step 1
│   │   │   ├── Step2ContactImport.tsx   # Campaign wizard step 2
│   │   │   ├── Step3SequenceBuilder.tsx # Campaign wizard step 3
│   │   │   └── Step4ReviewLaunch.tsx    # Campaign wizard step 4
│   │   ├── pages/
│   │   │   ├── Login.tsx                # Login/Register page
│   │   │   ├── Dashboard.tsx            # Campaign dashboard
│   │   │   ├── CampaignBuilder.tsx      # Campaign creation wizard
│   │   │   ├── ContactManager.tsx       # Contact management
│   │   │   └── Templates.tsx            # Template library
│   │   ├── context/
│   │   │   └── AuthContext.tsx          # Authentication context
│   │   ├── utils/
│   │   │   └── api.ts                   # API client utilities
│   │   ├── types/
│   │   │   └── index.ts                 # TypeScript interfaces
│   │   ├── App.tsx                      # Main app component
│   │   ├── main.tsx                     # Entry point
│   │   └── index.css                    # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
└── README.md
```

## Setup Instructions

### Prerequisites
- **Node.js** 18+ and **npm** installed
- A modern web browser

### Backend Setup

1. Navigate to the backend directory:
```bash
cd outreach-campaign-manager/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults will work):
```bash
cp .env.example .env
```

4. Initialize and seed the database:
```bash
npm run init-db
node src/seed.js
```

This will:
- Create the SQLite database with all tables
- Create a default user (username: `admin`, password: `admin123`)
- Populate 10 sample message templates
- Create a demo campaign with sample data

5. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The API will be running at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory (in a new terminal):
```bash
cd outreach-campaign-manager/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be running at `http://localhost:5173`

### Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Login with default credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

## Usage Guide

### Creating a Campaign

1. **Dashboard**: Click "New Campaign" button
2. **Step 1 - Campaign Details**:
   - Enter campaign name (e.g., "Q4 Enterprise Outreach")
   - Select target industry
   - Choose campaign goal
   - Set start date
3. **Step 2 - Import Contacts**:
   - Upload CSV file with contacts, or
   - Add contacts manually one by one
   - Preview imported contacts
4. **Step 3 - Build Sequence**:
   - Select days from 0-21
   - Add touchpoints for each day (Email, Call, Voicemail, WhatsApp)
   - Edit message content
   - Use templates from the library
   - Add personalization variables
5. **Step 4 - Review & Launch**:
   - Review campaign summary
   - Check statistics (contacts, steps, touchpoints)
   - Choose to launch now or save as draft

### Managing Contacts

- Navigate to "Contacts" in the sidebar
- View all contacts across campaigns
- Filter by status (active, responded, unsubscribed)
- Search by name, email, or company
- View touchpoint and response counts

### Managing Templates

- Navigate to "Templates" in the sidebar
- View templates filtered by channel
- Create new templates
- Edit existing templates
- Delete templates
- Use templates in campaign sequences

### Simulating Campaign Execution

While the app doesn't send actual emails/messages, you can simulate campaign execution:

1. Create a campaign and set it to "active"
2. The touchpoints can be simulated through the API
3. View activity in the campaign dashboard

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `GET /api/campaigns/:id/analytics` - Get campaign analytics

### Contacts
- `GET /api/contacts` - List all contacts
- `GET /api/contacts/campaign/:campaignId` - Get campaign contacts
- `GET /api/contacts/:id` - Get contact details
- `POST /api/contacts` - Create contact
- `POST /api/contacts/import/:campaignId` - Import contacts from CSV
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Sequences
- `GET /api/sequences/campaign/:campaignId` - Get campaign sequence
- `POST /api/sequences` - Create sequence step
- `POST /api/sequences/bulk/:campaignId` - Bulk create/update steps
- `PUT /api/sequences/:id` - Update sequence step
- `DELETE /api/sequences/:id` - Delete sequence step

### Templates
- `GET /api/templates` - List templates (with optional filters)
- `GET /api/templates/:id` - Get template
- `POST /api/templates` - Create template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Touchpoints
- `GET /api/touchpoints/campaign/:campaignId` - Get campaign touchpoints
- `GET /api/touchpoints/contact/:contactId` - Get contact touchpoints
- `POST /api/touchpoints` - Create touchpoint
- `PUT /api/touchpoints/:id` - Update touchpoint
- `POST /api/touchpoints/execute/:campaignId` - Execute campaign (simulation)
- `GET /api/touchpoints/activity/:campaignId` - Get activity feed

## Database Schema

### Tables
- **users** - User accounts
- **campaigns** - Campaign configurations
- **contacts** - Contact information
- **sequence_steps** - Campaign sequence definitions
- **touchpoints** - Execution logs
- **templates** - Message templates

See `backend/src/db.js` for complete schema.

## CSV Import Format

When importing contacts, use this CSV format:

```csv
Name,Email,Phone,Company,Title
John Smith,john@example.com,+1-555-0101,TechCorp,VP of Sales
Jane Doe,jane@example.com,+1-555-0102,InnovateCo,Marketing Director
```

**Required fields**: Name
**Optional fields**: Email, Phone, Company, Title

## Development

### Build for Production

**Backend**:
```bash
cd backend
npm start
```

**Frontend**:
```bash
cd frontend
npm run build
npm run preview
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

## Features Not Implemented (Future Enhancements)

- Actual email/SMS/WhatsApp integration (currently simulation only)
- Advanced analytics with charts (recharts prepared but not fully implemented)
- Campaign duplication
- Bulk contact operations
- Calendar view of scheduled touchpoints
- Email template rich text editor with WYSIWYG
- Dark mode
- Export campaign reports to PDF
- Webhooks for external integrations

## Troubleshooting

### Backend won't start
- Ensure Node.js 18+ is installed
- Check if port 3000 is available
- Run `npm install` to ensure dependencies are installed

### Frontend won't start
- Ensure backend is running first
- Check if port 5173 is available
- Run `npm install` to ensure dependencies are installed

### Database errors
- Delete `database.db` and run `npm run init-db` and `node src/seed.js` again

### Login not working
- Ensure backend is running
- Check browser console for errors
- Verify credentials: `admin` / `admin123`

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

For issues or questions, please check:
1. This README
2. The code comments in source files
3. Console logs in browser developer tools
4. Backend server logs

---

**Built with Node.js, React, TypeScript, and Tailwind CSS**
