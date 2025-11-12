export type ReportingYearInfo = {
  lastReportYear: number | null;
  currentCycleYear: number;
  isCurrentYearReporting: boolean;
  upcomingYears: number[];
};

export function calculateReportingYears(lastSubmittedYear: number | null): ReportingYearInfo {
  const currentYear = new Date().getFullYear();

  if (!lastSubmittedYear) {
    return {
      lastReportYear: null,
      currentCycleYear: currentYear,
      isCurrentYearReporting: true,
      upcomingYears: [currentYear, currentYear + 3, currentYear + 6]
    };
  }

  const yearsSinceLastReport = currentYear - lastSubmittedYear;
  const cyclePosition = yearsSinceLastReport % 3;

  let currentCycleYear: number;
  if (cyclePosition === 0) {
    currentCycleYear = currentYear;
  } else {
    currentCycleYear = currentYear + (3 - cyclePosition);
  }

  const isCurrentYearReporting = currentCycleYear === currentYear;

  const upcomingYears: number[] = [];
  if (isCurrentYearReporting) {
    upcomingYears.push(currentYear);
    upcomingYears.push(currentYear + 3);
    upcomingYears.push(currentYear + 6);
  } else {
    upcomingYears.push(currentCycleYear);
    upcomingYears.push(currentCycleYear + 3);
    upcomingYears.push(currentCycleYear + 6);
  }

  return {
    lastReportYear: lastSubmittedYear,
    currentCycleYear,
    isCurrentYearReporting,
    upcomingYears
  };
}

export function formatReportingYear(year: number, isCurrentYear: boolean): string {
  if (isCurrentYear && year === new Date().getFullYear()) {
    return `${year} (Current)`;
  }
  return year.toString();
}
