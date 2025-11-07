import { ArrowLeft, Edit2, Trash2, Pin, Calendar, User, Tag, MapPin, FileText, Copy } from 'lucide-react';
import { type AdminCaseNote, type Jurisdiction, type Report } from '../lib/supabase';

type NoteDetailViewProps = {
  note: AdminCaseNote;
  jurisdictions: Jurisdiction[];
  reports: Report[];
  onBack: () => void;
  onEdit: (note: AdminCaseNote) => void;
  onDelete: (noteId: string) => void;
  onRefresh: () => void;
};

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  compliance: 'Compliance',
  'follow-up': 'Follow-up',
  issue: 'Issue',
  'data-quality': 'Data Quality',
  communication: 'Communication',
  approval: 'Approval',
  other: 'Other'
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent'
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700 border-gray-300',
  medium: 'bg-blue-100 text-blue-700 border-blue-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  urgent: 'bg-red-100 text-red-700 border-red-300'
};

const CATEGORY_COLORS: Record<string, string> = {
  general: 'bg-gray-100 text-gray-700',
  compliance: 'bg-green-100 text-green-700',
  'follow-up': 'bg-yellow-100 text-yellow-700',
  issue: 'bg-red-100 text-red-700',
  'data-quality': 'bg-purple-100 text-purple-700',
  communication: 'bg-blue-100 text-blue-700',
  approval: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-700'
};

export function NoteDetailView({ note, jurisdictions, reports, onBack, onEdit, onDelete, onRefresh }: NoteDetailViewProps) {
  const jurisdiction = jurisdictions.find(j => j.id === note.jurisdiction_id);
  const report = note.report_id ? reports.find(r => r.id === note.report_id) : null;

  const handleCopyContent = () => {
    navigator.clipboard.writeText(note.content);
    alert('Note content copied to clipboard!');
  };

  const handleDuplicate = () => {
    const duplicatedNote: AdminCaseNote = {
      ...note,
      id: '',
      title: `${note.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    onEdit(duplicatedNote);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Notes
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            title="Duplicate note"
          >
            <Copy size={18} />
            Duplicate
          </button>
          <button
            onClick={() => onEdit(note)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit2 size={18} />
            Edit
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#003865] to-[#004d7a] px-6 py-8 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${PRIORITY_COLORS[note.priority]} bg-white`}>
                {PRIORITY_LABELS[note.priority]}
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium bg-white ${CATEGORY_COLORS[note.category]}`}>
                {CATEGORY_LABELS[note.category]}
              </div>
            </div>
            {note.is_pinned && (
              <div className="flex items-center gap-2 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                <Pin size={16} fill="currentColor" />
                Pinned
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">{note.title}</h1>
          <div className="flex items-center gap-2 text-sm text-white text-opacity-90">
            <span className="capitalize">{note.note_type} Note</span>
            <span>•</span>
            <span>ID: {note.id.slice(0, 8)}</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Jurisdiction</div>
                  <div className="text-base text-gray-900">{jurisdiction?.name || 'Unknown'}</div>
                  {jurisdiction && (
                    <div className="text-sm text-gray-600 mt-1">
                      {jurisdiction.city}, {jurisdiction.state}
                    </div>
                  )}
                </div>
              </div>

              {report && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Case/Report</div>
                    <div className="text-base text-gray-900">
                      {report.report_year} - Case {report.case_number}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{report.case_description}</div>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        report.case_status === 'In Compliance' ? 'bg-green-100 text-green-700' :
                        report.case_status === 'Out of Compliance' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {report.case_status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Created By</div>
                  <div className="text-base text-gray-900">{note.created_by_email}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Timeline</div>
                  <div className="text-sm text-gray-900 space-y-1">
                    <div>
                      <span className="font-medium">Created:</span>{' '}
                      {new Date(note.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span>{' '}
                      {new Date(note.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {note.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-3">
                <Tag size={16} />
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {note.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-[#003865] text-white text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Note Content</h3>
              <button
                onClick={handleCopyContent}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Copy size={16} />
                Copy Content
              </button>
            </div>
            <div className="prose max-w-none">
              <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap text-gray-900 leading-relaxed">
                {note.content}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Note Information</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>This is an admin-only note visible to all administrators.</div>
              <div>All edits and deletions are tracked for audit purposes.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onEdit(note)}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-colors text-left"
          >
            <Edit2 className="w-6 h-6 text-[#003865] mb-2" />
            <div className="font-medium text-gray-900">Edit Note</div>
            <div className="text-sm text-gray-600 mt-1">Modify note details and content</div>
          </button>

          <button
            onClick={handleDuplicate}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-colors text-left"
          >
            <Copy className="w-6 h-6 text-[#003865] mb-2" />
            <div className="font-medium text-gray-900">Duplicate Note</div>
            <div className="text-sm text-gray-600 mt-1">Create a copy of this note</div>
          </button>

          <button
            onClick={() => onDelete(note.id)}
            className="p-4 border-2 border-red-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors text-left"
          >
            <Trash2 className="w-6 h-6 text-red-600 mb-2" />
            <div className="font-medium text-gray-900">Delete Note</div>
            <div className="text-sm text-gray-600 mt-1">Permanently remove this note</div>
          </button>
        </div>
      </div>
    </div>
  );
}
