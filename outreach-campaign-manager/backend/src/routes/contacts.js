import express from 'express';
import multer from 'multer';
import db from '../db.js';
import { parseCSV } from '../utils/csvParser.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all contacts for a campaign
router.get('/campaign/:campaignId', (req, res) => {
  try {
    // Verify campaign ownership
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ? AND user_id = ?').get(req.params.campaignId, req.user.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const contacts = db.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM touchpoints WHERE contact_id = c.id) as touchpoint_count,
        (SELECT COUNT(*) FROM touchpoints WHERE contact_id = c.id AND status = 'responded') as response_count
      FROM contacts c
      WHERE c.campaign_id = ?
      ORDER BY c.created_at DESC
    `).all(req.params.campaignId);

    res.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Get single contact with timeline
router.get('/:id', (req, res) => {
  try {
    const contact = db.prepare(`
      SELECT c.*, cp.user_id
      FROM contacts c
      JOIN campaigns cp ON c.campaign_id = cp.id
      WHERE c.id = ? AND cp.user_id = ?
    `).get(req.params.id, req.user.id);

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Get touchpoints with sequence step details
    const touchpoints = db.prepare(`
      SELECT t.*, s.day_number, s.channel, s.subject, s.content
      FROM touchpoints t
      JOIN sequence_steps s ON t.sequence_step_id = s.id
      WHERE t.contact_id = ?
      ORDER BY t.sent_at DESC
    `).all(req.params.id);

    res.json({
      ...contact,
      touchpoints
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// Create single contact
router.post('/', (req, res) => {
  try {
    const { campaign_id, name, email, phone, whatsapp, company, title, status = 'active' } = req.body;

    if (!campaign_id || !name) {
      return res.status(400).json({ error: 'Campaign ID and name are required' });
    }

    // Verify campaign ownership
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ? AND user_id = ?').get(campaign_id, req.user.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const result = db.prepare(`
      INSERT INTO contacts (campaign_id, name, email, phone, whatsapp, company, title, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(campaign_id, name, email, phone, whatsapp, company, title, status);

    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(contact);
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Bulk import contacts from CSV
router.post('/import/:campaignId', upload.single('file'), async (req, res) => {
  try {
    const { campaignId } = req.params;

    // Verify campaign ownership
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ? AND user_id = ?').get(campaignId, req.user.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { contacts, errors } = await parseCSV(req.file.buffer);

    if (contacts.length === 0) {
      return res.status(400).json({ error: 'No valid contacts found in CSV', errors });
    }

    // Insert contacts
    const stmt = db.prepare(`
      INSERT INTO contacts (campaign_id, name, email, phone, whatsapp, company, title)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((contactList) => {
      for (const contact of contactList) {
        stmt.run(
          campaignId,
          contact.name,
          contact.email,
          contact.phone,
          contact.whatsapp,
          contact.company,
          contact.title
        );
      }
    });

    insertMany(contacts);

    res.status(201).json({
      message: `Successfully imported ${contacts.length} contacts`,
      count: contacts.length,
      errors
    });
  } catch (error) {
    console.error('Import contacts error:', error);
    res.status(500).json({ error: 'Failed to import contacts' });
  }
});

// Update contact
router.put('/:id', (req, res) => {
  try {
    const { name, email, phone, whatsapp, company, title, status, notes, tags } = req.body;

    // Verify ownership
    const contact = db.prepare(`
      SELECT c.* FROM contacts c
      JOIN campaigns cp ON c.campaign_id = cp.id
      WHERE c.id = ? AND cp.user_id = ?
    `).get(req.params.id, req.user.id);

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (whatsapp !== undefined) {
      updates.push('whatsapp = ?');
      values.push(whatsapp);
    }
    if (company !== undefined) {
      updates.push('company = ?');
      values.push(company);
    }
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }
    if (tags !== undefined) {
      updates.push('tags = ?');
      values.push(tags);
    }

    if (updates.length === 0) {
      return res.json(contact);
    }

    values.push(req.params.id);

    db.prepare(`UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const updatedContact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);

    res.json(updatedContact);
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact
router.delete('/:id', (req, res) => {
  try {
    const contact = db.prepare(`
      SELECT c.* FROM contacts c
      JOIN campaigns cp ON c.campaign_id = cp.id
      WHERE c.id = ? AND cp.user_id = ?
    `).get(req.params.id, req.user.id);

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// Get all contacts for user (across all campaigns)
router.get('/', (req, res) => {
  try {
    const contacts = db.prepare(`
      SELECT c.*, cp.name as campaign_name
      FROM contacts c
      JOIN campaigns cp ON c.campaign_id = cp.id
      WHERE cp.user_id = ?
      ORDER BY c.created_at DESC
    `).all(req.user.id);

    res.json(contacts);
  } catch (error) {
    console.error('Get all contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

export default router;
