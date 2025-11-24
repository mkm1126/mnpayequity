export type SubmissionStatus =
  | 'submitted_compliant'
  | 'submitted_non_compliant'
  | 'due_soon'
  | 'pending'
  | 'overdue'
  | 'unknown';

export type OverdueSeverity = 'critical' | 'high' | 'medium' | 'none';

export interface DeadlineInfo {
  reportYear: number;
  deadlineDate: Date;
  daysUntilDue: number;
  daysOverdue: number;
  status: SubmissionStatus;
  overdueSeverity: OverdueSeverity;
  isOverdue: boolean;
  isDueSoon: boolean;
  formattedDeadline: string;
}

export function calculateDeadline(reportYear: number): Date {
  return new Date(reportYear, 0, 31);
}

export function getDaysUntilDeadline(reportYear: number, currentDate: Date = new Date()): number {
  const deadline = calculateDeadline(reportYear);
  const diffTime = deadline.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getDaysOverdue(reportYear: number, currentDate: Date = new Date()): number {
  const daysUntil = getDaysUntilDeadline(reportYear, currentDate);
  return daysUntil < 0 ? Math.abs(daysUntil) : 0;
}

export function getOverdueSeverity(daysOverdue: number): OverdueSeverity {
  if (daysOverdue === 0) return 'none';
  if (daysOverdue >= 90) return 'critical';
  if (daysOverdue >= 31) return 'high';
  return 'medium';
}

export function getSubmissionStatus(
  hasSubmittedReport: boolean,
  isCompliant: boolean | null,
  reportYear: number,
  currentDate: Date = new Date()
): SubmissionStatus {
  if (hasSubmittedReport) {
    if (isCompliant === true) return 'submitted_compliant';
    if (isCompliant === false) return 'submitted_non_compliant';
    return 'submitted_compliant';
  }

  const daysUntil = getDaysUntilDeadline(reportYear, currentDate);

  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 60) return 'due_soon';
  return 'pending';
}

export function getDeadlineInfo(
  reportYear: number,
  hasSubmittedReport: boolean = false,
  isCompliant: boolean | null = null,
  currentDate: Date = new Date()
): DeadlineInfo {
  const deadlineDate = calculateDeadline(reportYear);
  const daysUntilDue = getDaysUntilDeadline(reportYear, currentDate);
  const daysOverdue = getDaysOverdue(reportYear, currentDate);
  const status = getSubmissionStatus(hasSubmittedReport, isCompliant, reportYear, currentDate);
  const overdueSeverity = getOverdueSeverity(daysOverdue);
  const isOverdue = daysOverdue > 0;
  const isDueSoon = daysUntilDue > 0 && daysUntilDue <= 60;

  return {
    reportYear,
    deadlineDate,
    daysUntilDue,
    daysOverdue,
    status,
    overdueSeverity,
    isOverdue,
    isDueSoon,
    formattedDeadline: deadlineDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  };
}

export function formatDaysRemaining(days: number): string {
  if (days < 0) {
    const overdue = Math.abs(days);
    if (overdue === 1) return '1 day overdue';
    return `${overdue} days overdue`;
  }
  if (days === 0) return 'Due today';
  if (days === 1) return '1 day remaining';
  return `${days} days remaining`;
}

export function getStatusColor(status: SubmissionStatus): string {
  switch (status) {
    case 'submitted_compliant':
      return 'green';
    case 'submitted_non_compliant':
      return 'orange';
    case 'due_soon':
      return 'yellow';
    case 'pending':
      return 'gray';
    case 'overdue':
      return 'red';
    default:
      return 'gray';
  }
}

export function getStatusBadgeClasses(status: SubmissionStatus): string {
  switch (status) {
    case 'submitted_compliant':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'submitted_non_compliant':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'due_soon':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'pending':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'overdue':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

export function getStatusLabel(status: SubmissionStatus): string {
  switch (status) {
    case 'submitted_compliant':
      return 'In Compliance';
    case 'submitted_non_compliant':
      return 'Out of Compliance';
    case 'due_soon':
      return 'Due Soon';
    case 'pending':
      return 'Pending Submission';
    case 'overdue':
      return 'Overdue';
    default:
      return 'Unknown';
  }
}

export function getSeverityBadgeClasses(severity: OverdueSeverity): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-600 text-white';
    case 'high':
      return 'bg-orange-600 text-white';
    case 'medium':
      return 'bg-yellow-600 text-white';
    default:
      return 'bg-gray-400 text-white';
  }
}

export function getSeverityLabel(severity: OverdueSeverity): string {
  switch (severity) {
    case 'critical':
      return 'Critical (90+ days)';
    case 'high':
      return 'High (31-90 days)';
    case 'medium':
      return 'Medium (1-30 days)';
    default:
      return 'Not Overdue';
  }
}

export function shouldSendReminder(
  reportYear: number,
  lastReminderType: string | null,
  lastReminderDate: Date | null,
  currentDate: Date = new Date()
): { shouldSend: boolean; reminderType: string | null } {
  const daysUntil = getDaysUntilDeadline(reportYear, currentDate);
  const daysOverdue = getDaysOverdue(reportYear, currentDate);

  if (daysOverdue > 0) {
    if (daysOverdue === 1 && lastReminderType !== 'overdue_1d') {
      return { shouldSend: true, reminderType: 'overdue_1d' };
    }
    if (daysOverdue >= 30 && (!lastReminderDate ||
        (currentDate.getTime() - lastReminderDate.getTime()) >= 30 * 24 * 60 * 60 * 1000)) {
      return { shouldSend: true, reminderType: 'overdue_30d' };
    }
  } else {
    if (daysUntil <= 7 && daysUntil > 0 && lastReminderType !== 'approaching_7d') {
      return { shouldSend: true, reminderType: 'approaching_7d' };
    }
    if (daysUntil <= 30 && daysUntil > 7 && lastReminderType !== 'approaching_30d') {
      return { shouldSend: true, reminderType: 'approaching_30d' };
    }
    if (daysUntil <= 60 && daysUntil > 30 && lastReminderType !== 'approaching_60d') {
      return { shouldSend: true, reminderType: 'approaching_60d' };
    }
    if (daysUntil <= 90 && daysUntil > 60 && lastReminderType !== 'approaching_90d') {
      return { shouldSend: true, reminderType: 'approaching_90d' };
    }
  }

  return { shouldSend: false, reminderType: null };
}
