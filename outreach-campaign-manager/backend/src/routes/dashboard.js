import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get master dashboard stats
router.get('/stats', (req, res) => {
  try {
    // Overall statistics
    const overallStats = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM campaigns WHERE user_id = ?) as total_campaigns,
        (SELECT COUNT(*) FROM campaigns WHERE user_id = ? AND status = 'active') as active_campaigns,
        (SELECT COUNT(*) FROM contacts c JOIN campaigns cam ON c.campaign_id = cam.id WHERE cam.user_id = ?) as total_contacts,
        (SELECT COUNT(*) FROM touchpoints t JOIN contacts c ON t.contact_id = c.id JOIN campaigns cam ON c.campaign_id = cam.id WHERE cam.user_id = ?) as total_touchpoints,
        (SELECT COUNT(*) FROM touchpoints t JOIN contacts c ON t.contact_id = c.id JOIN campaigns cam ON c.campaign_id = cam.id WHERE cam.user_id = ? AND t.status = 'sent') as sent_touchpoints,
        (SELECT COUNT(*) FROM touchpoints t JOIN contacts c ON t.contact_id = c.id JOIN campaigns cam ON c.campaign_id = cam.id WHERE cam.user_id = ? AND t.status = 'failed') as failed_touchpoints,
        (SELECT COUNT(*) FROM templates WHERE user_id = ?) as total_templates
    `).get(req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id);

    // Channel breakdown
    const channelStats = db.prepare(`
      SELECT
        s.channel,
        COUNT(DISTINCT t.id) as total_sent,
        COUNT(DISTINCT CASE WHEN t.status = 'sent' THEN t.id END) as successful,
        COUNT(DISTINCT CASE WHEN t.status = 'failed' THEN t.id END) as failed
      FROM sequence_steps s
      LEFT JOIN touchpoints t ON s.id = t.sequence_step_id
      JOIN campaigns cam ON s.campaign_id = cam.id
      WHERE cam.user_id = ?
      GROUP BY s.channel
    `).all(req.user.id);

    // Recent activity (last 50 touchpoints)
    const recentActivity = db.prepare(`
      SELECT
        t.id,
        t.sent_at,
        t.status,
        t.external_id,
        t.call_duration,
        t.error_message,
        c.name as contact_name,
        c.email,
        c.company,
        s.channel,
        s.day_number,
        cam.name as campaign_name
      FROM touchpoints t
      JOIN contacts c ON t.contact_id = c.id
      JOIN sequence_steps s ON t.sequence_step_id = s.id
      JOIN campaigns cam ON c.campaign_id = cam.id
      WHERE cam.user_id = ?
      ORDER BY t.sent_at DESC
      LIMIT 50
    `).all(req.user.id);

    // Campaign performance
    const campaignPerformance = db.prepare(`
      SELECT
        cam.id,
        cam.name,
        cam.status,
        COUNT(DISTINCT c.id) as contact_count,
        COUNT(DISTINCT t.id) as touchpoint_count,
        COUNT(DISTINCT CASE WHEN t.status = 'sent' THEN t.id END) as sent_count,
        COUNT(DISTINCT CASE WHEN t.status = 'failed' THEN t.id END) as failed_count
      FROM campaigns cam
      LEFT JOIN contacts c ON cam.id = c.campaign_id
      LEFT JOIN touchpoints t ON c.id = t.contact_id
      WHERE cam.user_id = ?
      GROUP BY cam.id
      ORDER BY cam.created_at DESC
      LIMIT 10
    `).all(req.user.id);

    // Daily activity (last 7 days)
    const dailyActivity = db.prepare(`
      SELECT
        DATE(t.sent_at) as date,
        COUNT(*) as touchpoints,
        COUNT(CASE WHEN t.status = 'sent' THEN 1 END) as successful,
        COUNT(CASE WHEN t.status = 'failed' THEN 1 END) as failed
      FROM touchpoints t
      JOIN contacts c ON t.contact_id = c.id
      JOIN campaigns cam ON c.campaign_id = cam.id
      WHERE cam.user_id = ? AND t.sent_at >= DATE('now', '-7 days')
      GROUP BY DATE(t.sent_at)
      ORDER BY date DESC
    `).all(req.user.id);

    // Integration status
    const integrations = db.prepare(`
      SELECT service, is_active
      FROM integrations
      WHERE user_id = ?
    `).all(req.user.id);

    res.json({
      overall: overallStats,
      channelStats,
      recentActivity,
      campaignPerformance,
      dailyActivity,
      integrations
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get realtime stats (for live updates)
router.get('/realtime', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM touchpoints t JOIN contacts c ON t.contact_id = c.id JOIN campaigns cam ON c.campaign_id = cam.id WHERE cam.user_id = ? AND DATE(t.sent_at) = DATE('now')) as today_touchpoints,
        (SELECT COUNT(*) FROM touchpoints t JOIN contacts c ON t.contact_id = c.id JOIN campaigns cam ON c.campaign_id = cam.id WHERE cam.user_id = ? AND t.sent_at >= DATETIME('now', '-1 hour')) as last_hour_touchpoints,
        (SELECT COUNT(*) FROM campaigns WHERE user_id = ? AND status = 'active') as active_campaigns
    `).get(req.user.id, req.user.id, req.user.id);

    res.json(stats);
  } catch (error) {
    console.error('Realtime stats error:', error);
    res.status(500).json({ error: 'Failed to fetch realtime statistics' });
  }
});

export default router;
