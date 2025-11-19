import React, { useState, useEffect } from 'react';
import { supabase, type Report, type SubmissionHistory, type ReportRevision, type Jurisdiction } from '../lib/supabase';
import { FileText, Clock, AlertTriangle, CheckCircle, TrendingUp, Filter, Search } from 'lucide-react';

interface SubmissionStats {
  totalSubmissions: number;
  resubmissions: number;
  pendingReview: number;
  averageRevisions: number;
}

export default function AdminSubmissionReview() {
  const [reports, setReports] = useState<(Report & { jurisdiction?: Jurisdiction })[]>([]);
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionHistory[]>([]);
  const [stats, setStats] = useState<SubmissionStats>({
    totalSubmissions: 0,
    resubmissions: 0,
    pendingReview: 0,
    averageRevisions: 0
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'resubmitted'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select(`
          *,
          jurisdiction:jurisdictions(*)
        `)
        .eq('case_status', 'Submitted')
        .order('submitted_at', { ascending: false });

      if (reportsError) throw reportsError;

      const { data: historyData, error: historyError } = await supabase
        .from('submission_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;

      setReports(reportsData || []);
      setSubmissionHistory(historyData || []);

      const totalSubmissions = reportsData?.length || 0;
      const resubmissions = reportsData?.filter(r => r.revision_count > 0).length || 0;
      const pendingReview = reportsData?.filter(r => r.approval_status === 'pending').length || 0;
      const avgRevisions = totalSubmissions > 0
        ? (reportsData?.reduce((sum, r) => sum + r.revision_count, 0) || 0) / totalSubmissions
        : 0;

      setStats({
        totalSubmissions,
        resubmissions,
        pendingReview,
        averageRevisions: Math.round(avgRevisions * 10) / 10
      });
    } catch (error) {
      console.error('Error loading submission data:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getFilteredReports() {
    let filtered = reports;

    if (filterStatus === 'resubmitted') {
      filtered = filtered.filter(r => r.revision_count > 0);
    } else if (filterStatus === 'submitted') {
      filtered = filtered.filter(r => r.revision_count === 0);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.jurisdiction?.name.toLowerCase().includes(search) ||
        r.jurisdiction?.jurisdiction_id.toLowerCase().includes(search) ||
        r.case_description.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  function getReportHistory(reportId: string) {
    return submissionHistory.filter(h => h.report_id === reportId);
  }

  const filteredReports = getFilteredReports();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submission data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Submission Analytics</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Submissions</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-orange-700 font-medium">Resubmissions</p>
                <p className="text-2xl font-bold text-orange-900">{stats.resubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-700 font-medium">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pendingReview}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-700 font-medium">Avg Revisions</p>
                <p className="text-2xl font-bold text-green-900">{stats.averageRevisions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Submissions</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Submissions</option>
              <option value="submitted">Initial Submissions</option>
              <option value="resubmitted">Resubmissions Only</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No submissions found</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const history = getReportHistory(report.id);
              const isExpanded = selectedReport === report.id;

              return (
                <div key={report.id} className="border border-gray-200 rounded-lg">
                  <div
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedReport(isExpanded ? null : report.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {report.jurisdiction?.name || 'Unknown Jurisdiction'}
                          </h3>
                          {report.revision_count > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                              <TrendingUp className="h-3 w-3" />
                              {report.revision_count} revision{report.revision_count !== 1 ? 's' : ''}
                            </span>
                          )}
                          {report.requires_manual_review && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                              <AlertTriangle className="h-3 w-3" />
                              Needs Review
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Year:</span>
                            <span className="ml-1 font-medium">{report.report_year}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Case:</span>
                            <span className="ml-1 font-medium">#{report.case_number}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Submitted:</span>
                            <span className="ml-1 font-medium">
                              {report.submitted_at ? formatDate(report.submitted_at) : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <span className="ml-1 font-medium">{report.compliance_status || 'Pending'}</span>
                          </div>
                        </div>
                        {report.revision_notes && (
                          <div className="mt-2 text-sm text-gray-600 italic">
                            Latest revision: "{report.revision_notes}"
                          </div>
                        )}
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        {isExpanded ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>

                  {isExpanded && history.length > 0 && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Submission History</h4>
                      <div className="space-y-2">
                        {history.map((entry) => (
                          <div key={entry.id} className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-900">
                                  {entry.action_type === 'submitted' && 'Initial Submission'}
                                  {entry.action_type === 'reopened' && 'Reopened for Editing'}
                                  {entry.action_type === 'resubmitted' && 'Resubmitted'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(entry.created_at)} by {entry.performed_by_email}
                                </p>
                                {entry.revision_notes && (
                                  <p className="text-sm text-gray-700 mt-2 italic">
                                    "{entry.revision_notes}"
                                  </p>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {entry.previous_status} → {entry.new_status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
