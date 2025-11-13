import twilio from 'twilio';

export class TwilioService {
  constructor(accountSid, authToken, phoneNumber) {
    this.client = twilio(accountSid, authToken);
    this.phoneNumber = phoneNumber;
  }

  /**
   * Send SMS message
   * @param {string} to - Recipient phone number
   * @param {string} message - Message content
   * @returns {Promise<Object>} Message details
   */
  async sendSMS(to, message) {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: to
      });

      return {
        success: true,
        messageSid: result.sid,
        status: result.status,
        dateCreated: result.dateCreated,
        data: result
      };
    } catch (error) {
      console.error('Twilio SMS error:', error.message);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Send WhatsApp message
   * @param {string} to - Recipient phone number (must be WhatsApp enabled)
   * @param {string} message - Message content
   * @returns {Promise<Object>} Message details
   */
  async sendWhatsApp(to, message) {
    try {
      // Format phone numbers for WhatsApp
      const fromWhatsApp = `whatsapp:${this.phoneNumber}`;
      const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

      const result = await this.client.messages.create({
        body: message,
        from: fromWhatsApp,
        to: toWhatsApp
      });

      return {
        success: true,
        messageSid: result.sid,
        status: result.status,
        dateCreated: result.dateCreated,
        data: result
      };
    } catch (error) {
      console.error('Twilio WhatsApp error:', error.message);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Get message status
   * @param {string} messageSid - Message SID from sendSMS/sendWhatsApp
   * @returns {Promise<Object>} Message status
   */
  async getMessageStatus(messageSid) {
    try {
      const message = await this.client.messages(messageSid).fetch();

      return {
        success: true,
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        data: message
      };
    } catch (error) {
      console.error('Twilio get message status error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Make a phone call (for voicemail drop)
   * @param {string} to - Recipient phone number
   * @param {string} twimlUrl - URL to TwiML instructions
   * @returns {Promise<Object>} Call details
   */
  async makeCall(to, twimlUrl) {
    try {
      const call = await this.client.calls.create({
        url: twimlUrl,
        to: to,
        from: this.phoneNumber
      });

      return {
        success: true,
        callSid: call.sid,
        status: call.status,
        data: call
      };
    } catch (error) {
      console.error('Twilio call error:', error.message);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Create TwiML for voicemail
   * @param {string} message - Voicemail message
   * @param {string} voiceUrl - Optional: URL to MP3 recording
   * @returns {string} TwiML XML
   */
  generateVoicemailTwiML(message, voiceUrl = null) {
    if (voiceUrl) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${voiceUrl}</Play>
</Response>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${message}</Say>
</Response>`;
  }
}

export default TwilioService;
