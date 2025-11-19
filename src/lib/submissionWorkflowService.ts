import { supabase, type Report, type SubmissionHistory, type ReportRevision } from './supabase';

export interface ReopenReportParams {
  reportId: string;
  userEmail: string;
  userId?: string;
}

export interface ResubmitReportParams {
  reportId: string;
  revisionNotes: string;
  userEmail: string;
  userId?: string;
  changesSummary?: {
    jobsModified?: number;
    jobsAdded?: number;
    jobsRemoved?: number;
    implementationModified?: boolean;
  };
}

export interface SubmitReportParams {
  reportId: string;
  userEmail: string;
  userId?: string;
}

export class SubmissionWorkflowService {
  static async reopenReport(params: ReopenReportParams): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: report, error: fetchError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', params.reportId)
        .single();

      if (fetchError) throw fetchError;
      if (!report) throw new Error('Report not found');

      if (report.case_status !== 'Submitted') {
        return { success: false, error: 'Only submitted reports can be reopened' };
      }

      const { error: updateError } = await supabase
        .from('reports')
        .update({
          case_status: 'Private',
          approval_status: 'draft',
          previous_submission_date: report.submitted_at,
          submitted_at: null,
          workflow_status: 'under_revision',
          updated_at: new Date().toISOString()
        })
        .eq('id', params.reportId);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error: any) {
      console.error('Error reopening report:', error);
      return { success: false, error: error.message || 'Failed to reopen report' };
    }
  }

  static async resubmitReport(params: ResubmitReportParams): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: report, error: fetchError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', params.reportId)
        .single();

      if (fetchError) throw fetchError;
      if (!report) throw new Error('Report not found');

      if (!params.revisionNotes || params.revisionNotes.trim() === '') {
        return { success: false, error: 'Revision notes are required for resubmission' };
      }

      const newRevisionCount = (report.revision_count || 0) + 1;

      const { error: updateError } = await supabase
        .from('reports')
        .update({
          case_status: 'Submitted',
          approval_status: 'draft',
          submitted_at: new Date().toISOString(),
          revision_count: newRevisionCount,
          revision_notes: params.revisionNotes,
          is_resubmission: true,
          workflow_status: 'resubmitted',
          updated_at: new Date().toISOString()
        })
        .eq('id', params.reportId);

      if (updateError) throw updateError;

      if (params.changesSummary) {
        const { error: revisionError } = await supabase
          .from('report_revisions')
          .insert({
            report_id: params.reportId,
            revision_number: newRevisionCount,
            revision_notes: params.revisionNotes,
            changes_summary: params.changesSummary,
            jobs_modified_count: params.changesSummary.jobsModified || 0,
            jobs_added_count: params.changesSummary.jobsAdded || 0,
            jobs_removed_count: params.changesSummary.jobsRemoved || 0,
            implementation_modified: params.changesSummary.implementationModified || false,
            created_by: params.userId || null,
            created_by_email: params.userEmail,
            created_at: new Date().toISOString()
          });

        if (revisionError) {
          console.error('Error saving revision details:', revisionError);
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error resubmitting report:', error);
      return { success: false, error: error.message || 'Failed to resubmit report' };
    }
  }

  static async submitReport(params: SubmitReportParams): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: report, error: fetchError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', params.reportId)
        .single();

      if (fetchError) throw fetchError;
      if (!report) throw new Error('Report not found');

      if (report.case_status === 'Submitted') {
        return { success: false, error: 'Report is already submitted' };
      }

      const { error: updateError } = await supabase
        .from('reports')
        .update({
          case_status: 'Submitted',
          submitted_at: new Date().toISOString(),
          workflow_status: 'submitted',
          updated_at: new Date().toISOString()
        })
        .eq('id', params.reportId);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error: any) {
      console.error('Error submitting report:', error);
      return { success: false, error: error.message || 'Failed to submit report' };
    }
  }

  static async getSubmissionHistory(reportId: string): Promise<SubmissionHistory[]> {
    try {
      const { data, error } = await supabase
        .from('submission_history')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching submission history:', error);
      return [];
    }
  }

  static async getReportRevisions(reportId: string): Promise<ReportRevision[]> {
    try {
      const { data, error } = await supabase
        .from('report_revisions')
        .select('*')
        .eq('report_id', reportId)
        .order('revision_number', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching report revisions:', error);
      return [];
    }
  }

  static async calculateChanges(reportId: string, previousJobsSnapshot?: any[]): Promise<{
    jobsModified: number;
    jobsAdded: number;
    jobsRemoved: number;
  }> {
    try {
      const { data: currentJobs, error } = await supabase
        .from('job_classifications')
        .select('*')
        .eq('report_id', reportId);

      if (error) throw error;

      if (!previousJobsSnapshot || previousJobsSnapshot.length === 0) {
        return {
          jobsModified: 0,
          jobsAdded: currentJobs?.length || 0,
          jobsRemoved: 0
        };
      }

      const currentJobIds = new Set(currentJobs?.map(j => j.id) || []);
      const previousJobIds = new Set(previousJobsSnapshot.map(j => j.id));

      const added = currentJobs?.filter(j => !previousJobIds.has(j.id)).length || 0;
      const removed = previousJobsSnapshot.filter(j => !currentJobIds.has(j.id)).length;

      const commonJobIds = [...currentJobIds].filter(id => previousJobIds.has(id));
      let modified = 0;

      for (const jobId of commonJobIds) {
        const currentJob = currentJobs?.find(j => j.id === jobId);
        const previousJob = previousJobsSnapshot.find(j => j.id === jobId);

        if (currentJob && previousJob) {
          const fieldsToCompare = ['title', 'males', 'females', 'points', 'min_salary', 'max_salary'];
          const hasChanges = fieldsToCompare.some(field =>
            currentJob[field as keyof typeof currentJob] !== previousJob[field as keyof typeof previousJob]
          );

          if (hasChanges) {
            modified++;
          }
        }
      }

      return {
        jobsModified: modified,
        jobsAdded: added,
        jobsRemoved: removed
      };
    } catch (error) {
      console.error('Error calculating changes:', error);
      return {
        jobsModified: 0,
        jobsAdded: 0,
        jobsRemoved: 0
      };
    }
  }

  static async canReopenReport(reportId: string): Promise<boolean> {
    try {
      const { data: report, error } = await supabase
        .from('reports')
        .select('case_status, approval_status')
        .eq('id', reportId)
        .single();

      if (error) throw error;
      if (!report) return false;

      return report.case_status === 'Submitted';
    } catch (error) {
      console.error('Error checking if report can be reopened:', error);
      return false;
    }
  }

  static getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'Private': 'gray',
      'Shared': 'blue',
      'Submitted': 'blue',
      'In Compliance': 'green',
      'Out of Compliance': 'red'
    };
    return colorMap[status] || 'gray';
  }

  static getWorkflowStatusLabel(workflowStatus: string): string {
    const labelMap: Record<string, string> = {
      'draft': 'Draft',
      'submitted': 'Submitted',
      'under_revision': 'Under Revision',
      'resubmitted': 'Resubmitted',
      'finalized': 'Finalized'
    };
    return labelMap[workflowStatus] || workflowStatus;
  }

  static formatRevisionSummary(revision: ReportRevision): string {
    const parts: string[] = [];

    if (revision.jobs_modified_count > 0) {
      parts.push(`${revision.jobs_modified_count} job${revision.jobs_modified_count !== 1 ? 's' : ''} modified`);
    }
    if (revision.jobs_added_count > 0) {
      parts.push(`${revision.jobs_added_count} job${revision.jobs_added_count !== 1 ? 's' : ''} added`);
    }
    if (revision.jobs_removed_count > 0) {
      parts.push(`${revision.jobs_removed_count} job${revision.jobs_removed_count !== 1 ? 's' : ''} removed`);
    }
    if (revision.implementation_modified) {
      parts.push('implementation form updated');
    }

    return parts.length > 0 ? parts.join(', ') : 'No changes tracked';
  }
}
