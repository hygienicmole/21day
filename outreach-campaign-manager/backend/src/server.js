import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db.js';
import { authenticateToken } from './middleware/auth.js';

// Import routes
import authRoutes from './routes/auth.js';
import campaignRoutes from './routes/campaigns.js';
import contactRoutes from './routes/contacts.js';
import sequenceRoutes from './routes/sequences.js';
import templateRoutes from './routes/templates.js';
import touchpointRoutes from './routes/touchpoints.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
initializeDatabase();

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/campaigns', authenticateToken, campaignRoutes);
app.use('/api/contacts', authenticateToken, contactRoutes);
app.use('/api/sequences', authenticateToken, sequenceRoutes);
app.use('/api/templates', authenticateToken, templateRoutes);
app.use('/api/touchpoints', authenticateToken, touchpointRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Outreach Campaign Manager API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

export default app;
