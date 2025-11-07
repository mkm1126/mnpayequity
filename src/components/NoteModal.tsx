import { useState, useEffect } from 'react';
import { X, Pin, Tag, AlertCircle } from 'lucide-react';
import { supabase, type AdminCaseNote, type Jurisdiction, type Report, type NoteCategory, type NotePriority, type NoteType } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type NoteModalProps = {
  note: AdminCaseNote | null;
  jurisdictions: Jurisdiction[];
  reports: Report[];
  userEmail: string;
  onClose: () => void;
  onSave: () => void;
};

const CATEGORY_OPTIONS: { value: NoteCategory; label: string; description: string }[] = [
  { value: 'general', label: 'General', description: 'General information or notes' },
  { value: 'compliance', label: 'Compliance', description: 'Compliance-related observations' },
  { value: 'follow-up', label: 'Follow-up', description: 'Items requiring follow-up action' },
  { value: 'issue', label: 'Issue', description: 'Problems or concerns identified' },
  { value: 'data-quality', label: 'Data Quality', description: 'Data accuracy or completeness issues' },
  { value: 'communication', label: 'Communication', description: 'Communication logs or reminders' },
  { value: 'approval', label: 'Approval', description: 'Approval process notes' },
  { value: 'other', label: 'Other', description: 'Other miscellaneous notes' }
];

const PRIORITY_OPTIONS: { value: NotePriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-300' }
];

export function NoteModal({ note, jurisdictions, reports, userEmail, onClose, onSave }: NoteModalProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [noteType, setNoteType] = useState<NoteType>(note?.note_type || 'jurisdiction');
  const [jurisdictionId, setJurisdictionId] = useState(note?.jurisdiction_id || '');
  const [reportId, setReportId] = useState<string>(note?.report_id || '');
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [category, setCategory] = useState<NoteCategory>(note?.category || 'general');
  const [priority, setPriority] = useState<NotePriority>(note?.priority || 'medium');
  const [isPinned, setIsPinned] = useState(note?.is_pinned || false);
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const filteredReports = reports.filter(r => r.jurisdiction_id === jurisdictionId);

  useEffect(() => {
    if (noteType === 'jurisdiction') {
      setReportId('');
    }
  }, [noteType]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = (): string | null => {
    if (!title.trim()) {
      return 'Please enter a title';
    }
    if (title.length > 200) {
      return 'Title must be 200 characters or less';
    }
    if (!content.trim()) {
      return 'Please enter content';
    }
    if (!jurisdictionId) {
      return 'Please select a jurisdiction';
    }
    if (noteType === 'case' && !reportId) {
      return 'Please select a case for case notes';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setSaving(true);

    try {
      const noteData = {
        note_type: noteType,
        jurisdiction_id: jurisdictionId,
        report_id: noteType === 'case' ? reportId : null,
        title: title.trim(),
        content: content.trim(),
        category,
        priority,
        is_pinned: isPinned,
        tags,
        created_by: user?.id || null,
        created_by_email: userEmail,
        updated_at: new Date().toISOString()
      };

      if (note) {
        const { error } = await supabase
          .from('admin_case_notes')
          .update(noteData)
          .eq('id', note.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_case_notes')
          .insert([noteData]);

        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error saving note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            {note ? 'Edit Note' : 'Create New Note'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNoteType('jurisdiction')}
                  className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                    noteType === 'jurisdiction'
                      ? 'border-[#003865] bg-[#003865] text-white'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">Jurisdiction</div>
                  <div className="text-xs mt-1 opacity-90">Organization-level</div>
                </button>
                <button
                  type="button"
                  onClick={() => setNoteType('case')}
                  className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                    noteType === 'case'
                      ? 'border-[#003865] bg-[#003865] text-white'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">Case</div>
                  <div className="text-xs mt-1 opacity-90">Report-specific</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jurisdiction <span className="text-red-500">*</span>
              </label>
              <select
                value={jurisdictionId}
                onChange={(e) => setJurisdictionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                required
              >
                <option value="">Select jurisdiction...</option>
                {jurisdictions.map(j => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </select>
            </div>
          </div>

          {noteType === 'case' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case/Report <span className="text-red-500">*</span>
              </label>
              <select
                value={reportId}
                onChange={(e) => setReportId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                required={noteType === 'case'}
                disabled={!jurisdictionId}
              >
                <option value="">Select case...</option>
                {filteredReports.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.report_year} - Case {r.case_number} ({r.case_description})
                  </option>
                ))}
              </select>
              {!jurisdictionId && (
                <p className="mt-1 text-xs text-gray-500">Select a jurisdiction first</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
              <span className="ml-2 text-xs text-gray-500">({title.length}/200)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
              placeholder="Enter note title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
              placeholder="Enter detailed note content..."
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Use this space to document important information, observations, or action items.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {CATEGORY_OPTIONS.map(cat => (
                  <label
                    key={cat.value}
                    className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      category === cat.value
                        ? 'border-[#003865] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.value}
                      checked={category === cat.value}
                      onChange={(e) => setCategory(e.target.value as NoteCategory)}
                      className="mt-1 w-4 h-4 text-[#003865] border-gray-300 focus:ring-[#003865]"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{cat.label}</div>
                      <div className="text-xs text-gray-500">{cat.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {PRIORITY_OPTIONS.map(pri => (
                  <button
                    key={pri.value}
                    type="button"
                    onClick={() => setPriority(pri.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-colors ${
                      priority === pri.value
                        ? 'border-[#003865] ring-2 ring-[#003865] ring-opacity-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${pri.color}`}>
                      {pri.label}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-5 h-5 text-[#003865] border-gray-300 rounded focus:ring-[#003865]"
                  />
                  <div className="flex items-center gap-2">
                    <Pin size={18} className="text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Pin Note</div>
                      <div className="text-xs text-gray-500">Show at top of list</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag size={16} className="inline mr-1" />
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                placeholder="Type a tag and press Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-[#003865] text-white rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-gray-300 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Tags help organize and search notes. Press Enter or click Add to create a tag.
            </p>
          </div>

          <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              This note will be visible to all admin users. Use clear, professional language and avoid including sensitive personal information.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors disabled:opacity-50 font-medium"
            >
              {saving ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
