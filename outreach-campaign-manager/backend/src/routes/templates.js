import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all templates for user
router.get('/', (req, res) => {
  try {
    const { channel, category } = req.query;

    let query = 'SELECT * FROM templates WHERE user_id = ?';
    const params = [req.user.id];

    if (channel) {
      query += ' AND channel = ?';
      params.push(channel);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const templates = db.prepare(query).all(...params);

    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get single template
router.get('/:id', (req, res) => {
  try {
    const template = db.prepare('SELECT * FROM templates WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Create template
router.post('/', (req, res) => {
  try {
    const { name, channel, subject, content, category } = req.body;

    if (!name || !channel || !content) {
      return res.status(400).json({ error: 'Name, channel, and content are required' });
    }

    const result = db.prepare(`
      INSERT INTO templates (user_id, name, channel, subject, content, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.id, name, channel, subject, content, category);

    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(template);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update template
router.put('/:id', (req, res) => {
  try {
    const { name, channel, subject, content, category } = req.body;

    // Verify ownership
    const template = db.prepare('SELECT * FROM templates WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
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
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }

    if (updates.length === 0) {
      return res.json(template);
    }

    values.push(req.params.id);

    db.prepare(`UPDATE templates SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const updatedTemplate = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);

    res.json(updatedTemplate);
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete template
router.delete('/:id', (req, res) => {
  try {
    const template = db.prepare('SELECT * FROM templates WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    db.prepare('DELETE FROM templates WHERE id = ?').run(req.params.id);

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

export default router;
