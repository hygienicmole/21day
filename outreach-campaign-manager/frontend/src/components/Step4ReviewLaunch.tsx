import React, { useState } from 'react';
import { ChevronLeft, Check, Users, Calendar, Zap } from 'lucide-react';
import { Contact, SequenceStep } from '../types';
import { format } from 'date-fns';

interface CampaignData {
  name: string;
  industry: string;
  goal: string;
  start_date: string;
}

interface Props {
  campaignData: CampaignData;
  contacts: Contact[];
  sequenceSteps: SequenceStep[];
  onLaunch: (launchNow: boolean) => void;
  onBack: () => void;
  loading: boolean;
}

export default function Step4ReviewLaunch({
  campaignData,
  contacts,
  sequenceSteps,
  onLaunch,
  onBack,
  loading,
}: Props) {
  const [launchNow, setLaunchNow] = useState(false);

  // Group steps by day
  const stepsByDay = sequenceSteps.reduce((acc, step) => {
    if (!acc[step.day_number]) {
      acc[step.day_number] = [];
    }
    acc[step.day_number].push(step);
    return acc;
  }, {} as { [key: number]: SequenceStep[] });

  const totalTouchpoints = sequenceSteps.length * contacts.length;
  const channelCounts = sequenceSteps.reduce((acc, step) => {
    acc[step.channel] = (acc[step.channel] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Launch</h2>
      <p className="text-gray-600 mb-6">Review your campaign settings before launching</p>

      <div className="space-y-6">
        {/* Campaign Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Campaign Name</div>
              <div className="font-medium text-gray-900">{campaignData.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Start Date</div>
              <div className="font-medium text-gray-900">
                {format(new Date(campaignData.start_date), 'MMM dd, yyyy')}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Industry</div>
              <div className="font-medium text-gray-900">
                {campaignData.industry || 'Not specified'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Goal</div>
              <div className="font-medium text-gray-900">
                {campaignData.goal || 'Not specified'}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-primary-600" size={24} />
              <div className="text-sm text-primary-700">Total Contacts</div>
            </div>
            <div className="text-3xl font-bold text-primary-900">{contacts.length}</div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-blue-600" size={24} />
              <div className="text-sm text-blue-700">Sequence Steps</div>
            </div>
            <div className="text-3xl font-bold text-blue-900">{sequenceSteps.length}</div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="text-green-600" size={24} />
              <div className="text-sm text-green-700">Total Touchpoints</div>
            </div>
            <div className="text-3xl font-bold text-green-900">{totalTouchpoints}</div>
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Breakdown</h3>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(channelCounts).map(([channel, count]) => (
              <div key={channel} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 capitalize mb-1">{channel}</div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-500">
                  {((count / sequenceSteps.length) * 100).toFixed(0)}% of sequence
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sequence Preview */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sequence Overview</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {Object.keys(stepsByDay)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map((day) => (
                <div key={day} className="bg-white rounded p-3 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 text-primary-700 font-semibold px-3 py-1 rounded text-sm">
                      Day {day}
                    </div>
                    <div className="flex gap-2">
                      {stepsByDay[parseInt(day)].map((step, idx) => (
                        <div
                          key={idx}
                          className="px-2 py-1 bg-gray-100 rounded text-xs capitalize"
                        >
                          {step.channel}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Sample Contacts */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sample Contacts ({contacts.length} total)
          </h3>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.slice(0, 5).map((contact) => (
                  <tr key={contact.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{contact.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{contact.company}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{contact.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {contacts.length > 5 && (
              <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500 text-center">
                and {contacts.length - 5} more contacts...
              </div>
            )}
          </div>
        </div>

        {/* Launch Options */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Launch Options</h3>
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                checked={!launchNow}
                onChange={() => setLaunchNow(false)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900">Save as Draft</div>
                <div className="text-sm text-gray-600">
                  Save the campaign and launch it manually later
                </div>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                checked={launchNow}
                onChange={() => setLaunchNow(true)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900">Launch Now (Simulation Mode)</div>
                <div className="text-sm text-gray-600">
                  Activate the campaign immediately and start the simulation
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is a simulation mode. No actual emails or messages will be sent.
            The system will simulate campaign execution to demonstrate functionality.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t mt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft size={20} />
          Back
        </button>
        <button
          onClick={() => onLaunch(launchNow)}
          disabled={loading}
          className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
        >
          <Check size={20} />
          {launchNow ? 'Launch Campaign' : 'Save Campaign'}
        </button>
      </div>
    </div>
  );
}
