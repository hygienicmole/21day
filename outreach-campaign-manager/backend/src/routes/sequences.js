import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all sequence steps for a campaign
router.get('/campaign/:campaignId', (req, res) => {
  try {
    // Verify campaign ownership
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ? AND user_id = ?').get(req.params.campaignId, req.user.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const steps = db.prepare(`
      SELECT * FROM sequence_steps
      WHERE campaign_id = ?
      ORDER BY day_number, order_index
    `).all(req.params.campaignId);

    res.json(steps);
  } catch (error) {
    console.error('Get sequence steps error:', error);
    res.status(500).json({ error: 'Failed to fetch sequence steps' });
  }
});

// Create sequence step
router.post('/', (req, res) => {
  try {
    const { campaign_id, day_number, channel, subject, content, order_index = 0 } = req.body;

    if (!campaign_id || day_number === undefined || !channel || !content) {
      return res.status(400).json({ error: 'Campaign ID, day number, channel, and content are required' });
    }

    // Verify campaign ownership
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ? AND user_id = ?').get(campaign_id, req.user.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const result = db.prepare(`
      INSERT INTO sequence_steps (campaign_id, day_number, channel, subject, content, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(campaign_id, day_number, channel, subject, content, order_index);

    const step = db.prepare('SELECT * FROM sequence_steps WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(step);
  } catch (error) {
    console.error('Create sequence step error:', error);
    res.status(500).json({ error: 'Failed to create sequence step' });
  }
});

// Bulk create/update sequence steps
router.post('/bulk/:campaignId', (req, res) => {
  try {
    const { campaignId } = req.params;
    const { steps } = req.body;

    if (!Array.isArray(steps)) {
      return res.status(400).json({ error: 'Steps must be an array' });
    }

    // Verify campaign ownership
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ? AND user_id = ?').get(campaignId, req.user.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Delete existing steps for this campaign
    db.prepare('DELETE FROM sequence_steps WHERE campaign_id = ?').run(campaignId);

    // Insert new steps
    const stmt = db.prepare(`
      INSERT INTO sequence_steps (campaign_id, day_number, channel, subject, content, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((stepList) => {
      for (const step of stepList) {
        stmt.run(
          campaignId,
          step.day_number,
          step.channel,
          step.subject || '',
          step.content,
          step.order_index || 0
        );
      }
    });

    insertMany(steps);

    const newSteps = db.prepare(`
      SELECT * FROM sequence_steps WHERE campaign_id = ? ORDER BY day_number, order_index
    `).all(campaignId);

    res.json({
      message: `Successfully saved ${steps.length} sequence steps`,
      steps: newSteps
    });
  } catch (error) {
    console.error('Bulk create sequence steps error:', error);
    res.status(500).json({ error: 'Failed to save sequence steps' });
  }
});

// Update sequence step
router.put('/:id', (req, res) => {
  try {
    const { day_number, channel, subject, content, order_index } = req.body;

    // Verify ownership
    const step = db.prepare(`
      SELECT s.* FROM sequence_steps s
      JOIN campaigns c ON s.campaign_id = c.id
      WHERE s.id = ? AND c.user_id = ?
    `).get(req.params.id, req.user.id);

    if (!step) {
      return res.status(404).json({ error: 'Sequence step not found' });
    }

    const updates = [];
    const values = [];

    if (day_number !== undefined) {
      updates.push('day_number = ?');
      values.push(day_number);
    }
    if (channel !== undefined) {
      updates.push('channel = ?');
      values.push(channel);
    }
    if (subject !== undefined) {
      updates.push('subject = ?');
      values.push(subject);
    }
    if (content !== undefined) {
      updates.push('content = ?');
      values.push(content);
    }
    if (order_index !== undefined) {
      updates.push('order_index = ?');
      values.push(order_index);
    }

    if (updates.length === 0) {
      return res.json(step);
    }

    values.push(req.params.id);

    db.prepare(`UPDATE sequence_steps SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const updatedStep = db.prepare('SELECT * FROM sequence_steps WHERE id = ?').get(req.params.id);

    res.json(updatedStep);
  } catch (error) {
    console.error('Update sequence step error:', error);
    res.status(500).json({ error: 'Failed to update sequence step' });
  }
});

// Delete sequence step
router.delete('/:id', (req, res) => {
  try {
    const step = db.prepare(`
      SELECT s.* FROM sequence_steps s
      JOIN campaigns c ON s.campaign_id = c.id
      WHERE s.id = ? AND c.user_id = ?
    `).get(req.params.id, req.user.id);

    if (!step) {
      return res.status(404).json({ error: 'Sequence step not found' });
    }

    db.prepare('DELETE FROM sequence_steps WHERE id = ?').run(req.params.id);

    res.json({ message: 'Sequence step deleted successfully' });
  } catch (error) {
    console.error('Delete sequence step error:', error);
    res.status(500).json({ error: 'Failed to delete sequence step' });
  }
});

export default router;
