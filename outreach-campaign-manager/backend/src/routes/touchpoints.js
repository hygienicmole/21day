import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all touchpoints for a campaign
router.get('/campaign/:campaignId', (req, res) => {
  try {
    // Verify campaign ownership
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ? AND user_id = ?').get(req.params.campaignId, req.user.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const touchpoints = db.prepare(`
      SELECT t.*, c.name as contact_name, c.email, s.channel, s.day_number, s.subject
      FROM touchpoints t
      JOIN contacts c ON t.contact_id = c.id
      JOIN sequence_steps s ON t.sequence_step_id = s.id
      WHERE c.campaign_id = ?
      ORDER BY t.sent_at DESC
    `).all(req.params.campaignId);

    res.json(touchpoints);
  } catch (error) {
    console.error('Get touchpoints error:', error);
    res.status(500).json({ error: 'Failed to fetch touchpoints' });
  }
});

// Get touchpoints for a contact
router.get('/contact/:contactId', (req, res) => {
  try {
    // Verify contact ownership
    const contact = db.prepare(`
      SELECT c.* FROM contacts c
      JOIN campaigns cp ON c.campaign_id = cp.id
      WHERE c.id = ? AND cp.user_id = ?
    `).get(req.params.contactId, req.user.id);

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const touchpoints = db.prepare(`
      SELECT t.*, s.channel, s.day_number, s.subject, s.content
      FROM touchpoints t
      JOIN sequence_steps s ON t.sequence_step_id = s.id
      WHERE t.contact_id = ?
      ORDER BY t.sent_at DESC
    `).all(req.params.contactId);

    res.json(touchpoints);
  } catch (error) {
    console.error('Get contact touchpoints error:', error);
    res.status(500).json({ error: 'Failed to fetch touchpoints' });
  }
});

// Create touchpoint (simulate sending)
router.post('/', (req, res) => {
  try {
    const { contact_id, sequence_step_id, status = 'sent' } = req.body;

    if (!contact_id || !sequence_step_id) {
      return res.status(400).json({ error: 'Contact ID and sequence step ID are required' });
    }

    // Verify ownership
    const contact = db.prepare(`
      SELECT c.* FROM contacts c
      JOIN campaigns cp ON c.campaign_id = cp.id
      WHERE c.id = ? AND cp.user_id = ?
    `).get(contact_id, req.user.id);

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const result = db.prepare(`
      INSERT INTO touchpoints (contact_id, sequence_step_id, status)
      VALUES (?, ?, ?)
    `).run(contact_id, sequence_step_id, status);

    const touchpoint = db.prepare('SELECT * FROM touchpoints WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(touchpoint);
  } catch (error) {
    console.error('Create touchpoint error:', error);
    res.status(500).json({ error: 'Failed to create touchpoint' });
  }
});

// Update touchpoint (e.g., mark as opened or responded)
router.put('/:id', (req, res) => {
  try {
    const { status, response } = req.body;

    // Verify ownership
    const touchpoint = db.prepare(`
      SELECT t.* FROM touchpoints t
      JOIN contacts c ON t.contact_id = c.id
      JOIN campaigns cp ON c.campaign_id = cp.id
      WHERE t.id = ? AND cp.user_id = ?
    `).get(req.params.id, req.user.id);

    if (!touchpoint) {
      return res.status(404).json({ error: 'Touchpoint not found' });
    }

    const updates = [];
    const values = [];

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (response !== undefined) {
      updates.push('response = ?');
      values.push(response);
    }

    if (updates.length === 0) {
      return res.json(touchpoint);
    }

    values.push(req.params.id);

    db.prepare(`UPDATE touchpoints SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const updatedTouchpoint = db.prepare('SELECT * FROM touchpoints WHERE id = ?').get(req.params.id);

    res.json(updatedTouchpoint);
  } catch (error) {
    console.error('Update touchpoint error:', error);
    res.status(500).json({ error: 'Failed to update touchpoint' });
  }
});

