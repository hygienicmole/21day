# Integration Setup Guide

## 🎯 Overview

The Outreach Campaign Manager now supports real integrations for multi-channel outreach:

- **ElevenLabs**: AI-powered voice calls with conversational agents
- **Twilio**: SMS messaging
- **WhatsApp**: Business messaging via Twilio
- **Email**: Currently simulated (ready for SendGrid/AWS SES integration)

---

## 📋 Prerequisites

Before setting up integrations, you need:

1. ✅ **ElevenLabs Account** (for voice calls)
   - Website: https://elevenlabs.io
   - Pricing: Pay-as-you-go for calls
   - Need: API Key + Agent ID

2. ✅ **Twilio Account** (for SMS & WhatsApp)
   - Website: https://twilio.com
   - Free trial available
   - Need: Account SID, Auth Token, Phone Number

---

## 🔧 Setup Instructions

### 1. ElevenLabs Integration (Voice Calls)

#### Step 1: Get Your API Key

1. Go to https://elevenlabs.io
2. Sign up or log in
3. Go to **Settings** → **API Keys**
4. Click **Create API Key**
5. Copy your API key (starts with `sk-...`)

#### Step 2: Get Your Agent ID

1. In ElevenLabs dashboard, go to **Conversational AI**
2. Create a new agent or select an existing one
3. Configure your agent:
   - **Name**: e.g., "Outreach Assistant"
   - **Voice**: Choose a voice
   - **System Prompt**: Define how the agent should behave
   - **First Message**: What the agent says when the call connects
4. Copy the **Agent ID**

#### Step 3: Configure in Outreach Manager

1. In the app, go to **Settings** (sidebar)
2. Find **ElevenLabs (Voice Calls)** section
3. Enter:
   - **API Key**: Your ElevenLabs API key
   - **Agent ID**: Your agent ID
4. Check **Enable ElevenLabs integration**
5. Click **Save**
6. Click **Test** to verify (enter a phone number to test)

#### ElevenLabs Agent Configuration Tips

Your agent's system prompt might include:

```
You are a friendly sales assistant calling on behalf of [Your Company].
Your goal is to introduce our service and schedule a meeting.

Key talking points:
- Introduce yourself and company
- Ask if they have a minute to chat
- Briefly explain the value proposition
- Offer to schedule a demo/meeting
- Be professional but conversational

If they're not interested, politely thank them and end the call.
```

---

### 2. Twilio Integration (SMS)

#### Step 1: Create Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up (free trial includes $15 credit)
3. Verify your phone number

#### Step 2: Get Credentials

1. In Twilio Console, go to **Dashboard**
2. Find **Account Info** section
3. Copy:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click to reveal and copy)

#### Step 3: Get a Phone Number

1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Select country and capabilities (make sure SMS is enabled)
3. Buy the number (uses trial credit or billing)
4. Copy your phone number (format: +1234567890)

#### Step 4: Configure in Outreach Manager

1. In the app, go to **Settings**
2. Find **Twilio (SMS)** section
3. Enter:
   - **Account SID**: From Twilio dashboard
   - **Auth Token**: From Twilio dashboard
   - **Twilio Phone Number**: Your Twilio number with +
4. Check **Enable Twilio SMS integration**
5. Click **Save**
6. Click **Test SMS** to verify

---

### 3. WhatsApp Integration

WhatsApp messaging uses Twilio's WhatsApp Business API.

#### Step 1: Enable WhatsApp in Twilio

1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow the setup wizard
3. For testing: Join the Twilio Sandbox
   - Send the code to the Twilio WhatsApp number
   - This allows testing without full WhatsApp Business approval

#### Step 2: Get WhatsApp-Enabled Number

**Option A: Use Sandbox (for testing)**
- The sandbox number is: `whatsapp:+14155238886` (or similar)
- Free for testing
- Recipients must join sandbox first

**Option B: Production Setup**
- Request WhatsApp Business API access through Twilio
- Go through Facebook Business verification
- Get a dedicated WhatsApp Business number
- Takes 1-2 weeks for approval

#### Step 3: Configure in Outreach Manager

1. In the app, go to **Settings**
2. Find **WhatsApp** section
3. Enter same Twilio credentials:
   - **Account SID**
   - **Auth Token**
   - **WhatsApp Phone Number**:
     - Sandbox: Use the Twilio sandbox number
     - Production: Your approved WhatsApp number
4. Check **Enable WhatsApp integration**
5. Click **Save**
6. Click **Test WhatsApp** to verify

#### Important Notes for WhatsApp:
- Recipients must have opted in (via sandbox join or business approval)
- Message templates may be required for production
- 24-hour messaging window after user reply
- Follow WhatsApp Business Policy

---

## 🚀 Using the Integrations

### Creating a Campaign with Real Channels

1. **Create Campaign** (Dashboard → New Campaign)
2. **Import Contacts** with phone numbers and WhatsApp numbers
3. **Build Sequence**:
   - Add **Call** steps for ElevenLabs voice calls
   - Add **WhatsApp** steps for WhatsApp messages
   - Add **Email** steps (simulated for now)
   - Add **Voicemail** for voicemail drops
4. **Review & Launch**

### How Execution Works

When you launch a campaign:

1. **System checks** for active integrations in Settings
2. **For each touchpoint**:
   - **Call**: Uses ElevenLabs API to initiate call
   - **WhatsApp**: Uses Twilio WhatsApp API
   - **SMS**: Uses Twilio SMS API
   - **Email**: Currently logged (ready for SendGrid)
   - **Voicemail**: Uses Twilio with TwiML

