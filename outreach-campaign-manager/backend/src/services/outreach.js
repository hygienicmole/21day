import db from '../db.js';
import { ElevenLabsService } from './elevenlabs.js';
import { TwilioService } from './twilio.js';

/**
 * Execute a single touchpoint
 * @param {number} touchpointId - The touchpoint ID
 * @param {number} userId - The user ID for integration lookup
 * @returns {Promise<Object>} Execution result
 */
export async function executeTouchpoint(touchpointId, userId) {
  try {
    // Get touchpoint details with contact and sequence step info
    const touchpoint = db.prepare(`
      SELECT
        t.*,
        c.name, c.email, c.phone, c.whatsapp, c.company, c.title,
        s.channel, s.subject, s.content, s.day_number,
        cam.industry
      FROM touchpoints t
      JOIN contacts c ON t.contact_id = c.id
      JOIN sequence_steps s ON t.sequence_step_id = s.id
      JOIN campaigns cam ON c.campaign_id = cam.id
      WHERE t.id = ?
    `).get(touchpointId);

    if (!touchpoint) {
      return { success: false, error: 'Touchpoint not found' };
    }

    // Replace variables in content
    const personalizedContent = replaceVariables(touchpoint.content, {
      Name: touchpoint.name,
      Company: touchpoint.company || '',
      Title: touchpoint.title || '',
      Industry: touchpoint.industry || ''
    });

    const personalizedSubject = touchpoint.subject
      ? replaceVariables(touchpoint.subject, {
          Name: touchpoint.name,
          Company: touchpoint.company || '',
          Title: touchpoint.title || '',
          Industry: touchpoint.industry || ''
        })
      : null;

    let result;

    switch (touchpoint.channel) {
      case 'call':
        result = await executeCall(userId, touchpoint, personalizedContent);
        break;
      case 'email':
        result = await executeEmail(userId, touchpoint, personalizedSubject, personalizedContent);
        break;
      case 'whatsapp':
        result = await executeWhatsApp(userId, touchpoint, personalizedContent);
        break;
      case 'voicemail':
        result = await executeVoicemail(userId, touchpoint, personalizedContent);
        break;
      default:
        result = { success: false, error: 'Unknown channel' };
    }

    // Update touchpoint with result
    db.prepare(`
      UPDATE touchpoints
      SET status = ?, external_id = ?, error_message = ?, sent_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      result.success ? 'sent' : 'failed',
      result.externalId || null,
      result.error || null,
      touchpointId
    );

    return result;
  } catch (error) {
    console.error('Execute touchpoint error:', error);

    // Update touchpoint as failed
    db.prepare(`
      UPDATE touchpoints SET status = ?, error_message = ? WHERE id = ?
    `).run('failed', error.message, touchpointId);

    return { success: false, error: error.message };
  }
}

/**
 * Execute a phone call via ElevenLabs
 */
async function executeCall(userId, touchpoint, content) {
  // Get ElevenLabs integration
  const integration = db.prepare(`
    SELECT * FROM integrations WHERE user_id = ? AND service = 'elevenlabs' AND is_active = 1
  `).get(userId);

  if (!integration || !integration.api_key || !integration.agent_id) {
    return {
      success: false,
      error: 'ElevenLabs integration not configured or inactive'
    };
  }

  if (!touchpoint.phone) {
    return { success: false, error: 'Contact has no phone number' };
  }

  const elevenlabs = new ElevenLabsService(integration.api_key, integration.agent_id);

  const result = await elevenlabs.makeCall(
    touchpoint.phone,
    touchpoint.name.split(' ')[0], // First name
    {
      company: touchpoint.company,
      title: touchpoint.title,
      callScript: content
    }
  );

  return {
    success: result.success,
    externalId: result.conversationId,
    error: result.error
  };
}

/**
 * Execute email (simulation for now - can integrate with SendGrid/etc later)
 */
async function executeEmail(userId, touchpoint, subject, content) {
  // For now, just log it as sent
  // In production, integrate with SendGrid, AWS SES, or similar
  if (!touchpoint.email) {
    return { success: false, error: 'Contact has no email address' };
  }

  console.log(`[EMAIL] To: ${touchpoint.email}, Subject: ${subject}`);
  console.log(`[EMAIL] Content: ${content.substring(0, 100)}...`);

  // Simulate success
  return {
    success: true,
    externalId: `email-${Date.now()}`,
    error: null
  };
}

/**
 * Execute WhatsApp message via Twilio
 */
async function executeWhatsApp(userId, touchpoint, content) {
  // Get WhatsApp/Twilio integration
  const integration = db.prepare(`
    SELECT * FROM integrations WHERE user_id = ? AND service = 'whatsapp' AND is_active = 1
  `).get(userId);

  if (!integration || !integration.api_key || !integration.api_secret) {
    return {
      success: false,
      error: 'WhatsApp integration not configured or inactive'
    };
  }

  if (!touchpoint.whatsapp && !touchpoint.phone) {
    return { success: false, error: 'Contact has no WhatsApp number' };
  }

  const twilio = new TwilioService(
    integration.api_key,
    integration.api_secret,
    integration.phone_number
  );

  const result = await twilio.sendWhatsApp(
    touchpoint.whatsapp || touchpoint.phone,
    content
  );

  return {
    success: result.success,
    externalId: result.messageSid,
    error: result.error
  };
}

/**
 * Execute voicemail via Twilio
 */
async function executeVoicemail(userId, touchpoint, content) {
  // Get Twilio integration
  const integration = db.prepare(`
    SELECT * FROM integrations WHERE user_id = ? AND service = 'twilio' AND is_active = 1
  `).get(userId);

  if (!integration || !integration.api_key || !integration.api_secret) {
    return {
      success: false,
      error: 'Twilio integration not configured or inactive'
    };
  }

  if (!touchpoint.phone) {
    return { success: false, error: 'Contact has no phone number' };
  }

  // For voicemail, we need a TwiML endpoint
  // For now, just simulate
  console.log(`[VOICEMAIL] To: ${touchpoint.phone}`);
  console.log(`[VOICEMAIL] Content: ${content}`);

  return {
    success: true,
    externalId: `voicemail-${Date.now()}`,
    error: null
  };
}

/**
 * Replace variables in content
 */
function replaceVariables(content, variables) {
  let result = content;

  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key] || '');
  });

  return result;
}

export default {
  executeTouchpoint
};
