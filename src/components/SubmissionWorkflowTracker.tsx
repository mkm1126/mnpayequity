import React, { useState, useEffect } from 'react';
import { supabase, type Report, type SubmissionHistory } from '../lib/supabase';
import { Clock, CheckCircle, AlertCircle, FileText, RotateCcw, Send } from 'lucide-react';

interface SubmissionWorkflowTrackerProps {
  report: Report;
  onReopenReport?: () => void;
}

export default function SubmissionWorkflowTracker({ report, onReopenReport }: SubmissionWorkflowTrackerProps) {
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTimeline, setShowTimeline] = useState(false);

  useEffect(() => {
    loadSubmissionHistory();
  }, [report.id]);

  async function loadSubmissionHistory() {
    try {
      const { data, error } = await supabase
        .from('submission_history')
        .select('*')
        .eq('report_id', report.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissionHistory(data || []);
    } catch (error) {
      console.error('Error loading submission history:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    const statusConfig = {
      'Private': { color: 'bg-gray-100 text-gray-700', icon: FileText, label: 'Draft' },
      'Shared': { color: 'bg-blue-100 text-blue-700', icon: FileText, label: 'Shared Draft' },
      'Submitted': { color: 'bg-blue-500 text-white', icon: Send, label: 'Submitted' },
      'In Compliance': { color: 'bg-green-500 text-white', icon: CheckCircle, label: 'In Compliance' },
      'Out of Compliance': { color: 'bg-red-500 text-white', icon: AlertCircle, label: 'Out of Compliance' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Private'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4" />
        {config.label}
      </span>
    );
  }

  function getActionIcon(actionType: string) {
    switch (actionType) {
      case 'submitted':
        return <Send className="h-5 w-5 text-blue-600" />;
      case 'reopened':
        return <RotateCcw className="h-5 w-5 text-orange-600" />;
      case 'resubmitted':
        return <Send className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  }

  function getActionLabel(actionType: string) {
    switch (actionType) {
      case 'submitted':
        return 'Initial Submission';
      case 'reopened':
        return 'Reopened for Editing';
      case 'resubmitted':
        return 'Resubmitted';
      default:
        return actionType;
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

  const isSubmitted = report.case_status === 'Submitted';
  const hasBeenSubmitted = report.submitted_at !== null || submissionHistory.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Submission Status</h3>
        {hasBeenSubmitted && (
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showTimeline ? 'Hide Timeline' : 'View Timeline'}
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">Current Status</p>
            {getStatusBadge(report.case_status)}
          </div>

          {report.revision_count > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Revisions</p>
              <p className="text-2xl font-bold text-gray-900">{report.revision_count}</p>
            </div>
          )}
        </div>

        {report.submitted_at && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {report.is_resubmission ? 'Last Resubmitted' : 'Submitted'}
                </p>
                <p className="text-sm text-blue-700">{formatDate(report.submitted_at)}</p>
                {report.revision_notes && (
                  <p className="text-sm text-blue-700 mt-1 italic">"{report.revision_notes}"</p>
                )}
              </div>
            </div>
          </div>
        )}

        {isSubmitted && onReopenReport && (
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={onReopenReport}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-300 rounded-lg transition-colors font-medium"
            >
              <RotateCcw className="h-5 w-5" />
              Reopen for Editing
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Need to make changes? Click here to unlock this report for editing.
            </p>
          </div>
        )}

        {showTimeline && submissionHistory.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Submission Timeline</h4>
            <div className="space-y-3">
              {submissionHistory.map((history, index) => (
                <div key={history.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                      {getActionIcon(history.action_type)}
                    </div>
                    {index < submissionHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 flex-1 mt-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-medium text-sm text-gray-900">
                        {getActionLabel(history.action_type)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatDate(history.created_at)}
                      </p>
                      {history.performed_by_email && (
                        <p className="text-xs text-gray-500 mt-1">
                          by {history.performed_by_email}
                        </p>
                      )}
                      {history.revision_notes && (
                        <p className="text-sm text-gray-700 mt-2 italic">
                          "{history.revision_notes}"
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <span className="text-gray-500">{history.previous_status}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium text-gray-700">{history.new_status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasBeenSubmitted && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              This report has not been submitted yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
