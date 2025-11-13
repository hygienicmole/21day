import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Upload, Plus, Trash2 } from 'lucide-react';
import { contactsAPI } from '../utils/api';
import { Contact } from '../types';

interface Props {
  campaignId: number;
  onComplete: (contacts: Contact[]) => void;
  onBack: () => void;
}

export default function Step2ContactImport({ campaignId, onComplete, onBack }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualContact, setManualContact] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setError('');

      const response = await contactsAPI.import(campaignId, file);

      // Fetch updated contacts
      const contactsResponse = await contactsAPI.getByCampaign(campaignId);
      setContacts(contactsResponse.data);

      if (response.data.errors?.length > 0) {
        setError(`Imported ${response.data.count} contacts with some warnings`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to import contacts');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError('');
      const response = await contactsAPI.create({
        campaign_id: campaignId,
        ...manualContact,
        whatsapp: manualContact.phone, // Use phone as WhatsApp by default
      });

      setContacts([...contacts, response.data]);
      setManualContact({
        name: '',
        email: '',
        phone: '',
        company: '',
        title: '',
      });
      setShowManualForm(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add contact');
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    try {
      await contactsAPI.delete(contactId);
      setContacts(contacts.filter((c) => c.id !== contactId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete contact');
    }
  };

  const handleNext = () => {
    if (contacts.length === 0) {
      setError('Please add at least one contact before proceeding');
      return;
    }
    onComplete(contacts);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Contacts</h2>
      <p className="text-gray-600 mb-6">Upload a CSV file or add contacts manually</p>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* CSV Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  {importing ? 'Importing...' : 'Upload CSV File'}
                </span>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={importing}
                />
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              CSV should include: Name, Email, Phone, Company, Title
            </p>
          </div>
        </div>

        {/* Manual Add */}
        <div>
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <Plus size={20} />
            Add Contact Manually
          </button>

          {showManualForm && (
            <form onSubmit={handleManualAdd} className="mt-4 p-4 border border-gray-200 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={manualContact.name}
                    onChange={(e) => setManualContact({ ...manualContact, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={manualContact.email}
                    onChange={(e) => setManualContact({ ...manualContact, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={manualContact.phone}
                    onChange={(e) => setManualContact({ ...manualContact, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={manualContact.company}
                    onChange={(e) => setManualContact({ ...manualContact, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={manualContact.title}
                    onChange={(e) => setManualContact({ ...manualContact, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add Contact
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Contact List */}
        {contacts.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Imported Contacts ({contacts.length})
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contacts.map((contact) => (
                      <tr key={contact.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{contact.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{contact.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{contact.phone}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{contact.company}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{contact.title}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
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
          onClick={handleNext}
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
        >
          Next: Build Sequence
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
