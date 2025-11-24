import { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  Mail,
  Calendar,
  Filter,
  RefreshCw,
  FileText,
  Bell,
  Eye,
  MessageSquare,
  BarChart3,
  Users
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  supabase,
  type Jurisdiction,
  type Report,
  type ComplianceHistory,
  type SubmissionReminder
} from '../lib/supabase';
import {
  getDeadlineInfo,
  formatDaysRemaining,
  getStatusBadgeClasses,
  getStatusLabel,
  getSeverityBadgeClasses,
  getSeverityLabel,
  type SubmissionStatus,
  type DeadlineInfo
} from '../lib/deadlineCalculator';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { ReminderManagement } from './ReminderManagement';

type JurisdictionWithStatus = Jurisdiction & {
  latestReport: Report | null;
  deadlineInfo: DeadlineInfo;
  lastReminderSent: SubmissionReminder | null;
  complianceHistory: ComplianceHistory[];
  contactEmail: string;
};

type FilterType = 'all' | 'in_compliance' | 'out_of_compliance' | 'pending' | 'overdue' | 'due_soon';

type AnalyticsMetrics = {
  totalJurisdictions: number;
  inCompliance: number;
  outOfCompliance: number;
  pendingSubmissions: number;
  overdueSubmissions: number;
  dueSoon: number;
  complianceRate: number;
  overdueBySeverity: {
    critical: number;
    high: number;
    medium: number;
  };
};

type ComplianceTrend = {
  reportYear: number;
  totalSubmissions: number;
  inCompliance: number;
  outOfCompliance: number;
  complianceRate: number;
};

