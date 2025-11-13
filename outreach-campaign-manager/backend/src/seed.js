import bcrypt from 'bcrypt';
import db, { initializeDatabase } from './db.js';

async function seedDatabase() {
  console.log('Seeding database...');

  // Initialize database first
  initializeDatabase();

  // Create default user
  const passwordHash = await bcrypt.hash('admin123', 10);

  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');

  let userId;
  if (!existingUser) {
    const userResult = db.prepare(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)'
    ).run('admin', passwordHash);
    userId = userResult.lastInsertRowid;
    console.log('✓ Created default user (username: admin, password: admin123)');
  } else {
    userId = existingUser.id;
    console.log('✓ Default user already exists');
  }

  // Seed templates with sample outreach messages
  const templates = [
    {
      name: 'Day 0 - Initial Email',
      channel: 'email',
      subject: 'Quick question about {{Company}}',
      content: `Hi {{Name}},

I noticed {{Company}} is in the {{Industry}} space, and I wanted to reach out.

We help companies like yours streamline their outreach processes and improve response rates by up to 40%.

Would you be open to a quick 15-minute call next week to discuss how we might be able to help {{Company}}?

Best regards,
[Your Name]`,
      category: 'Initial Outreach'
    },
    {
      name: 'Day 2 - Follow-up Email',
      channel: 'email',
      subject: 'Following up - {{Company}}',
      content: `Hi {{Name}},

I wanted to follow up on my previous email about helping {{Company}} improve your outreach strategy.

I understand you're busy, so I'll keep this brief. Would you have 10 minutes this week for a quick call?

Looking forward to hearing from you.

Best,
[Your Name]`,
      category: 'Follow-up'
    },
    {
      name: 'Day 3 - LinkedIn/WhatsApp Message',
      channel: 'whatsapp',
      content: `Hi {{Name}}, I sent you an email about helping {{Company}} optimize your outreach. Would love to connect and share some insights. Are you available for a brief call this week?`,
      category: 'Follow-up'
    },
    {
      name: 'Day 5 - Value Proposition Email',
      channel: 'email',
      subject: 'How we helped [Similar Company]',
      content: `Hi {{Name}},

I wanted to share a quick success story that might be relevant to {{Company}}.

We recently helped [Similar Company] in the {{Industry}} industry:
- Increased response rates by 45%
- Reduced outreach time by 60%
- Generated 3x more qualified leads

I'd love to show you how we could achieve similar results for {{Company}}.

Would you be available for a 15-minute call this week?

Best regards,
[Your Name]`,
      category: 'Value Proposition'
    },
    {
      name: 'Day 7 - Phone Call Script',
      channel: 'call',
      content: `Hi {{Name}}, this is [Your Name] from [Your Company].

I've been trying to reach you via email about helping {{Company}} improve your outreach strategy.

The reason for my call is that we've helped several companies in the {{Industry}} space increase their response rates significantly.

Do you have a few minutes to chat, or would it be better if I called back at a different time?

[If yes, continue with value prop]
[If no, ask for better time to call]`,
      category: 'Call Script'
    },
    {
      name: 'Day 7 - Voicemail Script',
      channel: 'voicemail',
      content: `Hi {{Name}}, this is [Your Name] from [Your Company], calling about improving {{Company}}'s outreach strategy.

I've sent you a couple of emails and wanted to connect personally. We've helped companies like yours increase response rates by 40% and save hours each week on outreach.

I'd love to share some specific ideas for {{Company}}. Please give me a call back at [Your Number], or reply to my email.

Thanks, and I look forward to connecting soon.`,
      category: 'Voicemail'
    },
    {
      name: 'Day 10 - Case Study Email',
      channel: 'email',
      subject: 'Thought you might find this interesting',
      content: `Hi {{Name}},

I wanted to share a case study that's particularly relevant to {{Company}}.

[Company Name], a {{Industry}} company similar to yours, was struggling with:
- Low email response rates (under 5%)
- Time-consuming manual outreach
- Difficulty tracking follow-ups

After implementing our solution:
- Response rates increased to 23%
- Saved 15 hours per week on outreach
- Closed 40% more deals in Q4

I'd be happy to walk you through how we achieved these results and how it might apply to {{Company}}.

Would you be available for a brief call this week?

Best,
[Your Name]`,
      category: 'Case Study'
    },
    {
      name: 'Day 14 - Last Attempt Email',
      channel: 'email',
      subject: 'Should I close your file?',
      content: `Hi {{Name}},

I've reached out a few times about helping {{Company}} improve your outreach results, but haven't heard back.

I understand you're busy and this might not be a priority right now.

Should I go ahead and close your file, or would you still like to explore how we could help {{Company}}?

Just let me know either way.

Best regards,
[Your Name]`,
      category: 'Breakup Email'
    },
    {
      name: 'Day 17 - WhatsApp Check-in',
      channel: 'whatsapp',
      content: `Hi {{Name}}, just wanted to check in one last time. We've been helping {{Industry}} companies significantly improve their outreach. If you're interested in learning more, I'm here. If not, no worries - just let me know and I'll stop reaching out. Thanks!`,
      category: 'Final Follow-up'
    },
    {
      name: 'Day 21 - Final Email',
      channel: 'email',
      subject: 'Final note for {{Name}}',
      content: `Hi {{Name}},

This will be my last email. I wanted to reach out one final time about helping {{Company}} with your outreach strategy.

If the timing isn't right now, I completely understand. Feel free to reach out if things change in the future.

I'll leave you with this: The average company sees a 35% increase in response rates within 30 days of implementing our solution.

If you'd like to be one of them, just reply to this email.

All the best,
[Your Name]

P.S. - If you're not the right person to discuss this, could you point me in the right direction?`,
      category: 'Final Touch'
    }
  ];

  // Check if templates already exist
  const existingTemplates = db.prepare('SELECT COUNT(*) as count FROM templates WHERE user_id = ?').get(userId);

  if (existingTemplates.count === 0) {
    const stmt = db.prepare(`
      INSERT INTO templates (user_id, name, channel, subject, content, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((templateList) => {
      for (const template of templateList) {
        stmt.run(
          userId,
          template.name,
          template.channel,
          template.subject || '',
          template.content,
          template.category
        );
      }
    });

    insertMany(templates);
    console.log(`✓ Created ${templates.length} sample templates`);
  } else {
    console.log('✓ Templates already exist');
  }

  // Create a sample campaign
  const existingCampaign = db.prepare('SELECT COUNT(*) as count FROM campaigns WHERE user_id = ?').get(userId);

  if (existingCampaign.count === 0) {
    const campaignResult = db.prepare(`
      INSERT INTO campaigns (user_id, name, industry, goal, start_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, 'Q4 Enterprise Outreach', 'SaaS/Technology', 'Generate qualified leads for Q4', '2024-01-15', 'active');

    const campaignId = campaignResult.lastInsertRowid;

    // Add sample contacts
    const contacts = [
      { name: 'John Smith', email: 'john.smith@techcorp.com', phone: '+1-555-0101', company: 'TechCorp Inc', title: 'VP of Sales' },
      { name: 'Sarah Johnson', email: 'sarah.j@innovate.io', phone: '+1-555-0102', company: 'Innovate Solutions', title: 'Head of Marketing' },
      { name: 'Michael Chen', email: 'mchen@dataworks.com', phone: '+1-555-0103', company: 'DataWorks', title: 'Chief Revenue Officer' },
      { name: 'Emily Rodriguez', email: 'emily.r@cloudnine.com', phone: '+1-555-0104', company: 'CloudNine Systems', title: 'Director of Partnerships' },
      { name: 'David Park', email: 'dpark@scalable.io', phone: '+1-555-0105', company: 'Scalable Inc', title: 'VP of Business Development' }
    ];

    const contactStmt = db.prepare(`
      INSERT INTO contacts (campaign_id, name, email, phone, whatsapp, company, title)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertContacts = db.transaction((contactList) => {
      for (const contact of contactList) {
        contactStmt.run(
          campaignId,
          contact.name,
          contact.email,
          contact.phone,
          contact.phone,
          contact.company,
          contact.title
        );
      }
    });

    insertContacts(contacts);

    // Add sample sequence steps (21-day sequence)
    const sequenceSteps = [
      { day: 0, channel: 'email', subject: 'Quick question about {{Company}}', content: templates[0].content, order: 0 },
      { day: 2, channel: 'email', subject: 'Following up - {{Company}}', content: templates[1].content, order: 0 },
      { day: 3, channel: 'whatsapp', subject: '', content: templates[2].content, order: 0 },
      { day: 5, channel: 'email', subject: 'How we helped [Similar Company]', content: templates[3].content, order: 0 },
      { day: 7, channel: 'call', subject: '', content: templates[4].content, order: 0 },
      { day: 7, channel: 'voicemail', subject: '', content: templates[5].content, order: 1 },
      { day: 10, channel: 'email', subject: 'Thought you might find this interesting', content: templates[6].content, order: 0 },
      { day: 14, channel: 'email', subject: 'Should I close your file?', content: templates[7].content, order: 0 },
      { day: 17, channel: 'whatsapp', subject: '', content: templates[8].content, order: 0 },
      { day: 21, channel: 'email', subject: 'Final note for {{Name}}', content: templates[9].content, order: 0 }
    ];

    const stepStmt = db.prepare(`
      INSERT INTO sequence_steps (campaign_id, day_number, channel, subject, content, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertSteps = db.transaction((stepList) => {
      for (const step of stepList) {
        stepStmt.run(
          campaignId,
          step.day,
          step.channel,
          step.subject,
          step.content,
          step.order
        );
      }
    });

    insertSteps(sequenceSteps);

    console.log('✓ Created sample campaign with contacts and sequence');
  } else {
    console.log('✓ Sample campaign already exists');
  }

  console.log('\n✅ Database seeding completed!');
  console.log('\n📝 Login credentials:');
  console.log('   Username: admin');
  console.log('   Password: admin123\n');
}

// Run seed if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seed error:', error);
      process.exit(1);
    });
}

export default seedDatabase;
