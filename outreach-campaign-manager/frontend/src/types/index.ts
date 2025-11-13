export interface Campaign {
  id: number;
  user_id: number;
  name: string;
  industry: string;
  goal: string;
  start_date: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_at: string;
  contact_count?: number;
  step_count?: number;
  touchpoint_count?: number;
  open_count?: number;
  response_count?: number;
}

export interface Contact {
  id: number;
  campaign_id: number;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  company: string;
  title: string;
  status: 'active' | 'responded' | 'unsubscribed';
  notes?: string;
  tags?: string;
  created_at: string;
  touchpoint_count?: number;
  response_count?: number;
  campaign_name?: string;
}

export interface SequenceStep {
  id?: number;
  campaign_id: number;
  day_number: number;
  channel: 'email' | 'call' | 'voicemail' | 'whatsapp';
  subject?: string;
  content: string;
  order_index: number;
}

export interface Template {
  id: number;
  user_id: number;
  name: string;
  channel: 'email' | 'call' | 'voicemail' | 'whatsapp';
  subject?: string;
  content: string;
  category: string;
  created_at: string;
}

export interface Touchpoint {
  id: number;
  contact_id: number;
  sequence_step_id: number;
  sent_at: string;
  status: 'sent' | 'delivered' | 'opened' | 'responded' | 'failed';
  response?: string;
  contact_name?: string;
  email?: string;
  channel?: string;
  day_number?: number;
  subject?: string;
  content?: string;
}

export interface CampaignAnalytics {
  total_contacts: number;
  total_touchpoints: number;
  opens: number;
  responses: number;
  failures: number;
  channelBreakdown: {
    channel: string;
    count: number;
    opens: number;
    responses: number;
  }[];
}
