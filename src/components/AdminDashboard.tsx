import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  Building2,
  Activity,
  Shield,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Search,
  Plus,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase, type Report, type Jurisdiction, type AdminCaseNote, type AdminActivityLog } from '../lib/supabase';
import { NotificationPanel } from './NotificationPanel';
import { useScrollToTop } from '../hooks/useScrollToTop';

type AdminDashboardProps = {
  onNavigate: (view: string, data?: any) => void;
};

type DashboardMetrics = {
  approvals: {
    pending: number;
    approved: number;
    rejected: number;
    manualReview: number;
    avgApprovalTime: number;
    byAge: {
      under24h: number;
      oneToThree: number;
      threeToSeven: number;
      overSeven: number;
    };
  };
  notes: {
    total: number;
    urgent: number;
    overdueFollowups: number;
    dueToday: number;
    dueThisWeek: number;
  };
  jurisdictions: {
    total: number;
    withActiveReports: number;
    inCompliance: number;
    outOfCompliance: number;
    needingAttention: number;
  };
  activity: {
    recentSubmissions7d: number;
    recentSubmissions30d: number;
    newUsers7d: number;
    activeUsers24h: number;
  };
};

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  useScrollToTop();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<AdminActivityLog[]>([]);
  const [urgentNotes, setUrgentNotes] = useState<AdminCaseNote[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      await Promise.all([
        loadMetrics(),
        loadRecentActivity(),
        loadUrgentNotes()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }

  async function loadMetrics() {
    try {
      const [
        reportsData,
        jurisdictionsData,
        notesData
      ] = await Promise.all([
        supabase.from('reports').select('*'),
        supabase.from('jurisdictions').select('*'),
        supabase.from('admin_case_notes').select('*')
      ]);

      if (reportsData.error) throw reportsData.error;
      if (jurisdictionsData.error) throw jurisdictionsData.error;
      if (notesData.error) throw notesData.error;

      const reports = reportsData.data || [];
      const jurisdictions = jurisdictionsData.data || [];
      const notes = notesData.data || [];

      const submittedReports = reports.filter(r => r.case_status === 'Submitted');
      const pendingReports = submittedReports.filter(r =>
        r.approval_status === 'pending' || r.approval_status === 'draft'
      );

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const byAge = {
        under24h: pendingReports.filter(r => r.submitted_at && new Date(r.submitted_at) > oneDayAgo).length,
        oneToThree: pendingReports.filter(r => r.submitted_at && new Date(r.submitted_at) > threeDaysAgo && new Date(r.submitted_at) <= oneDayAgo).length,
        threeToSeven: pendingReports.filter(r => r.submitted_at && new Date(r.submitted_at) > sevenDaysAgo && new Date(r.submitted_at) <= threeDaysAgo).length,
        overSeven: pendingReports.filter(r => r.submitted_at && new Date(r.submitted_at) <= sevenDaysAgo).length
      };

      const approvedReports = submittedReports.filter(r =>
        r.approval_status === 'approved' || r.approval_status === 'auto_approved'
      );

      let avgApprovalTime = 0;
      if (approvedReports.length > 0) {
        const totalTime = approvedReports.reduce((sum, r) => {
          if (r.submitted_at && r.approved_at) {
            return sum + (new Date(r.approved_at).getTime() - new Date(r.submitted_at).getTime());
          }
          return sum;
        }, 0);
        avgApprovalTime = Math.round(totalTime / approvedReports.length / (1000 * 60 * 60));
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      const followupNotes = notes.filter(n => n.category === 'follow-up' && !n.completed_at);
      const overdueFollowups = followupNotes.filter(n =>
        n.due_date && new Date(n.due_date) < today
      ).length;
      const dueToday = followupNotes.filter(n => {
        if (!n.due_date) return false;
        const dueDate = new Date(n.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      }).length;
      const dueThisWeek = followupNotes.filter(n =>
        n.due_date && new Date(n.due_date) >= today && new Date(n.due_date) <= endOfWeek
      ).length;

      const jurisdictionsWithReports = new Set(reports.map(r => r.jurisdiction_id)).size;
      const inCompliance = reports.filter(r => r.compliance_status === 'In Compliance').length;
      const outOfCompliance = reports.filter(r => r.compliance_status === 'Out of Compliance').length;

      const urgentNotesByJurisdiction = new Set(
        notes.filter(n => n.priority === 'urgent').map(n => n.jurisdiction_id)
      );

      setMetrics({
        approvals: {
          pending: pendingReports.length,
          approved: approvedReports.length,
          rejected: submittedReports.filter(r => r.approval_status === 'rejected').length,
          manualReview: submittedReports.filter(r => r.requires_manual_review).length,
          avgApprovalTime,
          byAge
        },
        notes: {
          total: notes.length,
          urgent: notes.filter(n => n.priority === 'urgent').length,
          overdueFollowups,
          dueToday,
          dueThisWeek
        },
        jurisdictions: {
          total: jurisdictions.length,
          withActiveReports: jurisdictionsWithReports,
          inCompliance,
          outOfCompliance,
          needingAttention: urgentNotesByJurisdiction.size
        },
        activity: {
          recentSubmissions7d: submittedReports.filter(r =>
            r.submitted_at && new Date(r.submitted_at) > sevenDaysAgo
          ).length,
          recentSubmissions30d: submittedReports.filter(r =>
            r.submitted_at && new Date(r.submitted_at) > thirtyDaysAgo
          ).length,
          newUsers7d: 0,
          activeUsers24h: 0
        }
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }

  async function loadRecentActivity() {
    try {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentActivity(data || []);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  }

  async function loadUrgentNotes() {
    try {
      const { data, error } = await supabase
        .from('admin_case_notes')
        .select('*')
        .eq('priority', 'urgent')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setUrgentNotes(data || []);
    } catch (error) {
      console.error('Error loading urgent notes:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003865] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">Unable to load dashboard metrics</p>
        <button
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const notificationCount = metrics.notes.urgent + metrics.notes.overdueFollowups + metrics.notes.dueToday;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome back, {userProfile?.email || 'Administrator'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh dashboard"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowNotificationPanel(!showNotificationPanel)}
            className="relative p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Notifications"
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {(metrics.notes.urgent > 0 || metrics.notes.overdueFollowups > 0 || metrics.notes.dueToday > 0) && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-r-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">Action Required</h3>
              <div className="space-y-1 text-sm text-red-800">
                {metrics.notes.urgent > 0 && (
                  <p>• {metrics.notes.urgent} urgent case note{metrics.notes.urgent !== 1 ? 's' : ''} requiring immediate attention</p>
                )}
                {metrics.notes.overdueFollowups > 0 && (
                  <p>• {metrics.notes.overdueFollowups} overdue follow-up{metrics.notes.overdueFollowups !== 1 ? 's' : ''}</p>
                )}
                {metrics.notes.dueToday > 0 && (
                  <p>• {metrics.notes.dueToday} follow-up{metrics.notes.dueToday !== 1 ? 's' : ''} due today</p>
                )}
              </div>
              <button
                onClick={() => setShowNotificationPanel(true)}
                className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 underline"
              >
                View all notifications →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('approvalDashboard')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-[#003865] transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600 group-hover:text-[#003865] transition-colors">
              Pending Review
            </h3>
            <Clock className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{metrics.approvals.pending}</p>
          {metrics.approvals.byAge.overSeven > 0 && (
            <p className="text-xs text-red-600 font-medium">
              {metrics.approvals.byAge.overSeven} over 7 days old
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2 group-hover:text-[#003865] transition-colors">
            Click to review cases
          </p>
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Cases Approved</h3>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{metrics.approvals.approved}</p>
          {metrics.approvals.avgApprovalTime > 0 && (
            <p className="text-xs text-gray-600">
              Avg: {metrics.approvals.avgApprovalTime}h to approve
            </p>
          )}
        </div>

        <button
          onClick={() => onNavigate('caseNotes')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-red-500 transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600 group-hover:text-red-600 transition-colors">
              Urgent Notes
            </h3>
            <AlertTriangle className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{metrics.notes.urgent}</p>
          <p className="text-xs text-gray-500 mt-2 group-hover:text-red-600 transition-colors">
            Requires immediate action
          </p>
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Follow-ups Due</h3>
            <Calendar className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{metrics.notes.dueThisWeek}</p>
          {metrics.notes.overdueFollowups > 0 && (
            <p className="text-xs text-red-600 font-medium">
              {metrics.notes.overdueFollowups} overdue
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Approval Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{metrics.approvals.byAge.under24h}</p>
                <p className="text-xs text-gray-600 mt-1">Under 24h</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{metrics.approvals.byAge.oneToThree}</p>
                <p className="text-xs text-gray-600 mt-1">1-3 days</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{metrics.approvals.byAge.threeToSeven}</p>
                <p className="text-xs text-gray-600 mt-1">3-7 days</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{metrics.approvals.byAge.overSeven}</p>
                <p className="text-xs text-gray-600 mt-1">Over 7 days</p>
              </div>
            </div>
            {metrics.approvals.manualReview > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <AlertCircle className="inline w-4 h-4 mr-1" />
                  {metrics.approvals.manualReview} case{metrics.approvals.manualReview !== 1 ? 's' : ''} require manual review
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Jurisdiction Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <p className="text-sm text-gray-600">Total Jurisdictions</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{metrics.jurisdictions.total}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <p className="text-sm text-gray-600">With Reports</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{metrics.jurisdictions.withActiveReports}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-sm text-gray-600">In Compliance</p>
                </div>
                <p className="text-2xl font-bold text-green-600">{metrics.jurisdictions.inCompliance}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <p className="text-sm text-gray-600">Out of Compliance</p>
                </div>
                <p className="text-2xl font-bold text-red-600">{metrics.jurisdictions.outOfCompliance}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <p className="text-sm text-gray-600">Need Attention</p>
                </div>
                <p className="text-2xl font-bold text-orange-600">{metrics.jurisdictions.needingAttention}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Activity className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.action_description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.admin_email} • {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('approvalDashboard')}
                className="w-full flex items-center justify-between p-3 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Eye size={18} />
                  <span className="font-medium">Review Pending Cases</span>
                </div>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('submissionReview')}
                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} />
                  <span className="font-medium">Submission Analytics</span>
                </div>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('caseNotes')}
                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Plus size={18} />
                  <span className="font-medium">Create Case Note</span>
                </div>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('userManagement')}
                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <span className="font-medium">User Management</span>
                </div>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('jurisdictionMaintenance')}
                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Building2 size={18} />
                  <span className="font-medium">Jurisdiction Maintenance</span>
                </div>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Submissions (7d)</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.activity.recentSubmissions7d}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Submissions (30d)</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.activity.recentSubmissions30d}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>

          {urgentNotes.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
              <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Recent Urgent Notes
              </h2>
              <div className="space-y-2">
                {urgentNotes.map(note => (
                  <button
                    key={note.id}
                    onClick={() => onNavigate('caseNotes', { noteId: note.id })}
                    className="w-full text-left p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <p className="text-sm font-medium text-red-900 truncate">{note.title}</p>
                    <p className="text-xs text-red-700 mt-1">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showNotificationPanel && (
        <NotificationPanel
          onClose={() => setShowNotificationPanel(false)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}
