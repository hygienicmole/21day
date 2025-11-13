import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all integrations for user
router.get('/', (req, res) => {
  try {
    const integrations = db.prepare(`
      SELECT id, service, agent_id, phone_number, is_active, created_at, updated_at
      FROM integrations
      WHERE user_id = ?
    `).all(req.user.id);

    res.json(integrations);
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// Get specific integration
router.get('/:service', (req, res) => {
  try {
    const integration = db.prepare(`
      SELECT id, service, agent_id, phone_number, is_active, created_at, updated_at
      FROM integrations
      WHERE user_id = ? AND service = ?
    `).get(req.user.id, req.params.service);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json(integration);
  } catch (error) {
    console.error('Get integration error:', error);
    res.status(500).json({ error: 'Failed to fetch integration' });
  }
});

// Create or update integration
router.post('/', (req, res) => {
  try {
    const { service, api_key, api_secret, agent_id, phone_number, config, is_active } = req.body;

    if (!service) {
      return res.status(400).json({ error: 'Service name is required' });
    }

    // Check if integration exists
    const existing = db.prepare(`
      SELECT id FROM integrations WHERE user_id = ? AND service = ?
    `).get(req.user.id, service);

    let integration;

    if (existing) {
      // Update existing
      db.prepare(`
        UPDATE integrations
        SET api_key = ?, api_secret = ?, agent_id = ?, phone_number = ?,
            config = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        api_key || null,
        api_secret || null,
        agent_id || null,
        phone_number || null,
        config ? JSON.stringify(config) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        existing.id
      );

      integration = db.prepare(`
        SELECT id, service, agent_id, phone_number, is_active, created_at, updated_at
        FROM integrations WHERE id = ?
      `).get(existing.id);
    } else {
      // Create new
      const result = db.prepare(`
        INSERT INTO integrations (user_id, service, api_key, api_secret, agent_id, phone_number, config, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        service,
        api_key || null,
        api_secret || null,
        agent_id || null,
        phone_number || null,
        config ? JSON.stringify(config) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1
      );

      integration = db.prepare(`
        SELECT id, service, agent_id, phone_number, is_active, created_at, updated_at
        FROM integrations WHERE id = ?
      `).get(result.lastInsertRowid);
    }

    res.json({
      message: existing ? 'Integration updated' : 'Integration created',
      integration
    });
  } catch (error) {
    console.error('Save integration error:', error);
    res.status(500).json({ error: 'Failed to save integration' });
  }
});

// Delete integration
router.delete('/:service', (req, res) => {
  try {
    const integration = db.prepare(`
      SELECT id FROM integrations WHERE user_id = ? AND service = ?
    `).get(req.user.id, req.params.service);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    db.prepare('DELETE FROM integrations WHERE id = ?').run(integration.id);

    res.json({ message: 'Integration deleted successfully' });
  } catch (error) {
    console.error('Delete integration error:', error);
    res.status(500).json({ error: 'Failed to delete integration' });
  }
});

// Test integration
router.post('/:service/test', async (req, res) => {
  try {
    const { service } = req.params;
    const { testNumber, testMessage } = req.body;

    // Get integration with full details (including API keys)
    const integration = db.prepare(`
      SELECT * FROM integrations WHERE user_id = ? AND service = ? AND is_active = 1
    `).get(req.user.id, service);

    if (!integration) {
      return res.status(404).json({ error: 'Active integration not found' });
    }

    let result;

    if (service === 'elevenlabs') {
      const { ElevenLabsService } = await import('../services/elevenlabs.js');
      const elevenlabs = new ElevenLabsService(integration.api_key, integration.agent_id);
      result = await elevenlabs.makeCall(testNumber, 'Test Contact');
    } else if (service === 'twilio') {
      const { TwilioService } = await import('../services/twilio.js');
      const twilio = new TwilioService(
        integration.api_key,
        integration.api_secret,
        integration.phone_number
      );
      result = await twilio.sendSMS(testNumber, testMessage || 'Test message from Outreach Manager');
    } else if (service === 'whatsapp') {
      const { TwilioService } = await import('../services/twilio.js');
      const twilio = new TwilioService(
        integration.api_key,
        integration.api_secret,
        integration.phone_number
      );
      result = await twilio.sendWhatsApp(testNumber, testMessage || 'Test WhatsApp message from Outreach Manager');
    } else {
      return res.status(400).json({ error: 'Unknown service' });
    }

    res.json({
      message: 'Test completed',
      result
    });
  } catch (error) {
    console.error('Test integration error:', error);
    res.status(500).json({ error: 'Failed to test integration', details: error.message });
  }
});

export default router;
