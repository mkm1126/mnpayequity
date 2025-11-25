import { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Settings,
  BarChart3,
  AlertCircle,
  RefreshCw,
  Eye,
  Trash2,
  Plus
} from 'lucide-react';
import {
  supabase,
  type Jurisdiction,
  type Contact,
  type SubmissionReminder
} from '../lib/supabase';
import { getDeadlineInfo } from '../lib/deadlineCalculator';

type ReminderWithJurisdiction = SubmissionReminder & {
  jurisdiction_name: string;
  jurisdiction_type: string;
};

type ReminderAnalytics = {
  totalSent: number;
  sentThisMonth: number;
  deliverySuccessRate: number;
  byType: {
    approaching_90d: number;
    approaching_60d: number;
    approaching_30d: number;
    approaching_7d: number;
    overdue_1d: number;
    overdue_30d: number;
    manual: number;
  };
};

export function ReminderManagement() {
  const [reminders, setReminders] = useState<ReminderWithJurisdiction[]>([]);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<ReminderAnalytics | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const [selectedView, setSelectedView] = useState<'history' | 'send' | 'bulk' | 'analytics'>('history');

  useEffect(() => {
    loadData();
  }, [dateRange]);

  async function loadData() {
    try {
      setLoading(true);

      const [jurisdictionsData, contactsData, remindersData] = await Promise.all([
        db.from('jurisdictions').select('*').order('name'),
        db.from('contacts').select('*').eq('is_primary', true),
        db.from('submission_reminders').select('*').order('sent_at', { ascending: false })
      ]);

      if (jurisdictionsData.error) throw jurisdictionsData.error;
      if (contactsData.error) throw contactsData.error;
      if (remindersData.error) throw remindersData.error;

      setJurisdictions(jurisdictionsData.data || []);
      setContacts(contactsData.data || []);

      const remindersWithJurisdiction = (remindersData.data || []).map(reminder => {
        const jurisdiction = (jurisdictionsData.data || []).find(j => j.id === reminder.jurisdiction_id);
        return {
          ...reminder,
          jurisdiction_name: jurisdiction?.name || 'Unknown',
          jurisdiction_type: jurisdiction?.jurisdiction_type || 'Unknown'
        };
      });

      const filteredReminders = filterByDateRange(remindersWithJurisdiction);
      setReminders(filteredReminders);

      calculateAnalytics(remindersData.data || []);

    } catch (error) {
      console.error('Error loading reminder data:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterByDateRange(remindersList: ReminderWithJurisdiction[]) {
    const now = new Date();
    let cutoffDate = new Date();

    switch (dateRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        return remindersList;
    }

    return remindersList.filter(r => new Date(r.sent_at) >= cutoffDate);
  }

  function calculateAnalytics(allReminders: SubmissionReminder[]) {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const sentThisMonth = allReminders.filter(r => new Date(r.sent_at) >= monthAgo).length;
    const delivered = allReminders.filter(r => r.email_delivered).length;
    const deliveryRate = allReminders.length > 0 ? (delivered / allReminders.length) * 100 : 0;

    const byType = {
      approaching_90d: allReminders.filter(r => r.reminder_type === 'approaching_90d').length,
      approaching_60d: allReminders.filter(r => r.reminder_type === 'approaching_60d').length,
      approaching_30d: allReminders.filter(r => r.reminder_type === 'approaching_30d').length,
      approaching_7d: allReminders.filter(r => r.reminder_type === 'approaching_7d').length,
      overdue_1d: allReminders.filter(r => r.reminder_type === 'overdue_1d').length,
      overdue_30d: allReminders.filter(r => r.reminder_type === 'overdue_30d').length,
      manual: allReminders.filter(r => r.reminder_type === 'manual').length
    };

    setAnalytics({
      totalSent: allReminders.length,
      sentThisMonth,
      deliverySuccessRate: deliveryRate,
      byType
    });
  }

  function getFilteredReminders() {
    let filtered = reminders;

    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.reminder_type === filterType);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.jurisdiction_name.toLowerCase().includes(search) ||
        r.email_sent_to.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  function getReminderTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      approaching_90d: '90 Days Before',
      approaching_60d: '60 Days Before',
      approaching_30d: '30 Days Before',
      approaching_7d: '7 Days Before',
      overdue_1d: '1 Day Overdue',
      overdue_30d: '30+ Days Overdue',
      manual: 'Manual'
    };
    return labels[type] || type;
  }

  function getReminderTypeBadgeClass(type: string): string {
    if (type.startsWith('overdue')) return 'bg-red-100 text-red-800 border-red-300';
    if (type === 'approaching_7d') return 'bg-orange-100 text-orange-800 border-orange-300';
    if (type === 'manual') return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  }

  const filteredReminders = getFilteredReminders();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003865] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reminder data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Sent</h3>
              <Mail className="w-5 h-5 text-[#003865]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalSent}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">This Month</h3>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.sentThisMonth}</p>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Delivery Rate</h3>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.deliverySuccessRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Successfully delivered</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Manual Sends</h3>
              <Send className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.byType.manual}</p>
            <p className="text-xs text-gray-500 mt-1">Admin triggered</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Reminder Management</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSendModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors"
              >
                <Send size={16} />
                Send Reminder
              </button>
              <button
                onClick={() => setShowBulkModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mail size={16} />
                Bulk Send
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by jurisdiction or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="approaching_90d">90 Days Before</option>
              <option value="approaching_60d">60 Days Before</option>
              <option value="approaching_30d">30 Days Before</option>
              <option value="approaching_7d">7 Days Before</option>
              <option value="overdue_1d">1 Day Overdue</option>
              <option value="overdue_30d">30+ Days Overdue</option>
              <option value="manual">Manual</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
            <button
              onClick={loadData}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {filteredReminders.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No reminders found</p>
            <p className="text-gray-400 text-sm">
              {searchTerm || filterType !== 'all'
                ? 'Try adjusting your filters'
                : 'Send your first reminder to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date Sent</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Jurisdiction</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Year</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Recipient</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Triggered By</th>
                </tr>
              </thead>
              <tbody>
                {filteredReminders.map((reminder) => (
                  <tr
                    key={reminder.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(reminder.sent_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(reminder.sent_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{reminder.jurisdiction_name}</p>
                        <p className="text-xs text-gray-500">{reminder.jurisdiction_type}</p>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4 font-medium text-gray-900">
                      {reminder.report_year}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                        getReminderTypeBadgeClass(reminder.reminder_type)
                      }`}>
                        {getReminderTypeLabel(reminder.reminder_type)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="text-gray-700">{reminder.email_sent_to}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      {reminder.email_delivered ? (
                        <div className="flex items-center justify-center gap-1 text-green-600">
                          <CheckCircle size={16} />
                          <span className="text-xs font-medium">Delivered</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-red-600">
                          <XCircle size={16} />
                          <span className="text-xs font-medium">Failed</span>
                        </div>
                      )}
                    </td>
                    <td className="text-center py-3 px-4 text-gray-600">
                      {reminder.created_by || (
                        <span className="text-xs text-gray-400 italic">System</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredReminders.length} reminder{filteredReminders.length !== 1 ? 's' : ''}</span>
            <button
              onClick={() => {}}
              className="inline-flex items-center gap-2 text-[#003865] hover:text-[#004d7a] font-medium"
            >
              <Download size={16} />
              Export to CSV
            </button>
          </div>
        </div>
      </div>

      {analytics && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reminder Breakdown by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analytics.byType).map(([type, count]) => (
              <div key={type} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">{getReminderTypeLabel(type)}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#003865] h-2 rounded-full"
                    style={{ width: `${analytics.totalSent > 0 ? (count / analytics.totalSent) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSendModal && (
        <SendReminderModal
          jurisdictions={jurisdictions}
          contacts={contacts}
          onClose={() => setShowSendModal(false)}
          onSuccess={() => {
            setShowSendModal(false);
            loadData();
          }}
        />
      )}

      {showBulkModal && (
        <BulkSendModal
          jurisdictions={jurisdictions}
          contacts={contacts}
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => {
            setShowBulkModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function SendReminderModal({
  jurisdictions,
  contacts,
  onClose,
  onSuccess
}: {
  jurisdictions: Jurisdiction[];
  contacts: Contact[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('');
  const [reminderType, setReminderType] = useState<string>('manual');
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>('');

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (selectedJurisdiction) {
      const primaryContact = contacts.find(c => c.jurisdiction_id === selectedJurisdiction);
      if (primaryContact) {
        setRecipientEmail(primaryContact.email);
      }
    }
  }, [selectedJurisdiction, contacts]);

  async function handleSend() {
    if (!selectedJurisdiction || !recipientEmail || !reminderType) {
      setError('Please fill in all required fields');
      return;
    }

    setSending(true);
    setError('');

    try {
      const jurisdiction = jurisdictions.find(j => j.id === selectedJurisdiction);
      const reportYear = jurisdiction?.next_report_year || currentYear;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-submission-reminder`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jurisdictionId: selectedJurisdiction,
            reportYear,
            reminderType,
            recipientEmail,
            manualTrigger: true,
            triggeredBy: 'admin@admin.com'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send reminder');
      }

      onSuccess();
    } catch (err) {
      console.error('Error sending reminder:', err);
      setError('Failed to send reminder. Please try again.');
    } finally {
      setSending(false);
    }
  }

  const selectedJurisdictionData = jurisdictions.find(j => j.id === selectedJurisdiction);
  const deadlineInfo = selectedJurisdictionData
    ? getDeadlineInfo(selectedJurisdictionData.next_report_year || currentYear)
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Send Manual Reminder</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Jurisdiction *
            </label>
            <select
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
            >
              <option value="">Choose a jurisdiction...</option>
              {jurisdictions.map((jurisdiction) => (
                <option key={jurisdiction.id} value={jurisdiction.id}>
                  {jurisdiction.name} ({jurisdiction.jurisdiction_id})
                </option>
              ))}
            </select>
          </div>

          {selectedJurisdictionData && deadlineInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Jurisdiction Status</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-blue-700">Report Year: <span className="font-semibold">{deadlineInfo.reportYear}</span></p>
                  <p className="text-blue-700">Deadline: <span className="font-semibold">{deadlineInfo.formattedDeadline}</span></p>
                </div>
                <div>
                  <p className="text-blue-700">Days Until Due: <span className="font-semibold">{deadlineInfo.daysUntilDue}</span></p>
                  <p className="text-blue-700">Status: <span className="font-semibold">{deadlineInfo.status}</span></p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Email *
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="contact@jurisdiction.gov"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be auto-filled with the primary contact email
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Type *
            </label>
            <select
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
            >
              <option value="manual">Manual Reminder</option>
              <option value="approaching_90d">90 Days Before Deadline</option>
              <option value="approaching_60d">60 Days Before Deadline</option>
              <option value="approaching_30d">30 Days Before Deadline</option>
              <option value="approaching_7d">7 Days Before Deadline</option>
              <option value="overdue_1d">1 Day Overdue</option>
              <option value="overdue_30d">30+ Days Overdue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Message (Optional)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
              placeholder="Add any additional notes or instructions..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !selectedJurisdiction || !recipientEmail}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} />
                Send Reminder
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkSendModal({
  jurisdictions,
  contacts,
  onClose,
  onSuccess
}: {
  jurisdictions: Jurisdiction[];
  contacts: Contact[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>([]);
  const [reminderType, setReminderType] = useState<string>('manual');
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentYear = new Date().getFullYear();

  function toggleJurisdiction(id: string) {
    setSelectedJurisdictions(prev =>
      prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]
    );
  }

  function selectAllOverdue() {
    const overdueJurisdictions = jurisdictions.filter(j => {
      const deadlineInfo = getDeadlineInfo(j.next_report_year || currentYear);
      return deadlineInfo.isOverdue;
    });
    setSelectedJurisdictions(overdueJurisdictions.map(j => j.id));
  }

  function selectAllDueSoon() {
    const dueSoonJurisdictions = jurisdictions.filter(j => {
      const deadlineInfo = getDeadlineInfo(j.next_report_year || currentYear);
      return deadlineInfo.isDueSoon;
    });
    setSelectedJurisdictions(dueSoonJurisdictions.map(j => j.id));
  }

  async function handleBulkSend() {
    setSending(true);
    setProgress(0);

    for (let i = 0; i < selectedJurisdictions.length; i++) {
      const jurisdictionId = selectedJurisdictions[i];
      const jurisdiction = jurisdictions.find(j => j.id === jurisdictionId);
      const contact = contacts.find(c => c.jurisdiction_id === jurisdictionId);

      if (jurisdiction && contact) {
        try {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-submission-reminder`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                jurisdictionId,
                reportYear: jurisdiction.next_report_year || currentYear,
                reminderType,
                recipientEmail: contact.email,
                recipientName: contact.name,
                manualTrigger: true,
                triggeredBy: 'admin@admin.com'
              })
            }
          );
        } catch (error) {
          console.error(`Failed to send reminder to ${jurisdiction.name}:`, error);
        }
      }

      setProgress(Math.round(((i + 1) / selectedJurisdictions.length) * 100));
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setSending(false);
    onSuccess();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Bulk Send Reminders</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAllOverdue}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Select All Overdue
            </button>
            <button
              onClick={selectAllDueSoon}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Select All Due Soon
            </button>
            <button
              onClick={() => setSelectedJurisdictions([])}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Selection
            </button>
            <span className="text-sm text-gray-600 ml-auto">
              {selectedJurisdictions.length} selected
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Type
            </label>
            <select
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
            >
              <option value="manual">Manual Reminder</option>
              <option value="approaching_90d">90 Days Before Deadline</option>
              <option value="approaching_60d">60 Days Before Deadline</option>
              <option value="approaching_30d">30 Days Before Deadline</option>
              <option value="approaching_7d">7 Days Before Deadline</option>
              <option value="overdue_1d">1 Day Overdue</option>
              <option value="overdue_30d">30+ Days Overdue</option>
            </select>
          </div>

          <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedJurisdictions.length === jurisdictions.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedJurisdictions(jurisdictions.map(j => j.id));
                        } else {
                          setSelectedJurisdictions([]);
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Jurisdiction</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact Email</th>
                </tr>
              </thead>
              <tbody>
                {jurisdictions.map((jurisdiction) => {
                  const contact = contacts.find(c => c.jurisdiction_id === jurisdiction.id);
                  const deadlineInfo = getDeadlineInfo(jurisdiction.next_report_year || currentYear);

                  return (
                    <tr
                      key={jurisdiction.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedJurisdictions.includes(jurisdiction.id)}
                          onChange={() => toggleJurisdiction(jurisdiction.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{jurisdiction.name}</p>
                        <p className="text-xs text-gray-500">{jurisdiction.jurisdiction_id}</p>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          deadlineInfo.isOverdue ? 'bg-red-100 text-red-800' :
                          deadlineInfo.isDueSoon ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {deadlineInfo.isOverdue ? `${deadlineInfo.daysOverdue}d overdue` :
                           deadlineInfo.isDueSoon ? `${deadlineInfo.daysUntilDue}d remaining` :
                           'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {contact?.email || 'No contact'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {sending && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Sending reminders...</span>
                <span className="text-sm font-bold text-blue-900">{progress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={sending}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleBulkSend}
            disabled={sending || selectedJurisdictions.length === 0}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Sending {selectedJurisdictions.length} Reminders...
              </>
            ) : (
              <>
                <Send size={16} />
                Send {selectedJurisdictions.length} Reminder{selectedJurisdictions.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