3. **Results are tracked**:
   - Status: sent, failed, delivered
   - External IDs from providers
   - Error messages if failed
   - Call duration (for calls)

### Monitoring in Master Dashboard

Go to **Master Dashboard** to see:
- ✅ Total touchpoints sent
- ✅ Success/failure rates
- ✅ Channel breakdown
- ✅ Recent activity with status
- ✅ Integration status indicators
- ✅ Real-time updates (refreshes every 30 seconds)

---

## 💰 Pricing

### ElevenLabs
- Free tier: Limited credits
- Pay-as-you-go: ~$0.05-0.20 per minute of call time
- Check: https://elevenlabs.io/pricing

### Twilio
- Free trial: $15 credit
- SMS: ~$0.0075 per message (USA)
- WhatsApp: ~$0.005 per message
- Voice: ~$0.013 per minute
- Check: https://www.twilio.com/pricing

**Recommendation**: Start with trial credits to test everything!

---

## 🔒 Security

### API Key Storage
- API keys are stored **encrypted** in the database
- Never exposed in frontend code
- Only used server-side for API calls
- Never logged or displayed

### Best Practices
- ✅ Use environment variables in production
- ✅ Rotate API keys periodically
- ✅ Monitor usage in provider dashboards
- ✅ Set up billing alerts
- ✅ Revoke keys immediately if compromised

---

## 🧪 Testing

### Test Before Production

1. **Test ElevenLabs**:
   - Settings → ElevenLabs → Test
   - Enter your own phone number
   - Verify the call connects and agent works

2. **Test Twilio SMS**:
   - Settings → Twilio → Test SMS
   - Send to your phone
   - Verify message received

3. **Test WhatsApp**:
   - Join Twilio sandbox first
   - Settings → WhatsApp → Test WhatsApp
   - Verify message received

### Debugging Failed Touchpoints

If touchpoints fail:

1. **Check Settings**: Verify all credentials are correct
2. **Check Integration Status**: Master Dashboard shows active integrations
3. **Check Recent Activity**: Shows error messages
4. **Check Provider Dashboards**:
   - ElevenLabs: Check conversation logs
   - Twilio: Check message/call logs
5. **Check Contact Data**: Phone numbers must include country code (+1...)

---

## 📊 Monitoring Usage

### In the App
- **Master Dashboard**: Overall statistics
- **Campaign View**: Per-campaign metrics
- **Recent Activity**: Last 50 touchpoints with status

### In Provider Dashboards

**ElevenLabs**:
- Go to **Usage** tab
- See call minutes used
- Download conversation recordings

**Twilio**:
- Go to **Monitor** → **Logs**
- See all messages and calls
- Check error codes
- View usage reports

---

## 🎨 Customization

### Personalizing Messages

Use variables in your sequences:
- `{{Name}}` - Contact's name
- `{{Company}}` - Contact's company
- `{{Title}}` - Contact's title
- `{{Industry}}` - Campaign industry

Example:
```
Hi {{Name}}, I'm calling from [Your Company] regarding {{Company}}'s
outreach strategy. Do you have a moment to chat?
```

### Advanced ElevenLabs Setup

Pass custom data to your agent:
- First name is automatically extracted
- Additional context can be added in the `outreach.js` service
- Agent can reference this in conversations

---

## ❓ Troubleshooting

### "Integration not configured"
- Go to Settings and enter all credentials
- Make sure checkboxes are enabled
- Click Save

### "Test failed"
- Verify credentials are correct (no spaces, complete)
- Check account status in provider dashboard
- For Twilio trial: Verify recipient numbers first

### "No phone number"
- Contacts need phone numbers with country code
- Format: +1234567890 (no spaces, dashes, or parentheses)

### Calls not connecting
- Verify ElevenLabs Agent ID is correct
- Check agent is published/active
- Verify phone number format includes country code

### WhatsApp not working
- Verify recipient joined sandbox (for testing)
- Check WhatsApp number format: +1234567890
- In production, check message template approval

---

## 🚀 Production Deployment

When ready for production:

1. **Upgrade Accounts**:
   - ElevenLabs: Add billing info
   - Twilio: Add billing, remove trial restrictions

2. **WhatsApp Business**:
   - Complete Facebook Business verification
   - Get message templates approved
   - Move from sandbox to production number

3. **Set Limits**:
   - Configure rate limits in provider dashboards
   - Set daily/monthly spending caps
   - Enable usage alerts

4. **Compliance**:
   - ✅ Get consent before calling/messaging
   - ✅ Honor do-not-call lists
   - ✅ Include opt-out instructions
   - ✅ Follow TCPA, CAN-SPAM, WhatsApp policies

---

## 📞 Support

### Get Help
- **ElevenLabs**: support@elevenlabs.io
- **Twilio**: https://www.twilio.com/help/contact
- **App Issues**: Check console logs, database logs

### Community
- Twilio has extensive documentation and forums
- ElevenLabs has Discord community

---

## ✨ Next Steps

After setting up integrations:

1. ✅ **Create test campaign** with 1-2 contacts
2. ✅ **Test each channel** individually
3. ✅ **Monitor Master Dashboard** for results
4. ✅ **Scale gradually** as you verify everything works
5. ✅ **Track ROI** using the analytics

Happy outreaching! 🎉
