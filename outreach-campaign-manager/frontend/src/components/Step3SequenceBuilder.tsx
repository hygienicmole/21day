import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit2, Copy } from 'lucide-react';
import { sequencesAPI, templatesAPI } from '../utils/api';
import { SequenceStep, Template } from '../types';

interface Props {
  campaignId: number;
  onComplete: (steps: SequenceStep[]) => void;
  onBack: () => void;
}

interface DayStep extends Omit<SequenceStep, 'id'> {
  tempId: string;
}

const CHANNELS = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'call', label: 'Call', icon: '📞' },
  { value: 'voicemail', label: 'Voicemail', icon: '🎙️' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
];

export default function Step3SequenceBuilder({ campaignId, onComplete, onBack }: Props) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [daySteps, setDaySteps] = useState<{ [key: number]: DayStep[] }>({});
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingStep, setEditingStep] = useState<DayStep | null>(null);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTemplates();
    loadExistingSequence();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await templatesAPI.getAll();
      setTemplates(response.data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const loadExistingSequence = async () => {
    try {
      const response = await sequencesAPI.getByCampaign(campaignId);
      const steps = response.data;

      // Group steps by day
      const grouped: { [key: number]: DayStep[] } = {};
      steps.forEach((step: SequenceStep) => {
        if (!grouped[step.day_number]) {
          grouped[step.day_number] = [];
        }
        grouped[step.day_number].push({
          ...step,
          tempId: `${step.day_number}-${step.channel}-${Math.random()}`,
        });
      });

      setDaySteps(grouped);
    } catch (err) {
      console.error('Failed to load sequence:', err);
    }
  };

  const addStepToDay = (day: number, channel: string) => {
    const newStep: DayStep = {
      campaign_id: campaignId,
      day_number: day,
      channel: channel as any,
      subject: channel === 'email' ? '' : undefined,
      content: '',
      order_index: daySteps[day]?.length || 0,
      tempId: `${day}-${channel}-${Date.now()}`,
    };

    setDaySteps({
      ...daySteps,
      [day]: [...(daySteps[day] || []), newStep],
    });

    setEditingStep(newStep);
  };

  const removeStep = (day: number, tempId: string) => {
    setDaySteps({
      ...daySteps,
      [day]: daySteps[day].filter((s) => s.tempId !== tempId),
    });
  };

  const updateStep = (updatedStep: DayStep) => {
    const day = updatedStep.day_number;
    setDaySteps({
      ...daySteps,
      [day]: daySteps[day].map((s) => (s.tempId === updatedStep.tempId ? updatedStep : s)),
    });
    setEditingStep(null);
  };

  const applyTemplate = (template: Template, step: DayStep) => {
    const updatedStep = {
      ...step,
      subject: template.subject || step.subject,
      content: template.content,
    };
    updateStep(updatedStep);
    setShowTemplateLibrary(false);
  };

  const handleSaveSequence = async () => {
    try {
      setLoading(true);
      setError('');

      // Flatten all day steps into a single array
      const allSteps: any[] = [];
      Object.keys(daySteps).forEach((day) => {
        daySteps[parseInt(day)].forEach((step, index) => {
          allSteps.push({
            campaign_id: campaignId,
            day_number: step.day_number,
            channel: step.channel,
            subject: step.subject || '',
            content: step.content,
            order_index: index,
          });
        });
      });

      if (allSteps.length === 0) {
        setError('Please add at least one touchpoint before proceeding');
        return;
      }

      // Save to backend
      await sequencesAPI.bulkCreate(campaignId, allSteps);

      onComplete(allSteps);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save sequence');
    } finally {
      setLoading(false);
    }
  };

  const replaceVariables = (text: string) => {
    return text
      .replace(/\{\{Name\}\}/g, '<span class="bg-yellow-100 px-1 rounded">{{Name}}</span>')
      .replace(/\{\{Company\}\}/g, '<span class="bg-yellow-100 px-1 rounded">{{Company}}</span>')
      .replace(/\{\{Title\}\}/g, '<span class="bg-yellow-100 px-1 rounded">{{Title}}</span>')
      .replace(/\{\{Industry\}\}/g, '<span class="bg-yellow-100 px-1 rounded">{{Industry}}</span>');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Build Sequence</h2>
      <p className="text-gray-600 mb-6">Create your 21-day outreach sequence</p>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        {/* Day Timeline */}
        <div className="col-span-1">
          <div className="bg-gray-50 rounded-lg p-4 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-3">Days (0-21)</h3>
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {Array.from({ length: 22 }, (_, i) => i).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`w-full text-left px-3 py-2 rounded ${
                    selectedDay === day
                      ? 'bg-primary-600 text-white'
                      : 'hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Day {day}
                  {daySteps[day] && daySteps[day].length > 0 && (
                    <span className="ml-2 text-xs">
                      ({daySteps[day].length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Day Content */}
        <div className="col-span-3">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Day {selectedDay} Touchpoints
              </h3>
              <div className="flex gap-2">
                {CHANNELS.map((channel) => (
                  <button
                    key={channel.value}
                    onClick={() => addStepToDay(selectedDay, channel.value)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                    title={`Add ${channel.label}`}
                  >
                    <span>{channel.icon}</span>
                    <Plus size={14} />
                  </button>
                ))}
              </div>
            </div>

            {/* Step List */}
            <div className="space-y-3">
              {(!daySteps[selectedDay] || daySteps[selectedDay].length === 0) ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No touchpoints for this day</p>
                  <p className="text-sm mt-2">Click a channel button above to add one</p>
                </div>
              ) : (
                daySteps[selectedDay].map((step) => (
                  <div
                    key={step.tempId}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {CHANNELS.find((c) => c.value === step.channel)?.icon}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900">
                            {CHANNELS.find((c) => c.value === step.channel)?.label}
                          </div>
                          {step.subject && (
                            <div className="text-sm text-gray-600">
                              Subject: {step.subject}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingStep(step)}
                          className="p-1 text-gray-600 hover:text-primary-600"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => removeStep(selectedDay, step.tempId)}
                          className="p-1 text-gray-600 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded line-clamp-3">
                      {step.content || <em className="text-gray-400">No content yet</em>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Edit {CHANNELS.find((c) => c.value === editingStep.channel)?.label} Touchpoint
            </h3>

            {editingStep.channel === 'email' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={editingStep.subject || ''}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, subject: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter email subject..."
                />
              </div>
            )}

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <button
                  onClick={() => setShowTemplateLibrary(!showTemplateLibrary)}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Copy size={14} />
                  Use Template
                </button>
              </div>

              {showTemplateLibrary && (
                <div className="mb-3 border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <div className="text-sm font-medium text-gray-700 mb-2">Templates:</div>
                  <div className="space-y-2">
                    {templates
                      .filter((t) => t.channel === editingStep.channel)
                      .map((template) => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template, editingStep)}
                          className="block w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm"
                        >
                          {template.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <textarea
                value={editingStep.content}
                onChange={(e) =>
                  setEditingStep({ ...editingStep, content: e.target.value })
                }
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                placeholder="Enter message content... Use {{Name}}, {{Company}}, {{Title}} for personalization"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available variables: {'{{Name}}'}, {'{{Company}}'}, {'{{Title}}'}, {'{{Industry}}'}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditingStep(null);
                  setShowTemplateLibrary(false);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStep(editingStep)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

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
          onClick={handleSaveSequence}
          disabled={loading}
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          Next: Review & Launch
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
