import axios from 'axios';

export class ElevenLabsService {
  constructor(apiKey, agentId) {
    this.apiKey = apiKey;
    this.agentId = agentId;
    this.baseURL = 'https://api.elevenlabs.io/v1';
  }

  /**
   * Initiate a phone call using ElevenLabs Conversational AI
   * @param {string} phoneNumber - The phone number to call
   * @param {string} firstName - Contact's first name for personalization
   * @param {Object} customData - Additional data to pass to the agent
   * @returns {Promise<Object>} Call details
   */
  async makeCall(phoneNumber, firstName, customData = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/convai/conversation`,
        {
          agent_id: this.agentId,
          // Format phone number (remove any formatting)
          phone_number: phoneNumber.replace(/\D/g, ''),
          // Pass custom variables to the agent
          custom_llm_extra_body: {
            firstName: firstName,
            ...customData
          }
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        conversationId: response.data.conversation_id,
        status: response.data.status,
        data: response.data
      };
    } catch (error) {
      console.error('ElevenLabs call error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  }

  /**
   * Get conversation details and transcript
   * @param {string} conversationId - The conversation ID from makeCall
   * @returns {Promise<Object>} Conversation details
   */
  async getConversation(conversationId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/convai/conversation/${conversationId}`,
        {
          headers: {
            'xi-api-key': this.apiKey
          }
        }
      );

      return {
        success: true,
        conversation: response.data
      };
    } catch (error) {
      console.error('ElevenLabs get conversation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  }

  /**
   * Get signed URL for audio playback
   * @param {string} conversationId - The conversation ID
   * @returns {Promise<Object>} Audio URL
   */
  async getConversationAudio(conversationId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/convai/conversation/${conversationId}/audio`,
        {
          headers: {
            'xi-api-key': this.apiKey
          }
        }
      );

      return {
        success: true,
        audioUrl: response.data.audio_url
      };
    } catch (error) {
      console.error('ElevenLabs get audio error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  }
}

export default ElevenLabsService;
