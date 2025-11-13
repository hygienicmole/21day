import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignsAPI } from '../utils/api';
import { Campaign } from '../types';
import {
  Plus,
  BarChart3,
  Mail,
  Phone,
  MessageCircle,
  Users,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignsAPI.getAll();
      setCampaigns(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (campaign: Campaign) => {
    try {
      const newStatus = campaign.status === 'active' ? 'paused' : 'active';
      await campaignsAPI.update(campaign.id, { status: newStatus });
      loadCampaigns();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update campaign');
    }
  };

  const handleDelete = async (campaign: Campaign) => {
    if (!confirm(`Are you sure you want to delete "${campaign.name}"?`)) return;

    try {
      await campaignsAPI.delete(campaign.id);
      loadCampaigns();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete campaign');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateOpenRate = (campaign: Campaign) => {
    if (!campaign.touchpoint_count || campaign.touchpoint_count === 0) return 0;
    return Math.round(((campaign.open_count || 0) / campaign.touchpoint_count) * 100);
  };

  const calculateResponseRate = (campaign: Campaign) => {
    if (!campaign.touchpoint_count || campaign.touchpoint_count === 0) return 0;
    return Math.round(((campaign.response_count || 0) / campaign.touchpoint_count) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-1">Manage your outreach campaigns</p>
        </div>
        <button
          onClick={() => navigate('/campaigns/new')}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus size={20} />
          New Campaign
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first outreach campaign</p>
          <button
            onClick={() => navigate('/campaigns/new')}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            <Plus size={20} />
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{campaign.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">
                      <span className="font-medium">Industry:</span> {campaign.industry || 'Not specified'}
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Goal:</span> {campaign.goal || 'Not specified'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                      title="View details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleStatusToggle(campaign)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded"
                      title={campaign.status === 'active' ? 'Pause' : 'Resume'}
                    >
                      {campaign.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button
                      onClick={() => handleDelete(campaign)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Users size={16} />
                      <span className="text-sm">Contacts</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {campaign.contact_count || 0}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <BarChart3 size={16} />
                      <span className="text-sm">Touchpoints</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {campaign.touchpoint_count || 0}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Mail size={16} />
                      <span className="text-sm">Steps</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {campaign.step_count || 0}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 mb-1 text-sm">Open Rate</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {calculateOpenRate(campaign)}%
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 mb-1 text-sm">Response Rate</div>
                    <div className="text-2xl font-bold text-green-600">
                      {calculateResponseRate(campaign)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
