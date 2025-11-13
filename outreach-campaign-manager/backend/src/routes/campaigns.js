import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all campaigns for the authenticated user
router.get('/', (req, res) => {
  try {
    const campaigns = db.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM contacts WHERE campaign_id = c.id) as contact_count,
        (SELECT COUNT(*) FROM sequence_steps WHERE campaign_id = c.id) as step_count,
        (SELECT COUNT(*) FROM touchpoints t
         JOIN contacts ct ON t.contact_id = ct.id
         WHERE ct.campaign_id = c.id) as touchpoint_count,
        (SELECT COUNT(*) FROM touchpoints t
         JOIN contacts ct ON t.contact_id = ct.id
         WHERE ct.campaign_id = c.id AND t.status = 'opened') as open_count,
        (SELECT COUNT(*) FROM touchpoints t
         JOIN contacts ct ON t.contact_id = ct.id
         WHERE ct.campaign_id = c.id AND t.status = 'responded') as response_count
      FROM campaigns c
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `).all(req.user.id);

    res.json(campaigns);
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Get single campaign by ID
router.get('/:id', (req, res) => {
  try {
    const campaign = db.prepare(`
      SELECT * FROM campaigns WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get contacts
    const contacts = db.prepare(`
      SELECT * FROM contacts WHERE campaign_id = ?
    `).all(req.params.id);

    // Get sequence steps
    const steps = db.prepare(`
      SELECT * FROM sequence_steps WHERE campaign_id = ? ORDER BY day_number, order_index
    `).all(req.params.id);

    res.json({
      ...campaign,
      contacts,
      steps
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// Create new campaign
router.post('/', (req, res) => {
  try {
    const { name, industry, goal, start_date, status = 'draft' } = req.body;

    if (!name || !start_date) {
      return res.status(400).json({ error: 'Name and start date are required' });
    }

    const result = db.prepare(`
      INSERT INTO campaigns (user_id, name, industry, goal, start_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.id, name, industry, goal, start_date, status);

    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Update campaign
router.put('/:id', (req, res) => {
  try {
    const { name, industry, goal, start_date, status } = req.body;

    // Verify ownership
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (industry !== undefined) {
      updates.push('industry = ?');
      values.push(industry);
    }
    if (goal !== undefined) {
      updates.push('goal = ?');
      values.push(goal);
    }
    if (start_date !== undefined) {
      updates.push('start_date = ?');
      values.push(start_date);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.json(campaign);
    }

    values.push(req.params.id);

    db.prepare(`UPDATE campaigns SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const updatedCampaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id);

    res.json(updatedCampaign);
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// Delete campaign
router.delete('/:id', (req, res) => {
  try {
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    db.prepare('DELETE FROM campaigns WHERE id = ?').run(req.params.id);

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// Get campaign analytics
router.get('/:id/analytics', (req, res) => {
  try {
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const analytics = db.prepare(`
      SELECT
        COUNT(DISTINCT c.id) as total_contacts,
        COUNT(DISTINCT t.id) as total_touchpoints,
        COUNT(DISTINCT CASE WHEN t.status = 'opened' THEN t.id END) as opens,
        COUNT(DISTINCT CASE WHEN t.status = 'responded' THEN t.id END) as responses,
        COUNT(DISTINCT CASE WHEN t.status = 'failed' THEN t.id END) as failures
      FROM contacts c
      LEFT JOIN touchpoints t ON c.id = t.contact_id
      WHERE c.campaign_id = ?
    `).get(req.params.id);

    const channelBreakdown = db.prepare(`
      SELECT
        s.channel,
        COUNT(t.id) as count,
        COUNT(CASE WHEN t.status = 'opened' THEN 1 END) as opens,
        COUNT(CASE WHEN t.status = 'responded' THEN 1 END) as responses
      FROM sequence_steps s
      LEFT JOIN touchpoints t ON s.id = t.sequence_step_id
      WHERE s.campaign_id = ?
      GROUP BY s.channel
    `).all(req.params.id);

    res.json({
      ...analytics,
      channelBreakdown
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
