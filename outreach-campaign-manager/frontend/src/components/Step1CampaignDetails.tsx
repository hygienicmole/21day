import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface CampaignData {
  name: string;
  industry: string;
  goal: string;
  start_date: string;
}

interface Props {
  initialData: CampaignData;
  onComplete: (data: CampaignData) => void;
  loading: boolean;
}

const INDUSTRY_OPTIONS = [
  'SaaS/Technology',
  'E-commerce',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Real Estate',
  'Consulting',
  'Marketing/Advertising',
  'Other',
];

const GOAL_OPTIONS = [
  'Q4 Logistics',
  'General Outreach',
  'Lead Generation',
  'Partnership Opportunities',
  'Customer Retention',
  'Product Launch',
  'Event Promotion',
  'Content Distribution',
];

export default function Step1CampaignDetails({ initialData, onComplete, loading }: Props) {
  const [formData, setFormData] = useState<CampaignData>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  const handleChange = (field: keyof CampaignData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Campaign Details</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Q4 2024 Enterprise Outreach"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Industry/Vertical
          </label>
          <select
            value={formData.industry}
            onChange={(e) => handleChange('industry', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select an industry...</option>
            {INDUSTRY_OPTIONS.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Goal/Angle
          </label>
          <select
            value={formData.goal}
            onChange={(e) => handleChange('goal', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a goal...</option>
            {GOAL_OPTIONS.map((goal) => (
              <option key={goal} value={goal}>
                {goal}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date (Day 0) *
          </label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        <div className="flex justify-end pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            Next: Import Contacts
            <ChevronRight size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
