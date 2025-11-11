import { useState, useEffect } from 'react';
import { X, AlertCircle, Calendar, CheckCircle, Clock, Pin, Bell, BellOff } from 'lucide-react';
import { supabase, type AdminCaseNote, type Jurisdiction, type Report, type DismissedNotification } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type NotificationPanelProps = {
  onClose: () => void;
  onNavigate: (view: string, data?: any) => void;
};

type NotificationType = 'all' | 'urgent' | 'followups' | 'approvals';

export function NotificationPanel({ onClose, onNavigate }: NotificationPanelProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<NotificationType>('all');
  const [urgentNotes, setUrgentNotes] = useState<AdminCaseNote[]>([]);
  const [followupNotes, setFollowupNotes] = useState<AdminCaseNote[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<number>(0);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const [
        urgentData,
        followupsData,
        jurisdictionsData,
        reportsData,
        approvalsData,
        dismissedData
      ] = await Promise.all([
        supabase
          .from('admin_case_notes')
          .select('*')
          .eq('priority', 'urgent')
          .order('created_at', { ascending: false }),
        supabase
          .from('admin_case_notes')
          .select('*')
          .eq('category', 'follow-up')
          .is('completed_at', null)
          .order('due_date', { ascending: true }),
        supabase
          .from('jurisdictions')
          .select('*'),
        supabase
          .from('reports')
          .select('*'),
        supabase
          .from('reports')
          .select('id')
          .eq('case_status', 'Submitted')
          .in('approval_status', ['pending', 'draft']),
        supabase
          .from('dismissed_notifications')
          .select('note_id')
          .eq('admin_user_id', user?.id || '')
      ]);

      if (urgentData.error) throw urgentData.error;
      if (followupsData.error) throw followupsData.error;
      if (jurisdictionsData.error) throw jurisdictionsData.error;
      if (reportsData.error) throw reportsData.error;
      if (approvalsData.error) throw approvalsData.error;

      setUrgentNotes(urgentData.data || []);
      setFollowupNotes(followupsData.data || []);
      setJurisdictions(jurisdictionsData.data || []);
      setReports(reportsData.data || []);
      setPendingApprovals((approvalsData.data || []).length);

      const dismissed = new Set((dismissedData.data || []).map(d => d.note_id));
      setDismissedIds(dismissed);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDismissNotification(noteId: string) {
    try {
      const { error } = await supabase
        .from('dismissed_notifications')
        .insert([{
          admin_user_id: user?.id,
          note_id: noteId
        }]);

      if (error) throw error;
      setDismissedIds(prev => new Set([...prev, noteId]));
    } catch (error) {
      console.error('Error dismissing notification:', error);
      alert('Error dismissing notification');
    }
  }

  async function handleCompleteFollowup(noteId: string) {
    try {
      const { error } = await supabase
        .from('admin_case_notes')
        .update({
          completed_at: new Date().toISOString(),
          completed_by: user?.id
        })
        .eq('id', noteId);

      if (error) throw error;
      await loadNotifications();
    } catch (error) {
      console.error('Error completing follow-up:', error);
      alert('Error completing follow-up');
    }
  }

  const getVisibleUrgentNotes = () => {
    return urgentNotes.filter(note => !dismissedIds.has(note.id));
  };

  const getFollowupStatus = (note: AdminCaseNote) => {
    if (!note.due_date) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(note.due_date);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      return { label: 'Overdue', color: 'text-red-600 bg-red-50' };
    } else if (dueDate.getTime() === today.getTime()) {
      return { label: 'Due Today', color: 'text-orange-600 bg-orange-50' };
    } else {
      const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 7) {
        return { label: `Due in ${daysUntil}d`, color: 'text-yellow-600 bg-yellow-50' };
      }
      return { label: `Due ${dueDate.toLocaleDateString()}`, color: 'text-gray-600 bg-gray-50' };
    }
  };

  const visibleUrgentNotes = getVisibleUrgentNotes();
  const overdueFollowups = followupNotes.filter(note => {
    if (!note.due_date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(note.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });

  const allNotifications = [
    ...visibleUrgentNotes.map(note => ({ ...note, type: 'urgent' as const })),
    ...followupNotes.map(note => ({ ...note, type: 'followup' as const }))
  ];

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'urgent':
        return visibleUrgentNotes.map(note => ({ ...note, type: 'urgent' as const }));
      case 'followups':
        return followupNotes.map(note => ({ ...note, type: 'followup' as const }));
      case 'all':
      default:
        return allNotifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-[#003865]" />
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-2 -mb-px">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-[#003865] text-[#003865]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({allNotifications.length})
            </button>
            <button
              onClick={() => setActiveTab('urgent')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'urgent'
                  ? 'border-[#003865] text-[#003865]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Urgent ({visibleUrgentNotes.length})
            </button>
            <button
              onClick={() => setActiveTab('followups')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'followups'
                  ? 'border-[#003865] text-[#003865]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Follow-ups ({followupNotes.length})
              {overdueFollowups.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {overdueFollowups.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'approvals'
                  ? 'border-[#003865] text-[#003865]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Approvals ({pendingApprovals})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003865]"></div>
            </div>
          ) : activeTab === 'approvals' ? (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {pendingApprovals} {pendingApprovals === 1 ? 'Case' : 'Cases'} Pending Review
                </h3>
                <p className="text-gray-600 mb-4">
                  Review and approve submitted pay equity reports
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('approvalDashboard');
                  }}
                  className="px-6 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
                >
                  Go to Approval Dashboard
                </button>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <BellOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No notifications to display</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map(notification => {
                const jurisdiction = jurisdictions.find(j => j.id === notification.jurisdiction_id);
                const report = notification.report_id ? reports.find(r => r.id === notification.report_id) : null;
                const followupStatus = notification.type === 'followup' ? getFollowupStatus(notification) : null;

                return (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-all ${
                      notification.type === 'urgent'
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {notification.type === 'urgent' ? (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Calendar className="w-5 h-5 text-amber-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          {notification.is_pinned && (
                            <Pin className="w-4 h-4 text-[#003865] flex-shrink-0" fill="currentColor" />
                          )}
                        </div>

                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">{notification.content}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {notification.type === 'urgent' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-300">
                              <AlertCircle className="w-3 h-3" />
                              Urgent
                            </span>
                          )}
                          {followupStatus && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${followupStatus.color}`}>
                              <Calendar className="w-3 h-3" />
                              {followupStatus.label}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {notification.note_type === 'jurisdiction' ? 'Jurisdiction' : 'Case'} Note
                          </span>
                        </div>

                        <div className="text-xs text-gray-600 space-y-1 mb-3">
                          <p>
                            <span className="font-medium">Jurisdiction:</span> {jurisdiction?.name || 'Unknown'}
                          </p>
                          {report && (
                            <p>
                              <span className="font-medium">Case:</span> {report.report_year} - Case {report.case_number}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Created:</span> {new Date(notification.created_at).toLocaleDateString()}
                            {' by '}{notification.created_by_email}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              onClose();
                              onNavigate('caseNotes', { noteId: notification.id });
                            }}
                            className="text-sm font-medium text-[#003865] hover:text-[#004d7a] underline"
                          >
                            View Details
                          </button>
                          {notification.type === 'followup' && (
                            <button
                              onClick={() => handleCompleteFollowup(notification.id)}
                              className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded hover:bg-green-200 transition-colors"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Mark Complete
                            </button>
                          )}
                          {notification.type === 'urgent' && !dismissedIds.has(notification.id) && (
                            <button
                              onClick={() => handleDismissNotification(notification.id)}
                              className="ml-auto text-sm text-gray-600 hover:text-gray-800"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
