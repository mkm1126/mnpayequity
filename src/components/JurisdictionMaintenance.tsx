import { useState } from 'react';
import { ArrowLeft, Plus, Save, Download, AlertCircle } from 'lucide-react';
import { supabase, type Jurisdiction, type Contact } from '../lib/supabase';
import { AddJurisdictionModal } from './AddJurisdictionModal';
import { JurisdictionForm } from './JurisdictionForm';
import { useScrollToTop } from '../hooks/useScrollToTop';

interface JurisdictionMaintenanceProps {
  jurisdictions: Jurisdiction[];
  onBack: () => void;
  onJurisdictionsUpdated: () => Promise<void>;
}

export function JurisdictionMaintenance({
  jurisdictions,
  onBack,
  onJurisdictionsUpdated
}: JurisdictionMaintenanceProps) {
  useScrollToTop();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedJurisdictionForModify, setSelectedJurisdictionForModify] = useState<Jurisdiction | null>(null);
  const [selectedJurisdictionForExport, setSelectedJurisdictionForExport] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function handleSaveJurisdiction(jurisdictionData: Partial<Jurisdiction>) {
    try {
      const { data, error } = await supabase
        .from('jurisdictions')
        .insert([
          {
            jurisdiction_id: jurisdictionData.jurisdiction_id,
            name: jurisdictionData.name,
            address: jurisdictionData.address || '',
            city: jurisdictionData.city || '',
            state: jurisdictionData.state || 'MN',
            zipcode: jurisdictionData.zipcode || '',
            phone: jurisdictionData.phone || '',
            fax: jurisdictionData.fax || '',
            jurisdiction_type: jurisdictionData.jurisdiction_type || '',
            next_report_year: jurisdictionData.next_report_year || null,
            follow_up_type: jurisdictionData.follow_up_type || '',
            follow_up_date: jurisdictionData.follow_up_date || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      alert('Jurisdiction added successfully!');
      await onJurisdictionsUpdated();
      if (data) {
        setSelectedJurisdictionForModify(data);
      }
    } catch (error) {
      console.error('Error adding jurisdiction:', error);
      alert('Error adding jurisdiction. Please try again.');
      throw error;
    }
  }

  async function handleModifyJurisdiction() {
    if (!selectedJurisdictionForModify) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('jurisdictions')
        .update({
          jurisdiction_id: selectedJurisdictionForModify.jurisdiction_id,
          name: selectedJurisdictionForModify.name,
          address: selectedJurisdictionForModify.address,
          city: selectedJurisdictionForModify.city,
          state: selectedJurisdictionForModify.state,
          zipcode: selectedJurisdictionForModify.zipcode,
          phone: selectedJurisdictionForModify.phone,
          fax: selectedJurisdictionForModify.fax,
          jurisdiction_type: selectedJurisdictionForModify.jurisdiction_type,
          next_report_year: selectedJurisdictionForModify.next_report_year,
          follow_up_type: selectedJurisdictionForModify.follow_up_type,
          follow_up_date: selectedJurisdictionForModify.follow_up_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedJurisdictionForModify.id);

      if (error) throw error;

      alert('Jurisdiction updated successfully!');
      await onJurisdictionsUpdated();
    } catch (error) {
      console.error('Error updating jurisdiction:', error);
      alert('Error updating jurisdiction. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleJurisdictionFieldChange(field: keyof Jurisdiction, value: string | number) {
    if (!selectedJurisdictionForModify) return;

    setSelectedJurisdictionForModify({
      ...selectedJurisdictionForModify,
      [field]: value,
    });
  }

  async function handleExportContacts() {
    if (!selectedJurisdictionForExport) {
      setExportMessage({ type: 'error', text: 'Please select a jurisdiction first' });
      setTimeout(() => setExportMessage(null), 3000);
      return;
    }

    try {
      const jurisdiction = jurisdictions.find(j => j.id === selectedJurisdictionForExport);
      if (!jurisdiction) {
        setExportMessage({ type: 'error', text: 'Jurisdiction not found' });
        setTimeout(() => setExportMessage(null), 3000);
        return;
      }

      const { data: contacts, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('jurisdiction_id', selectedJurisdictionForExport)
        .order('is_primary', { ascending: false })
        .order('name');

      if (error) throw error;

      if (!contacts || contacts.length === 0) {
        setExportMessage({ type: 'error', text: 'No contacts found for this jurisdiction' });
        setTimeout(() => setExportMessage(null), 3000);
        return;
      }

      const csv = [
        ['Name', 'Title', 'Primary', 'Email', 'Phone'],
        ...contacts.map((c: Contact) => [
          c.name,
          c.title,
          c.is_primary ? 'Yes' : 'No',
          c.email,
          c.phone,
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${jurisdiction.name}_contacts.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      setExportMessage({ type: 'success', text: `Exported ${contacts.length} contacts successfully` });
      setTimeout(() => setExportMessage(null), 3000);
    } catch (error) {
      console.error('Error exporting contacts:', error);
      setExportMessage({ type: 'error', text: 'Error exporting contacts. Please try again.' });
      setTimeout(() => setExportMessage(null), 3000);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-[#003865] hover:bg-gray-100 rounded transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Jurisdiction Maintenance</h1>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Admin Access Only</h3>
            <p className="text-sm text-blue-700 mt-1">
              This page is for managing jurisdiction records. Use caution when modifying jurisdiction information as it affects all associated reports and data.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Plus className="w-6 h-6 text-[#78BE21]" />
          <h2 className="text-xl font-semibold text-gray-900">Add New Jurisdiction</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Create a new jurisdiction record in the system. This will allow you to start tracking pay equity reports for this entity.
        </p>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#78BE21] text-white rounded hover:bg-[#6ba91d] transition-colors font-medium"
        >
          <Plus size={18} />
          Add New Jurisdiction
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Save className="w-6 h-6 text-[#003865]" />
          <h2 className="text-xl font-semibold text-gray-900">Modify Jurisdiction</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Select a jurisdiction to edit its information. All changes will be reflected across the system.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Jurisdiction to Modify
          </label>
          <select
            value={selectedJurisdictionForModify?.id || ''}
            onChange={(e) => {
              const jurisdiction = jurisdictions.find(j => j.id === e.target.value);
              setSelectedJurisdictionForModify(jurisdiction || null);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
          >
            <option value="">Select a jurisdiction...</option>
            {jurisdictions.map((jurisdiction) => (
              <option key={jurisdiction.id} value={jurisdiction.id}>
                {jurisdiction.name} ({jurisdiction.jurisdiction_id})
              </option>
            ))}
          </select>
        </div>

        {selectedJurisdictionForModify && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <JurisdictionForm
                jurisdiction={selectedJurisdictionForModify}
                onChange={handleJurisdictionFieldChange}
              />
            </div>
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={handleModifyJurisdiction}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-[#003865] text-white rounded hover:bg-[#004a7f] transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Download className="w-6 h-6 text-[#008EAA]" />
          <h2 className="text-xl font-semibold text-gray-900">Export Jurisdiction Contacts</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Export contact information for a jurisdiction to a CSV file for external use or record keeping.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Jurisdiction
          </label>
          <select
            value={selectedJurisdictionForExport}
            onChange={(e) => setSelectedJurisdictionForExport(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003865] focus:border-transparent"
          >
            <option value="">Select a jurisdiction...</option>
            {jurisdictions.map((jurisdiction) => (
              <option key={jurisdiction.id} value={jurisdiction.id}>
                {jurisdiction.name} ({jurisdiction.jurisdiction_id})
              </option>
            ))}
          </select>
        </div>

        {exportMessage && (
          <div className={`mb-4 p-3 rounded ${
            exportMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {exportMessage.text}
          </div>
        )}

        <button
          onClick={handleExportContacts}
          disabled={!selectedJurisdictionForExport}
          className="flex items-center gap-2 px-6 py-3 bg-[#008EAA] text-white rounded hover:bg-[#007a95] transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          Export Contacts to CSV
        </button>
      </div>

      <AddJurisdictionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveJurisdiction}
      />
    </div>
  );
}