// Execute campaign (simulate sending touchpoints)
router.post('/execute/:campaignId', (req, res) => {
  try {
    const { campaignId } = req.params;
    const { day } = req.body; // Specific day to execute, or null for all

    // Verify campaign ownership
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ? AND user_id = ?').get(campaignId, req.user.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get all contacts for this campaign
    const contacts = db.prepare('SELECT * FROM contacts WHERE campaign_id = ?').all(campaignId);

    if (contacts.length === 0) {
      return res.status(400).json({ error: 'No contacts in campaign' });
    }

    // Get sequence steps for the specified day or all days
    let steps;
    if (day !== undefined && day !== null) {
      steps = db.prepare('SELECT * FROM sequence_steps WHERE campaign_id = ? AND day_number = ?').all(campaignId, day);
    } else {
      steps = db.prepare('SELECT * FROM sequence_steps WHERE campaign_id = ?').all(campaignId);
    }

    if (steps.length === 0) {
      return res.status(400).json({ error: 'No sequence steps found' });
    }

    // Create touchpoints for each contact and step combination
    const stmt = db.prepare(`
      INSERT INTO touchpoints (contact_id, sequence_step_id, status)
      VALUES (?, ?, ?)
    `);

    let count = 0;
    const insertMany = db.transaction(() => {
      for (const contact of contacts) {
        for (const step of steps) {
          // Check if touchpoint already exists
          const existing = db.prepare(`
            SELECT id FROM touchpoints WHERE contact_id = ? AND sequence_step_id = ?
          `).get(contact.id, step.id);

          if (!existing) {
            // Simulate different statuses
            const statuses = ['sent', 'sent', 'sent', 'delivered', 'opened', 'responded'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

            stmt.run(contact.id, step.id, randomStatus);
            count++;
          }
        }
      }
    });

    insertMany();

    res.json({
      message: `Campaign execution simulated successfully`,
      touchpoints_created: count
    });
  } catch (error) {
    console.error('Execute campaign error:', error);
    res.status(500).json({ error: 'Failed to execute campaign' });
  }
});

// Execute a specific touchpoint (use real integrations)
router.post('/:id/execute', async (req, res) => {
  try {
    const touchpointId = req.params.id;

    // Verify ownership
    const touchpoint = db.prepare(`
      SELECT t.* FROM touchpoints t
      JOIN contacts c ON t.contact_id = c.id
      JOIN campaigns cp ON c.campaign_id = cp.id
      WHERE t.id = ? AND cp.user_id = ?
    `).get(touchpointId, req.user.id);

    if (!touchpoint) {
      return res.status(404).json({ error: 'Touchpoint not found' });
    }

    // Import and execute touchpoint
    const { executeTouchpoint } = await import('../services/outreach.js');
    const result = await executeTouchpoint(touchpointId, req.user.id);

    res.json({
      message: result.success ? 'Touchpoint executed successfully' : 'Touchpoint execution failed',
      result
    });
  } catch (error) {
    console.error('Execute touchpoint error:', error);
    res.status(500).json({ error: 'Failed to execute touchpoint', details: error.message });
  }
});

// Get campaign activity feed
router.get('/activity/:campaignId', (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Verify campaign ownership
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ? AND user_id = ?').get(req.params.campaignId, req.user.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const activity = db.prepare(`
      SELECT
        t.id,
        t.sent_at,
        t.status,
        t.response,
        c.name as contact_name,
        c.email,
        c.company,
        s.channel,
        s.day_number,
        s.subject
      FROM touchpoints t
      JOIN contacts c ON t.contact_id = c.id
      JOIN sequence_steps s ON t.sequence_step_id = s.id
      WHERE c.campaign_id = ?
      ORDER BY t.sent_at DESC
      LIMIT ?
    `).all(req.params.campaignId, parseInt(limit));

    res.json(activity);
  } catch (error) {
    console.error('Get activity feed error:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

export default router;
