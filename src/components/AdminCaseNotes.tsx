import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Plus, Search, Filter, X, Pin, FileText, AlertCircle, Download, TrendingUp, Calendar } from 'lucide-react';
import { supabase, type AdminCaseNote, type Jurisdiction, type Report, type NoteCategory, type NotePriority, type NoteType, type NoteFilter, type NoteSortOption, type NoteStats } from '../lib/supabase';
import { NoteModal } from './NoteModal';
import { NoteDetailView } from './NoteDetailView';
import { useScrollToTop } from '../hooks/useScrollToTop';

type AdminCaseNotesProps = {
  onBack: () => void;
};

const CATEGORY_LABELS: Record<NoteCategory, string> = {
  general: 'General',
  compliance: 'Compliance',
  'follow-up': 'Follow-up',
  issue: 'Issue',
  'data-quality': 'Data Quality',
  communication: 'Communication',
  approval: 'Approval',
  other: 'Other'
};

const PRIORITY_LABELS: Record<NotePriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent'
};

const PRIORITY_COLORS: Record<NotePriority, string> = {
  low: 'bg-gray-100 text-gray-700 border-gray-300',
  medium: 'bg-blue-100 text-blue-700 border-blue-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  urgent: 'bg-red-100 text-red-700 border-red-300'
};

const CATEGORY_COLORS: Record<NoteCategory, string> = {
  general: 'bg-gray-100 text-gray-700',
  compliance: 'bg-green-100 text-green-700',
  'follow-up': 'bg-yellow-100 text-yellow-700',
  issue: 'bg-red-100 text-red-700',
  'data-quality': 'bg-purple-100 text-purple-700',
  communication: 'bg-blue-100 text-blue-700',
  approval: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-700'
};

