import React, { useEffect, useState } from 'react';
import { integrationsAPI } from '../utils/api';
import { Save, Phone, MessageSquare, TestTube, CheckCircle, XCircle } from 'lucide-react';

interface Integration {
  id?: number;
  service: string;
  agent_id?: string;
  phone_number?: string;
  is_active: boolean;
}

export default function Settings() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});

  const [formData, setFormData] = useState({
    elevenlabs: {
      api_key: '',
      agent_id: '',
      is_active: true
    },
    twilio: {
      api_key: '',
      api_secret: '',
      phone_number: '',
      is_active: true
    },
    whatsapp: {
      api_key: '',
      api_secret: '',
      phone_number: '',
      is_active: true
    }
  });

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const response = await integrationsAPI.getAll();
      setIntegrations(response.data);

      // Populate form with existing data
      response.data.forEach((integration: any) => {
        if (integration.service === 'elevenlabs') {
          setFormData(prev => ({
            ...prev,
            elevenlabs: {
              api_key: '',
              agent_id: integration.agent_id || '',
              is_active: integration.is_active
            }
          }));
        } else if (integration.service === 'twilio') {
          setFormData(prev => ({
            ...prev,
            twilio: {
              api_key: '',
              api_secret: '',
              phone_number: integration.phone_number || '',
              is_active: integration.is_active
            }
          }));
        } else if (integration.service === 'whatsapp') {
          setFormData(prev => ({
            ...prev,
            whatsapp: {
              api_key: '',
              api_secret: '',
              phone_number: integration.phone_number || '',
              is_active: integration.is_active
            }
          }));
        }
      });
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (service: string) => {
    try {
      setSaving(service);
      const data = formData[service as keyof typeof formData];

      await integrationsAPI.save({
        service,
        ...data
      });

      alert(`${service.charAt(0).toUpperCase() + service.slice(1)} integration saved successfully!`);
      loadIntegrations();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save integration');
    } finally {
      setSaving(null);
    }
  };

  const handleTest = async (service: string) => {
    const testNumber = prompt('Enter a phone number to test (with country code, e.g., +1234567890):');
    if (!testNumber) return;

    try {
      setTesting(service);
      const response = await integrationsAPI.test(service, {
        testNumber,
        testMessage: 'This is a test message from Outreach Manager'
      });

      setTestResults(prev => ({
        ...prev,
        [service]: response.data.result
      }));

      if (response.data.result.success) {
        alert('Test successful! Check your phone/device.');
      } else {
        alert(`Test failed: ${response.data.result.error}`);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Test failed');
      setTestResults(prev => ({
        ...prev,
        [service]: { success: false, error: error.message }
      }));
    } finally {
      setTesting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integrations Settings</h1>
        <p className="text-gray-600 mt-1">Configure your communication channels</p>
      </div>

      {/* ElevenLabs Integration */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Phone className="text-primary-600" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">ElevenLabs (Voice Calls)</h2>
              <p className="text-sm text-gray-600">AI-powered phone calls with your agent</p>
            </div>
          </div>
          {testResults.elevenlabs && (
            <div className="flex items-center gap-2">
              {testResults.elevenlabs.success ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : (
                <XCircle className="text-red-500" size={20} />
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key *
            </label>
            <input
              type="password"
              value={formData.elevenlabs.api_key}
              onChange={(e) => setFormData({
                ...formData,
                elevenlabs: { ...formData.elevenlabs, api_key: e.target.value }
              })}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agent ID *
            </label>
            <input
              type="text"
              value={formData.elevenlabs.agent_id}
              onChange={(e) => setFormData({
                ...formData,
                elevenlabs: { ...formData.elevenlabs, agent_id: e.target.value }
              })}
              placeholder="Your ElevenLabs agent ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Find this in your ElevenLabs dashboard under Conversational AI
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="elevenlabs-active"
              checked={formData.elevenlabs.is_active}
              onChange={(e) => setFormData({
                ...formData,
                elevenlabs: { ...formData.elevenlabs, is_active: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <label htmlFor="elevenlabs-active" className="text-sm text-gray-700">
              Enable ElevenLabs integration
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => handleSave('elevenlabs')}
              disabled={saving === 'elevenlabs'}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <Save size={18} />
              {saving === 'elevenlabs' ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => handleTest('elevenlabs')}
              disabled={testing === 'elevenlabs' || !formData.elevenlabs.api_key}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <TestTube size={18} />
              {testing === 'elevenlabs' ? 'Testing...' : 'Test'}
            </button>
          </div>
        </div>
      </div>

      {/* Twilio SMS Integration */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-blue-600" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Twilio (SMS)</h2>
              <p className="text-sm text-gray-600">Send SMS messages via Twilio</p>
            </div>
          </div>
          {testResults.twilio && (
            <div className="flex items-center gap-2">
              {testResults.twilio.success ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : (
                <XCircle className="text-red-500" size={20} />
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account SID *
            </label>
            <input
              type="text"
              value={formData.twilio.api_key}
              onChange={(e) => setFormData({
                ...formData,
                twilio: { ...formData.twilio, api_key: e.target.value }
              })}
              placeholder="AC..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auth Token *
            </label>
            <input
              type="password"
              value={formData.twilio.api_secret}
              onChange={(e) => setFormData({
                ...formData,
                twilio: { ...formData.twilio, api_secret: e.target.value }
              })}
              placeholder="Your auth token"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twilio Phone Number *
            </label>
            <input
              type="tel"
              value={formData.twilio.phone_number}
              onChange={(e) => setFormData({
                ...formData,
                twilio: { ...formData.twilio, phone_number: e.target.value }
              })}
              placeholder="+1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="twilio-active"
              checked={formData.twilio.is_active}
              onChange={(e) => setFormData({
                ...formData,
                twilio: { ...formData.twilio, is_active: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <label htmlFor="twilio-active" className="text-sm text-gray-700">
              Enable Twilio SMS integration
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => handleSave('twilio')}
              disabled={saving === 'twilio'}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <Save size={18} />
              {saving === 'twilio' ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => handleTest('twilio')}
              disabled={testing === 'twilio' || !formData.twilio.api_key}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <TestTube size={18} />
              {testing === 'twilio' ? 'Testing...' : 'Test SMS'}
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Integration */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-green-600" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">WhatsApp</h2>
              <p className="text-sm text-gray-600">Send WhatsApp messages via Twilio</p>
            </div>
          </div>
          {testResults.whatsapp && (
            <div className="flex items-center gap-2">
              {testResults.whatsapp.success ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : (
                <XCircle className="text-red-500" size={20} />
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twilio Account SID *
            </label>
            <input
              type="text"
              value={formData.whatsapp.api_key}
              onChange={(e) => setFormData({
                ...formData,
                whatsapp: { ...formData.whatsapp, api_key: e.target.value }
              })}
              placeholder="AC..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auth Token *
            </label>
            <input
              type="password"
              value={formData.whatsapp.api_secret}
              onChange={(e) => setFormData({
                ...formData,
                whatsapp: { ...formData.whatsapp, api_secret: e.target.value }
              })}
              placeholder="Your auth token"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Phone Number *
            </label>
            <input
              type="tel"
              value={formData.whatsapp.phone_number}
              onChange={(e) => setFormData({
                ...formData,
                whatsapp: { ...formData.whatsapp, phone_number: e.target.value }
              })}
              placeholder="+1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be a Twilio WhatsApp-enabled number
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="whatsapp-active"
              checked={formData.whatsapp.is_active}
              onChange={(e) => setFormData({
                ...formData,
                whatsapp: { ...formData.whatsapp, is_active: e.target.checked }
              })}
              className="rounded border-gray-300"
            />
            <label htmlFor="whatsapp-active" className="text-sm text-gray-700">
              Enable WhatsApp integration
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => handleSave('whatsapp')}
              disabled={saving === 'whatsapp'}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <Save size={18} />
              {saving === 'whatsapp' ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => handleTest('whatsapp')}
              disabled={testing === 'whatsapp' || !formData.whatsapp.api_key}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <TestTube size={18} />
              {testing === 'whatsapp' ? 'Testing...' : 'Test WhatsApp'}
            </button>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Security Note</h3>
        <p className="text-sm text-blue-800">
          Your API keys are encrypted and stored securely. They are never exposed in the frontend
          and are only used server-side to make API calls on your behalf.
        </p>
      </div>
    </div>
  );
}
