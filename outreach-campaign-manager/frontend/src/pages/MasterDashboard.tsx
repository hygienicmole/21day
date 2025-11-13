import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../utils/api';
import {
  Activity,
  Users,
  Send,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MessageSquare,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  overall: {
    total_campaigns: number;
    active_campaigns: number;
    total_contacts: number;
    total_touchpoints: number;
    sent_touchpoints: number;
    failed_touchpoints: number;
    total_templates: number;
  };
  channelStats: Array<{
    channel: string;
    total_sent: number;
    successful: number;
    failed: number;
  }>;
  recentActivity: Array<any>;
  campaignPerformance: Array<any>;
  dailyActivity: Array<any>;
  integrations: Array<{
    service: string;
    is_active: boolean;
  }>;
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

export default function MasterDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail size={16} />;
      case 'call':
      case 'voicemail':
        return <Phone size={16} />;
      case 'whatsapp':
        return <MessageSquare size={16} />;
      default:
        return <Send size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateSuccessRate = () => {
    if (!stats || stats.overall.total_touchpoints === 0) return 0;
    return Math.round(
      (stats.overall.sent_touchpoints / stats.overall.total_touchpoints) * 100
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Dashboard</h1>
          <p className="text-gray-600 mt-1">Complete overview of all your outreach activities</p>
        </div>
        <button
          onClick={loadStats}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
        >
          <Activity size={20} />
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users size={24} />
            <span className="text-blue-100 text-sm">Total</span>
          </div>
          <div className="text-3xl font-bold">{stats.overall.total_contacts}</div>
          <div className="text-blue-100 text-sm mt-1">Contacts</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Send size={24} />
            <span className="text-green-100 text-sm">Sent</span>
          </div>
          <div className="text-3xl font-bold">{stats.overall.sent_touchpoints}</div>
          <div className="text-green-100 text-sm mt-1">Touchpoints</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Activity size={24} />
            <span className="text-purple-100 text-sm">Active</span>
          </div>
          <div className="text-3xl font-bold">{stats.overall.active_campaigns}</div>
          <div className="text-purple-100 text-sm mt-1">Campaigns</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={24} />
            <span className="text-orange-100 text-sm">Success</span>
          </div>
          <div className="text-3xl font-bold">{calculateSuccessRate()}%</div>
          <div className="text-orange-100 text-sm mt-1">Success Rate</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.channelStats}
                  dataKey="total_sent"
                  nameKey="channel"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => entry.channel}
                >
                  {stats.channelStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="touchpoints" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Touchpoints
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.campaignPerformance.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {campaign.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.contact_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.touchpoint_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.touchpoint_count > 0
                      ? Math.round((campaign.sent_count / campaign.touchpoint_count) * 100)
                      : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {stats.recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg">
                  {getChannelIcon(activity.channel)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{activity.contact_name}</div>
                  <div className="text-sm text-gray-600">
                    {activity.company} • {activity.campaign_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Day {activity.day_number} • {activity.channel}
                    {activity.error_message && (
                      <span className="text-red-600 ml-2">• {activity.error_message}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(activity.sent_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
          {stats.recentActivity.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['elevenlabs', 'twilio', 'whatsapp'].map((service) => {
            const integration = stats.integrations.find(i => i.service === service);
            const isActive = integration?.is_active;

            return (
              <div key={service} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  {service === 'elevenlabs' && <Phone size={20} className="text-primary-600" />}
                  {service === 'twilio' && <MessageSquare size={20} className="text-blue-600" />}
                  {service === 'whatsapp' && <MessageSquare size={20} className="text-green-600" />}
                  <span className="font-medium capitalize">{service}</span>
                </div>
                {isActive ? (
                  <CheckCircle className="text-green-500" size={20} />
                ) : (
                  <XCircle className="text-gray-400" size={20} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