export function AdminCaseNotes({ onBack }: AdminCaseNotesProps) {
  useScrollToTop();
  const { userProfile } = useAuth();

  const [notes, setNotes] = useState<AdminCaseNote[]>([]);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<AdminCaseNote | null>(null);
  const [selectedNote, setSelectedNote] = useState<AdminCaseNote | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<NoteSortOption>('updated_desc');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [stats, setStats] = useState<NoteStats | null>(null);

  const [filters, setFilters] = useState<NoteFilter>({
    searchTerm: '',
    noteType: 'all',
    categories: [],
    priorities: [],
    jurisdictionId: null,
    reportId: null,
    authorEmail: null,
    tags: [],
    dateFrom: null,
    dateTo: null,
    showPinnedOnly: false
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchTerm }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  async function loadData() {
    setLoading(true);
    try {
      await Promise.all([
        loadNotes(),
        loadJurisdictions(),
        loadReports(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadNotes() {
    try {
      const { data, error } = await supabase
        .from('admin_case_notes')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      alert('Error loading notes. Please try again.');
    }
  }

  async function loadJurisdictions() {
    try {
      const { data, error } = await supabase
        .from('jurisdictions')
        .select('*')
        .order('name');

      if (error) throw error;
      setJurisdictions(data || []);
    } catch (error) {
      console.error('Error loading jurisdictions:', error);
    }
  }

  async function loadReports() {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('report_year', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  }

  async function loadStats() {
    try {
      const { data: allNotes, error } = await supabase
        .from('admin_case_notes')
        .select('*');

      if (error) throw error;

      const notes = allNotes || [];

      const categoryCount: Record<NoteCategory, number> = {
        general: 0,
        compliance: 0,
        'follow-up': 0,
        issue: 0,
        'data-quality': 0,
        communication: 0,
        approval: 0,
        other: 0
      };

      const priorityCount: Record<NotePriority, number> = {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0
      };

      notes.forEach(note => {
        categoryCount[note.category]++;
        priorityCount[note.priority]++;
      });

      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const recentNotes = notes.filter(n => new Date(n.created_at) >= last30Days);
      const activityByDate: Record<string, number> = {};

      recentNotes.forEach(note => {
        const date = new Date(note.created_at).toISOString().split('T')[0];
        activityByDate[date] = (activityByDate[date] || 0) + 1;
      });

      const recentActivity = Object.entries(activityByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setStats({
        totalNotes: notes.length,
        jurisdictionNotes: notes.filter(n => n.note_type === 'jurisdiction').length,
        caseNotes: notes.filter(n => n.note_type === 'case').length,
        byCategory: categoryCount,
        byPriority: priorityCount,
        pinnedNotes: notes.filter(n => n.is_pinned).length,
        recentActivity
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  const filteredAndSortedNotes = useMemo(() => {
    let filtered = [...notes];

    if (filters.searchTerm.trim()) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(term) ||
        note.content.toLowerCase().includes(term) ||
        note.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    if (filters.noteType !== 'all') {
      filtered = filtered.filter(note => note.note_type === filters.noteType);
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(note => filters.categories.includes(note.category));
    }

    if (filters.priorities.length > 0) {
      filtered = filtered.filter(note => filters.priorities.includes(note.priority));
    }

    if (filters.jurisdictionId) {
      filtered = filtered.filter(note => note.jurisdiction_id === filters.jurisdictionId);
    }

    if (filters.reportId) {
      filtered = filtered.filter(note => note.report_id === filters.reportId);
    }

    if (filters.authorEmail) {
      filtered = filtered.filter(note => note.created_by_email === filters.authorEmail);
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(note =>
        filters.tags.some(tag => note.tags.includes(tag))
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(note =>
        new Date(note.created_at) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(note =>
        new Date(note.created_at) <= endDate
      );
    }

    if (filters.showPinnedOnly) {
      filtered = filtered.filter(note => note.is_pinned);
    }

    filtered.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) {
        return a.is_pinned ? -1 : 1;
      }

      switch (sortBy) {
        case 'updated_asc':
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        case 'updated_desc':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'created_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [notes, filters, sortBy]);

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_case_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      await loadData();
      setSelectedNote(null);
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note. Please try again.');
    }
  };

  const handleExportNotes = () => {
    const csv = [
      ['Type', 'Title', 'Category', 'Priority', 'Jurisdiction', 'Case', 'Author', 'Created', 'Updated', 'Tags', 'Content'],
      ...filteredAndSortedNotes.map(note => {
        const jurisdiction = jurisdictions.find(j => j.id === note.jurisdiction_id);
        const report = note.report_id ? reports.find(r => r.id === note.report_id) : null;
        return [
          note.note_type,
          note.title,
          CATEGORY_LABELS[note.category],
          PRIORITY_LABELS[note.priority],
          jurisdiction?.name || '',
          report ? `${report.report_year} - Case ${report.case_number}` : '',
          note.created_by_email,
          new Date(note.created_at).toLocaleDateString(),
          new Date(note.updated_at).toLocaleDateString(),
          note.tags.join('; '),
          note.content.replace(/\n/g, ' ')
        ];
      })
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case-notes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      noteType: 'all',
      categories: [],
      priorities: [],
      jurisdictionId: null,
      reportId: null,
      authorEmail: null,
      tags: [],
      dateFrom: null,
      dateTo: null,
      showPinnedOnly: false
    });
    setSearchTerm('');
  };

  const activeFilterCount =
    (filters.noteType !== 'all' ? 1 : 0) +
    filters.categories.length +
    filters.priorities.length +
    (filters.jurisdictionId ? 1 : 0) +
    (filters.reportId ? 1 : 0) +
    (filters.authorEmail ? 1 : 0) +
    filters.tags.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0) +
    (filters.showPinnedOnly ? 1 : 0);

  const uniqueAuthors = Array.from(new Set(notes.map(n => n.created_by_email))).sort();
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003865] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading case notes...</p>
        </div>
      </div>
    );
  }

  if (selectedNote) {
    return (
      <NoteDetailView
        note={selectedNote}
        jurisdictions={jurisdictions}
        reports={reports}
        onBack={() => setSelectedNote(null)}
        onEdit={(note) => {
          setEditingNote(note);
          setShowModal(true);
          setSelectedNote(null);
        }}
        onDelete={handleDeleteNote}
        onRefresh={loadData}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Case Notes</h2>
            <p className="text-sm text-gray-600">Manage jurisdiction and case notes</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportNotes}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            title="Export notes"
          >
            <Download size={20} />
            Export
          </button>
          <button
            onClick={() => {
              setEditingNote(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
          >
            <Plus size={20} />
            New Note
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Notes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalNotes}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {stats.jurisdictionNotes} jurisdiction • {stats.caseNotes} case
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{stats.byPriority.high + stats.byPriority.urgent}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-400" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {stats.byPriority.urgent} urgent • {stats.byPriority.high} high
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pinned Notes</p>
                <p className="text-2xl font-bold text-[#003865]">{stats.pinnedNotes}</p>
              </div>
              <Pin className="w-8 h-8 text-gray-400" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Quick access items
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last 30 Days</p>
                <p className="text-2xl font-bold text-green-600">{stats.recentActivity.reduce((sum, day) => sum + day.count, 0)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Notes created
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search notes by title, content, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-[#003865] text-white border-[#003865]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={20} />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as NoteSortOption)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
          >
            <option value="updated_desc">Recently Updated</option>
            <option value="updated_asc">Oldest Updated</option>
            <option value="created_desc">Recently Created</option>
            <option value="created_asc">Oldest Created</option>
            <option value="priority">Priority</option>
            <option value="title_asc">Title A-Z</option>
            <option value="title_desc">Title Z-A</option>
          </select>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note Type</label>
                <select
                  value={filters.noteType}
                  onChange={(e) => setFilters(prev => ({ ...prev, noteType: e.target.value as NoteType | 'all' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="jurisdiction">Jurisdiction Notes</option>
                  <option value="case">Case Notes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
                <select
                  value={filters.jurisdictionId || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, jurisdictionId: e.target.value || null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                >
                  <option value="">All Jurisdictions</option>
                  {jurisdictions.map(j => (
                    <option key={j.id} value={j.id}>{j.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <select
                  value={filters.authorEmail || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, authorEmail: e.target.value || null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                >
                  <option value="">All Authors</option>
                  {uniqueAuthors.map(email => (
                    <option key={email} value={email}>{email}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(CATEGORY_LABELS) as NoteCategory[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        categories: prev.categories.includes(cat)
                          ? prev.categories.filter(c => c !== cat)
                          : [...prev.categories, cat]
                      }));
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.categories.includes(cat)
                        ? 'bg-[#003865] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priorities</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PRIORITY_LABELS) as NotePriority[]).map(pri => (
                  <button
                    key={pri}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        priorities: prev.priorities.includes(pri)
                          ? prev.priorities.filter(p => p !== pri)
                          : [...prev.priorities, pri]
                      }));
                    }}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      filters.priorities.includes(pri)
                        ? 'bg-[#003865] text-white border-[#003865]'
                        : PRIORITY_COLORS[pri]
                    }`}
                  >
                    {PRIORITY_LABELS[pri]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value || null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value || null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showPinnedOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, showPinnedOnly: e.target.checked }))}
                  className="w-4 h-4 text-[#003865] border-gray-300 rounded focus:ring-[#003865]"
                />
                Show pinned notes only
              </label>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  <X size={16} />
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {filteredAndSortedNotes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">
            {activeFilterCount > 0 || searchTerm ? 'No notes found matching your criteria.' : 'No notes yet. Click "New Note" to create one.'}
          </p>
          {(activeFilterCount > 0 || searchTerm) && (
            <button
              onClick={clearFilters}
              className="text-[#003865] hover:text-[#004d7a] transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedNotes.map(note => {
            const jurisdiction = jurisdictions.find(j => j.id === note.jurisdiction_id);
            const report = note.report_id ? reports.find(r => r.id === note.report_id) : null;

            return (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer relative"
              >
                {note.is_pinned && (
                  <Pin className="absolute top-2 right-2 w-5 h-5 text-[#003865]" fill="currentColor" />
                )}

                <div className="flex items-start gap-3 mb-3">
                  <div className={`px-2 py-0.5 rounded text-xs font-medium border ${PRIORITY_COLORS[note.priority]}`}>
                    {PRIORITY_LABELS[note.priority]}
                  </div>
                  <div className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[note.category]}`}>
                    {CATEGORY_LABELS[note.category]}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-6">{note.title}</h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{note.content}</p>

                <div className="space-y-1 mb-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Type:</span>
                    <span className="capitalize">{note.note_type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Jurisdiction:</span>
                    <span className="truncate">{jurisdiction?.name || 'Unknown'}</span>
                  </div>
                  {report && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Case:</span>
                      <span>{report.report_year} - Case {report.case_number}</span>
                    </div>
                  )}
                </div>

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span>{note.created_by_email}</span>
                  <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <NoteModal
          note={editingNote}
          jurisdictions={jurisdictions}
          reports={reports}
          userEmail={userProfile?.email || ''}
          onClose={() => {
            setShowModal(false);
            setEditingNote(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingNote(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