export function EnhancedSubmissionAnalytics({ onNavigate }: { onNavigate: (view: string, data?: any) => void }) {
  useScrollToTop();

  const [jurisdictions, setJurisdictions] = useState<JurisdictionWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<'name' | 'deadline' | 'status'>('deadline');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'jurisdictions' | 'trends' | 'reminders'>('overview');
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [trends, setTrends] = useState<ComplianceTrend[]>([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionWithStatus | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [
        jurisdictionsData,
        reportsData,
        complianceHistoryData,
        remindersData
      ] = await Promise.all([
        supabase.from('jurisdictions').select('*').order('name'),
        supabase.from('reports').select('*').order('report_year', { ascending: false }),
        supabase.from('compliance_history').select('*').order('report_year', { ascending: false }),
        supabase.from('submission_reminders').select('*').order('sent_at', { ascending: false })
      ]);

      if (jurisdictionsData.error) throw jurisdictionsData.error;
      if (reportsData.error) throw reportsData.error;
      if (complianceHistoryData.error) throw complianceHistoryData.error;
      if (remindersData.error) throw remindersData.error;

      const currentYear = new Date().getFullYear();
      const jurisdictionsWithStatus: JurisdictionWithStatus[] = (jurisdictionsData.data || []).map(jurisdiction => {
        const nextReportYear = jurisdiction.next_report_year || currentYear;

        const jurisdictionReports = (reportsData.data || []).filter(
          r => r.jurisdiction_id === jurisdiction.id && r.report_year === nextReportYear
        );

        const latestReport = jurisdictionReports.length > 0 ? jurisdictionReports[0] : null;

        const hasSubmitted = latestReport?.case_status === 'Submitted';
        const isCompliant = latestReport?.compliance_status === 'In Compliance' ? true :
                           latestReport?.compliance_status === 'Out of Compliance' ? false : null;

        const deadlineInfo = getDeadlineInfo(nextReportYear, hasSubmitted, isCompliant);

        const jurisdictionReminders = (remindersData.data || []).filter(
          r => r.jurisdiction_id === jurisdiction.id && r.report_year === nextReportYear
        );
        const lastReminderSent = jurisdictionReminders.length > 0 ? jurisdictionReminders[0] : null;

        const historyRecords = (complianceHistoryData.data || []).filter(
          h => h.jurisdiction_id === jurisdiction.id
        );

        return {
          ...jurisdiction,
          latestReport,
          deadlineInfo,
          lastReminderSent,
          complianceHistory: historyRecords,
          contactEmail: ''
        };
      });

      setJurisdictions(jurisdictionsWithStatus);
      calculateMetrics(jurisdictionsWithStatus);
      calculateTrends(complianceHistoryData.data || []);

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function calculateMetrics(jurisdictions: JurisdictionWithStatus[]) {
    const inCompliance = jurisdictions.filter(j => j.deadlineInfo.status === 'submitted_compliant').length;
    const outOfCompliance = jurisdictions.filter(j => j.deadlineInfo.status === 'submitted_non_compliant').length;
    const pendingSubmissions = jurisdictions.filter(j =>
      j.deadlineInfo.status === 'pending' || j.deadlineInfo.status === 'due_soon'
    ).length;
    const overdueSubmissions = jurisdictions.filter(j => j.deadlineInfo.status === 'overdue').length;
    const dueSoon = jurisdictions.filter(j => j.deadlineInfo.status === 'due_soon').length;

    const overdueJurisdictions = jurisdictions.filter(j => j.deadlineInfo.isOverdue);
    const critical = overdueJurisdictions.filter(j => j.deadlineInfo.overdueSeverity === 'critical').length;
    const high = overdueJurisdictions.filter(j => j.deadlineInfo.overdueSeverity === 'high').length;
    const medium = overdueJurisdictions.filter(j => j.deadlineInfo.overdueSeverity === 'medium').length;

    const complianceRate = inCompliance + outOfCompliance > 0
      ? (inCompliance / (inCompliance + outOfCompliance)) * 100
      : 0;

    setMetrics({
      totalJurisdictions: jurisdictions.length,
      inCompliance,
      outOfCompliance,
      pendingSubmissions,
      overdueSubmissions,
      dueSoon,
      complianceRate,
      overdueBySeverity: {
        critical,
        high,
        medium
      }
    });
  }

  function calculateTrends(complianceHistory: ComplianceHistory[]) {
    const yearMap = new Map<number, { total: number; compliant: number; nonCompliant: number }>();

    complianceHistory.forEach(record => {
      if (!yearMap.has(record.report_year)) {
        yearMap.set(record.report_year, { total: 0, compliant: 0, nonCompliant: 0 });
      }
      const yearData = yearMap.get(record.report_year)!;
      yearData.total++;
      if (record.compliance_status === 'In Compliance') {
        yearData.compliant++;
      } else {
        yearData.nonCompliant++;
      }
    });

    const trendsArray: ComplianceTrend[] = Array.from(yearMap.entries())
      .map(([year, data]) => ({
        reportYear: year,
        totalSubmissions: data.total,
        inCompliance: data.compliant,
        outOfCompliance: data.nonCompliant,
        complianceRate: data.total > 0 ? (data.compliant / data.total) * 100 : 0
      }))
      .sort((a, b) => b.reportYear - a.reportYear)
      .slice(0, 5);

    setTrends(trendsArray);
  }

  function getFilteredJurisdictions() {
    let filtered = jurisdictions;

    if (filterType !== 'all') {
      filtered = filtered.filter(j => {
        switch (filterType) {
          case 'in_compliance':
            return j.deadlineInfo.status === 'submitted_compliant';
          case 'out_of_compliance':
            return j.deadlineInfo.status === 'submitted_non_compliant';
          case 'pending':
            return j.deadlineInfo.status === 'pending';
          case 'overdue':
            return j.deadlineInfo.status === 'overdue';
          case 'due_soon':
            return j.deadlineInfo.status === 'due_soon';
          default:
            return true;
        }
      });
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(j =>
        j.name.toLowerCase().includes(search) ||
        j.jurisdiction_id.toLowerCase().includes(search) ||
        j.jurisdiction_type.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'deadline':
          comparison = a.deadlineInfo.daysUntilDue - b.deadlineInfo.daysUntilDue;
          break;
        case 'status':
          comparison = getStatusLabel(a.deadlineInfo.status).localeCompare(getStatusLabel(b.deadlineInfo.status));
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  const filteredJurisdictions = getFilteredJurisdictions();

  function exportToExcel() {
    const exportData = filteredJurisdictions.map(j => ({
      'Jurisdiction': j.name,
      'Jurisdiction ID': j.jurisdiction_id,
      'Type': j.jurisdiction_type,
      'Report Year': j.deadlineInfo.reportYear,
      'Deadline': j.deadlineInfo.formattedDeadline,
      'Days Until Due': j.deadlineInfo.daysUntilDue,
      'Status': getStatusLabel(j.deadlineInfo.status),
      'Is Overdue': j.deadlineInfo.isOverdue ? 'Yes' : 'No',
      'Overdue Severity': j.deadlineInfo.isOverdue ? getSeverityLabel(j.deadlineInfo.overdueSeverity) : 'N/A',
      'Compliance Status': j.latestReport?.compliance_status || 'Not Submitted',
      'Last Reminder Sent': j.lastReminderSent ? new Date(j.lastReminderSent.sent_at).toLocaleDateString() : 'None',
      'Reminder Type': j.lastReminderSent ? j.lastReminderSent.reminder_type.replace('_', ' ') : 'N/A',
      'Address': j.address,
      'City': j.city,
      'State': j.state,
      'Zip Code': j.zipcode,
      'Phone': j.phone
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);

    const colWidths = [
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 20 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 30 },
      { wch: 20 },
      { wch: 8 },
      { wch: 10 },
      { wch: 15 }
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Submission Analytics');

    if (metrics) {
      const summaryData = [
        ['Submission Analytics Summary', ''],
        ['Generated', new Date().toLocaleString()],
        ['', ''],
        ['Metric', 'Value'],
        ['Total Jurisdictions', metrics.totalJurisdictions],
        ['In Compliance', metrics.inCompliance],
        ['Out of Compliance', metrics.outOfCompliance],
        ['Pending Submissions', metrics.pendingSubmissions],
        ['Overdue Submissions', metrics.overdueSubmissions],
        ['Due Soon (60 days)', metrics.dueSoon],
        ['Compliance Rate', `${metrics.complianceRate.toFixed(1)}%`],
        ['', ''],
        ['Overdue by Severity', ''],
        ['Critical (90+ days)', metrics.overdueBySeverity.critical],
        ['High (31-90 days)', metrics.overdueBySeverity.high],
        ['Medium (1-30 days)', metrics.overdueBySeverity.medium]
      ];

      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      summaryWs['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    }

    const fileName = `Submission_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003865] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submission analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submission Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive compliance and submission tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors"
          >
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>

      {metrics && metrics.overdueSubmissions > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-r-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">Overdue Submissions Alert</h3>
              <div className="space-y-1 text-sm text-red-800">
                <p>• {metrics.overdueSubmissions} jurisdiction{metrics.overdueSubmissions !== 1 ? 's' : ''} overdue</p>
                {metrics.overdueBySeverity.critical > 0 && (
                  <p>• {metrics.overdueBySeverity.critical} critical (90+ days)</p>
                )}
                {metrics.overdueBySeverity.high > 0 && (
                  <p>• {metrics.overdueBySeverity.high} high priority (31-90 days)</p>
                )}
              </div>
              <button
                onClick={() => {
                  setFilterType('overdue');
                  setSelectedTab('jurisdictions');
                }}
                className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 underline"
              >
                View overdue submissions →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'jurisdictions', label: 'All Jurisdictions', icon: Users },
            { id: 'trends', label: 'Historical Trends', icon: TrendingUp },
            { id: 'reminders', label: 'Reminder Management', icon: Bell }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === tab.id
                  ? 'border-[#003865] text-[#003865]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {selectedTab === 'overview' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border-2 border-green-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">In Compliance</h3>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{metrics.inCompliance}</p>
              <p className="text-xs text-gray-600">
                {metrics.complianceRate.toFixed(1)}% compliance rate
              </p>
              <button
                onClick={() => {
                  setFilterType('in_compliance');
                  setSelectedTab('jurisdictions');
                }}
                className="mt-3 text-xs text-green-700 hover:text-green-800 font-medium underline"
              >
                View details
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border-2 border-orange-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">Out of Compliance</h3>
                <XCircle className="w-8 h-8 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{metrics.outOfCompliance}</p>
              <p className="text-xs text-gray-600">
                Requires attention
              </p>
              <button
                onClick={() => {
                  setFilterType('out_of_compliance');
                  setSelectedTab('jurisdictions');
                }}
                className="mt-3 text-xs text-orange-700 hover:text-orange-800 font-medium underline"
              >
                View details
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border-2 border-yellow-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">Pending Submissions</h3>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{metrics.pendingSubmissions}</p>
              <p className="text-xs text-gray-600">
                {metrics.dueSoon} due within 60 days
              </p>
              <button
                onClick={() => {
                  setFilterType('due_soon');
                  setSelectedTab('jurisdictions');
                }}
                className="mt-3 text-xs text-yellow-700 hover:text-yellow-800 font-medium underline"
              >
                View due soon
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border-2 border-red-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">Overdue Submissions</h3>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{metrics.overdueSubmissions}</p>
              <p className="text-xs text-gray-600">
                Immediate action required
              </p>
              <button
                onClick={() => {
                  setFilterType('overdue');
                  setSelectedTab('jurisdictions');
                }}
                className="mt-3 text-xs text-red-700 hover:text-red-800 font-medium underline"
              >
                View overdue
              </button>
            </div>
          </div>

          {metrics.overdueSubmissions > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Overdue Breakdown by Severity</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border-2 border-red-600 rounded-lg bg-red-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-900">Critical (90+ days)</span>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-900">{metrics.overdueBySeverity.critical}</p>
                </div>
                <div className="p-4 border-2 border-orange-500 rounded-lg bg-orange-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-900">High (31-90 days)</span>
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-900">{metrics.overdueBySeverity.high}</p>
                </div>
                <div className="p-4 border-2 border-yellow-500 rounded-lg bg-yellow-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-yellow-900">Medium (1-30 days)</span>
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-900">{metrics.overdueBySeverity.medium}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'jurisdictions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jurisdictions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="in_compliance">In Compliance</option>
                <option value="out_of_compliance">Out of Compliance</option>
                <option value="pending">Pending</option>
                <option value="due_soon">Due Soon</option>
                <option value="overdue">Overdue</option>
              </select>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="deadline">Sort by Deadline</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Showing {filteredJurisdictions.length} of {jurisdictions.length} jurisdictions
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Jurisdiction</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Report Year</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Deadline</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Last Reminder</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJurisdictions.map((jurisdiction) => (
                    <tr
                      key={jurisdiction.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{jurisdiction.name}</p>
                          <p className="text-xs text-gray-500">{jurisdiction.jurisdiction_id}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{jurisdiction.jurisdiction_type}</td>
                      <td className="text-center py-3 px-4 font-medium text-gray-900">
                        {jurisdiction.deadlineInfo.reportYear}
                      </td>
                      <td className="text-center py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {jurisdiction.deadlineInfo.formattedDeadline}
                          </p>
                          <p className={`text-xs font-medium ${
                            jurisdiction.deadlineInfo.isOverdue ? 'text-red-600' :
                            jurisdiction.deadlineInfo.isDueSoon ? 'text-yellow-600' :
                            'text-gray-500'
                          }`}>
                            {formatDaysRemaining(jurisdiction.deadlineInfo.daysUntilDue)}
                          </p>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                          getStatusBadgeClasses(jurisdiction.deadlineInfo.status)
                        }`}>
                          {getStatusLabel(jurisdiction.deadlineInfo.status)}
                        </span>
                        {jurisdiction.deadlineInfo.isOverdue && (
                          <div className="mt-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                              getSeverityBadgeClasses(jurisdiction.deadlineInfo.overdueSeverity)
                            }`}>
                              {getSeverityLabel(jurisdiction.deadlineInfo.overdueSeverity)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="text-center py-3 px-4 text-xs text-gray-600">
                        {jurisdiction.lastReminderSent ? (
                          <div>
                            <p>{new Date(jurisdiction.lastReminderSent.sent_at).toLocaleDateString()}</p>
                            <p className="text-gray-500">{jurisdiction.lastReminderSent.reminder_type.replace('_', ' ')}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedJurisdiction(jurisdiction)}
                            className="p-1.5 text-[#003865] hover:bg-[#003865] hover:text-white rounded transition-colors"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="p-1.5 text-blue-600 hover:bg-blue-600 hover:text-white rounded transition-colors"
                            title="Send reminder"
                          >
                            <Mail size={16} />
                          </button>
                          <button
                            onClick={() => onNavigate('caseNotes', { jurisdictionId: jurisdiction.id })}
                            className="p-1.5 text-gray-600 hover:bg-gray-600 hover:text-white rounded transition-colors"
                            title="Add note"
                          >
                            <MessageSquare size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Rate Trends</h2>
            {trends.length > 0 ? (
              <div className="space-y-4">
                {trends.map((trend) => (
                  <div key={trend.reportYear} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">Report Year {trend.reportYear}</h3>
                        <p className="text-sm text-gray-600">
                          {trend.totalSubmissions} submission{trend.totalSubmissions !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{trend.complianceRate.toFixed(1)}%</p>
                        <p className="text-xs text-gray-600">Compliance Rate</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div className="flex h-full">
                        <div
                          className="bg-green-500 flex items-center justify-center text-xs font-medium text-white"
                          style={{ width: `${(trend.inCompliance / trend.totalSubmissions) * 100}%` }}
                        >
                          {trend.inCompliance > 0 && trend.inCompliance}
                        </div>
                        <div
                          className="bg-orange-500 flex items-center justify-center text-xs font-medium text-white"
                          style={{ width: `${(trend.outOfCompliance / trend.totalSubmissions) * 100}%` }}
                        >
                          {trend.outOfCompliance > 0 && trend.outOfCompliance}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded"></span>
                        In Compliance: {trend.inCompliance}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-orange-500 rounded"></span>
                        Out of Compliance: {trend.outOfCompliance}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No historical trend data available</p>
            )}
          </div>
        </div>
      )}

      {selectedTab === 'reminders' && (
        <ReminderManagement />
      )}

      {selectedJurisdiction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedJurisdiction.name}</h2>
                <button
                  onClick={() => setSelectedJurisdiction(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">{selectedJurisdiction.jurisdiction_id}</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Current Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Report Year</p>
                    <p className="text-lg font-bold text-gray-900">{selectedJurisdiction.deadlineInfo.reportYear}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Deadline</p>
                    <p className="text-lg font-bold text-gray-900">{selectedJurisdiction.deadlineInfo.formattedDeadline}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${
                      getStatusBadgeClasses(selectedJurisdiction.deadlineInfo.status)
                    }`}>
                      {getStatusLabel(selectedJurisdiction.deadlineInfo.status)}
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Time Remaining</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatDaysRemaining(selectedJurisdiction.deadlineInfo.daysUntilDue)}
                    </p>
                  </div>
                </div>
              </div>

              {selectedJurisdiction.complianceHistory.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Compliance History</h3>
                  <div className="space-y-2">
                    {selectedJurisdiction.complianceHistory.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Year {record.report_year}</p>
                          <p className="text-sm text-gray-600">
                            Submitted {new Date(record.submission_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.compliance_status === 'In Compliance'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {record.compliance_status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedJurisdiction(null);
                    if (selectedJurisdiction.latestReport) {
                      onNavigate('caseReview', { reportId: selectedJurisdiction.latestReport.id });
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors"
                >
                  View Full Report
                </button>
                <button
                  onClick={() => {
                    setSelectedJurisdiction(null);
                    onNavigate('caseNotes', { jurisdictionId: selectedJurisdiction.id });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Add Case Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
