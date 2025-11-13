import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignsAPI, contactsAPI, sequencesAPI } from '../utils/api';
import { Contact, SequenceStep } from '../types';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Step1CampaignDetails from '../components/Step1CampaignDetails';
import Step2ContactImport from '../components/Step2ContactImport';
import Step3SequenceBuilder from '../components/Step3SequenceBuilder';
import Step4ReviewLaunch from '../components/Step4ReviewLaunch';

interface CampaignData {
  name: string;
  industry: string;
  goal: string;
  start_date: string;
}

export default function CampaignBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    industry: '',
    goal: '',
    start_date: new Date().toISOString().split('T')[0],
  });
  const [campaignId, setCampaignId] = useState<number | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [sequenceSteps, setSequenceSteps] = useState<SequenceStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const steps = [
    { number: 1, title: 'Campaign Details', description: 'Basic information' },
    { number: 2, title: 'Import Contacts', description: 'Add your audience' },
    { number: 3, title: 'Build Sequence', description: 'Create touchpoints' },
    { number: 4, title: 'Review & Launch', description: 'Finalize campaign' },
  ];

  const handleStep1Complete = async (data: CampaignData) => {
    try {
      setLoading(true);
      setError('');

      // Create campaign
      const response = await campaignsAPI.create({
        ...data,
        status: 'draft',
      });

      setCampaignId(response.data.id);
      setCampaignData(data);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Complete = (importedContacts: Contact[]) => {
    setContacts(importedContacts);
    setCurrentStep(3);
  };

  const handleStep3Complete = (steps: SequenceStep[]) => {
    setSequenceSteps(steps);
    setCurrentStep(4);
  };

  const handleLaunch = async (launchNow: boolean) => {
    try {
      setLoading(true);
      setError('');

      if (!campaignId) throw new Error('Campaign ID not found');

      // Update campaign status
      await campaignsAPI.update(campaignId, {
        status: launchNow ? 'active' : 'draft',
      });

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to launch campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Campaign</h1>
        <p className="text-gray-600">Follow the steps to set up your outreach campaign</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : currentStep === step.number
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.number ? <Check size={20} /> : step.number}
                </div>
                <div className="mt-2 text-center">
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  style={{ maxWidth: '100px', marginTop: '-40px' }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-6 min-h-[500px]">
        {currentStep === 1 && (
          <Step1CampaignDetails
            initialData={campaignData}
            onComplete={handleStep1Complete}
            loading={loading}
          />
        )}

        {currentStep === 2 && campaignId && (
          <Step2ContactImport
            campaignId={campaignId}
            onComplete={handleStep2Complete}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && campaignId && (
          <Step3SequenceBuilder
            campaignId={campaignId}
            onComplete={handleStep3Complete}
            onBack={handleBack}
          />
        )}

        {currentStep === 4 && campaignId && (
          <Step4ReviewLaunch
            campaignData={campaignData}
            contacts={contacts}
            sequenceSteps={sequenceSteps}
            onLaunch={handleLaunch}
            onBack={handleBack}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
