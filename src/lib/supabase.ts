import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Jurisdiction = {
  id: string;
  jurisdiction_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  phone: string;
  fax: string;
  jurisdiction_type: string;
  next_report_year: number | null;
  follow_up_type: string;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Contact = {
  id: string;
  jurisdiction_id: string;
  name: string;
  title: string;
  is_primary: boolean;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
};

export type Report = {
  id: string;
  jurisdiction_id: string;
  report_year: number;
  case_number: number;
  case_description: string;
  case_status: 'Private' | 'Shared' | 'Submitted' | 'In Compliance' | 'Out of Compliance';
  compliance_status: string;
  submitted_at: string | null;
  alternative_analysis_notes: string | null;
  significant_changes_explanation: string | null;
  requires_manual_review: boolean;
  approval_status: 'draft' | 'pending' | 'approved' | 'rejected' | 'auto_approved';
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  certificate_generated_at: string | null;
  auto_approved: boolean;
  created_at: string;
  updated_at: string;
};

export type JobClassification = {
  id: string;
  report_id: string;
  job_number: number;
  title: string;
  males: number;
  females: number;
  points: number;
  min_salary: number;
  max_salary: number;
  years_to_max: number;
  years_service_pay: number;
  exceptional_service_category: string;
  benefits_included_in_salary: number;
  is_part_time: boolean;
  hours_per_week: number | null;
  days_per_year: number | null;
  additional_cash_compensation: number;
  created_at: string;
  updated_at: string;
};

export type ImplementationReport = {
  id: string;
  report_id: string;
  evaluation_system: string;
  evaluation_description: string;
  health_benefits_evaluated: string;
  health_benefits_description: string;
  notice_location: string;
  approved_by_body: string;
  chief_elected_official: string;
  official_title: string;
  approval_confirmed: boolean;
  total_payroll: number | null;
  created_at: string;
  updated_at: string;
};

export type SubmissionChecklist = {
  id: string;
  report_id: string;
  job_evaluation_complete: boolean;
  jobs_data_entered: boolean;
  benefits_evaluated: boolean;
  compliance_reviewed: boolean;
  implementation_form_complete: boolean;
  governing_body_approved: boolean;
  total_payroll_entered: boolean;
  official_notice_posted: boolean;
  all_validations_passed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditLog = {
  id: string;
  jurisdiction_id: string;
  report_id: string | null;
  action_type: string;
  table_name: string;
  record_id: string | null;
  old_values: any;
  new_values: any;
  user_email: string | null;
  created_at: string;
};

export type BenefitsWorksheet = {
  id: string;
  report_id: string;
  lowest_points: number;
  highest_points: number;
  point_range: number;
  comparable_value_range: number;
  trigger_detected: boolean;
  trigger_explanation: string | null;
  benefits_data: any;
  created_at: string;
  updated_at: string;
};

export type EmailTemplate = {
  id: string;
  name: string;
  type: 'announcement' | 'fail_to_report';
  subject: string;
  body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type EmailLog = {
  id: string;
  email_type: string;
  report_year: number;
  jurisdiction_id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  body: string;
  sent_at: string;
  sent_by: string | null;
  delivery_status: 'sent' | 'failed' | 'pending';
  error_message: string | null;
  created_at: string;
};

export type EmailDraft = {
  id: string;
  email_type: string;
  report_year: number;
  subject: string;
  body: string;
  selected_jurisdictions: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: string;
  jurisdiction_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type ComplianceCertificate = {
  id: string;
  report_id: string;
  jurisdiction_id: string;
  report_year: number;
  certificate_data: string;
  file_name: string;
  generated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ApprovalHistory = {
  id: string;
  report_id: string;
  jurisdiction_id: string;
  action_type: string;
  previous_status: string | null;
  new_status: string;
  approved_by: string | null;
  reason: string | null;
  notes: string | null;
  created_at: string;
};

export type SystemConfig = {
  id: string;
  config_key: string;
  config_value: string;
  description: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type NoteCategory = 'general' | 'compliance' | 'follow-up' | 'issue' | 'data-quality' | 'communication' | 'approval' | 'other';
export type NotePriority = 'low' | 'medium' | 'high' | 'urgent';
export type NoteType = 'jurisdiction' | 'case';

export type AdminCaseNote = {
  id: string;
  note_type: NoteType;
  jurisdiction_id: string;
  report_id: string | null;
  title: string;
  content: string;
  category: NoteCategory;
  tags: string[];
  priority: NotePriority;
  is_pinned: boolean;
  due_date: string | null;
  completed_at: string | null;
  completed_by: string | null;
  created_by: string | null;
  created_by_email: string;
  created_at: string;
  updated_at: string;
  attachment_metadata: Record<string, any>;
};

export type DismissedNotification = {
  id: string;
  admin_user_id: string;
  note_id: string;
  dismissed_at: string;
  dismiss_reason: string | null;
};

export type NotificationPreferences = {
  id: string;
  admin_user_id: string;
  email_urgent_notes: boolean;
  email_overdue_followups: boolean;
  email_pending_approvals: boolean;
  email_daily_digest: boolean;
  email_weekly_digest: boolean;
  digest_time: string;
  do_not_disturb: boolean;
  dnd_start_time: string | null;
  dnd_end_time: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminActivityLog = {
  id: string;
  admin_user_id: string;
  admin_email: string;
  action_type: string;
  action_description: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type NoteFilter = {
  searchTerm: string;
  noteType: NoteType | 'all';
  categories: NoteCategory[];
  priorities: NotePriority[];
  jurisdictionId: string | null;
  reportId: string | null;
  authorEmail: string | null;
  tags: string[];
  dateFrom: string | null;
  dateTo: string | null;
  showPinnedOnly: boolean;
};

export type NoteSortOption = 'updated_desc' | 'updated_asc' | 'created_desc' | 'created_asc' | 'priority' | 'title_asc' | 'title_desc';

export type NoteStats = {
  totalNotes: number;
  jurisdictionNotes: number;
  caseNotes: number;
  byCategory: Record<NoteCategory, number>;
  byPriority: Record<NotePriority, number>;
  pinnedNotes: number;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
};
