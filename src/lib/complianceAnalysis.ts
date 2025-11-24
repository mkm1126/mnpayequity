import { JobClassification } from './supabase';

export type ComplianceResult = {
  isCompliant: boolean;
  requiresManualReview: boolean;
  generalInfo: {
    maleClasses: number;
    femaleClasses: number;
    balancedClasses: number;
    totalClasses: number;
    maleEmployees: number;
    femaleEmployees: number;
    balancedEmployees: number;
    totalEmployees: number;
    avgMaxPayMale: number;
    avgMaxPayFemale: number;
    avgMaxPayBalanced: number;
    avgMaxPayAll: number;
  };
  statisticalTest: {
    underpaymentRatio: number;
    underpaymentRatioPassed: boolean;
    maleClassesBelowPredicted: number;
    femaleClassesBelowPredicted: number;
    maleTotalClasses: number;
    femaleTotalClasses: number;
    malePercentBelowPredicted: number;
    femalePercentBelowPredicted: number;
    tTestDF: number;
    tTestValue: number;
    tTestPassed: boolean;
    tTestCriticalValue: number;
    avgDiffMale: number;
    avgDiffFemale: number;
  } | null;
  salaryRangeTest: {
    passed: boolean;
    applicable: boolean;
    maleAverage: number;
    femaleAverage: number;
    ratio: number;
    threshold: number;
    reason?: string;
  } | null;
  exceptionalServiceTest: {
    passed: boolean;
    applicable: boolean;
    malePercentage: number;
    femalePercentage: number;
    ratio: number;
    threshold: number;
    reason?: string;
  } | null;
  totalJobs: number;
  maleJobs: number;
  femaleJobs: number;
  message: string;
};

export function analyzeCompliance(jobs: JobClassification[]): ComplianceResult {
  if (jobs.length === 0) {
    return {
      isCompliant: false,
      requiresManualReview: false,
      generalInfo: {
        maleClasses: 0,
        femaleClasses: 0,
        balancedClasses: 0,
        totalClasses: 0,
        maleEmployees: 0,
        femaleEmployees: 0,
        balancedEmployees: 0,
        totalEmployees: 0,
        avgMaxPayMale: 0,
        avgMaxPayFemale: 0,
        avgMaxPayBalanced: 0,
        avgMaxPayAll: 0,
      },
      statisticalTest: null,
      salaryRangeTest: null,
      exceptionalServiceTest: null,
      totalJobs: 0,
      maleJobs: 0,
      femaleJobs: 0,
      message: 'No job classifications to analyze',
    };
  }

  // Use 80% threshold for male-dominated and 70% threshold for female-dominated
  // per Minnesota Local Government Pay Equity Act requirements:
  // - Male-dominated: 80% or more male
  // - Female-dominated: 70% or more female
  // - Balanced: less than 80% male AND less than 70% female
  const maleJobs = jobs.filter(job => {
    const total = job.males + job.females;
    if (total === 0) return false;
    return (job.males / total) >= 0.80;
  });

  const femaleJobs = jobs.filter(job => {
    const total = job.males + job.females;
    if (total === 0) return false;
    return (job.females / total) >= 0.70;
  });

  const balancedJobs = jobs.filter(job => {
    const total = job.males + job.females;
    if (total === 0) return false;
    const malePercent = job.males / total;
    const femalePercent = job.females / total;
    return malePercent < 0.80 && femalePercent < 0.70;
  });

  const generalInfo = calculateGeneralInfo(maleJobs, femaleJobs, balancedJobs, jobs);

  const statisticalTest = performStatisticalTest(maleJobs, femaleJobs, jobs);
  const salaryRangeTest = performSalaryRangeTest(maleJobs, femaleJobs);
  const exceptionalServiceTest = performExceptionalServiceTest(maleJobs, femaleJobs);

  if (maleJobs.length <= 3) {
    return {
      isCompliant: false,
      requiresManualReview: true,
      generalInfo,
      statisticalTest,
      salaryRangeTest,
      exceptionalServiceTest,
      totalJobs: jobs.length,
      maleJobs: maleJobs.length,
      femaleJobs: femaleJobs.length,
      message: 'Your jurisdiction has three or fewer male classes. Alternative Analysis (manual review) is required.',
    };
  }

  const isCompliant = salaryRangeTest.passed && exceptionalServiceTest.passed;

  return {
    isCompliant,
    requiresManualReview: false,
    generalInfo,
    statisticalTest,
    salaryRangeTest,
    exceptionalServiceTest,
    totalJobs: jobs.length,
    maleJobs: maleJobs.length,
    femaleJobs: femaleJobs.length,
    message: isCompliant
      ? 'Your jurisdiction is in compliance with pay equity requirements.'
      : 'Your jurisdiction is out of compliance. Please review the test results below.',
  };
}

function performSalaryRangeTest(
  maleJobs: JobClassification[],
  femaleJobs: JobClassification[]
) {
  const threshold = 0.80;

  if (maleJobs.length === 0 || femaleJobs.length === 0) {
    return {
      passed: true,
      applicable: false,
      maleAverage: 0,
      femaleAverage: 0,
      ratio: 0,
      threshold,
      reason: 'No male or female dominated jobs to compare',
    };
  }

  const maleAvgMaxSalary = maleJobs.reduce((sum, job) => sum + job.max_salary, 0) / maleJobs.length;
  const femaleAvgMaxSalary = femaleJobs.reduce((sum, job) => sum + job.max_salary, 0) / femaleJobs.length;

  // Calculate the ratio of female average max salary to male average max salary
  const ratio = maleAvgMaxSalary > 0 ? femaleAvgMaxSalary / maleAvgMaxSalary : 0;
  const passed = ratio >= threshold;

  return {
    passed,
    applicable: true,
    maleAverage: maleAvgMaxSalary,
    femaleAverage: femaleAvgMaxSalary,
    ratio,
    threshold,
    reason: passed
      ? 'Average female max salary ratio meets 80% threshold'
      : 'Average female max salary ratio below 80% threshold',
  };
}

function performExceptionalServiceTest(
  maleJobs: JobClassification[],
  femaleJobs: JobClassification[]
) {
  const threshold = 0.80;

  if (maleJobs.length === 0 || femaleJobs.length === 0) {
    return {
      passed: true,
      applicable: false,
      malePercentage: 0,
      femalePercentage: 0,
      ratio: 0,
      threshold,
      reason: 'No male or female dominated jobs to compare',
    };
  }

  const maleWithExceptionalService = maleJobs.filter(
    job => job.exceptional_service_category && job.exceptional_service_category.trim() !== ''
  ).length;

  const femaleWithExceptionalService = femaleJobs.filter(
    job => job.exceptional_service_category && job.exceptional_service_category.trim() !== ''
  ).length;

  const malePercentage = (maleWithExceptionalService / maleJobs.length) * 100;
  const femalePercentage = (femaleWithExceptionalService / femaleJobs.length) * 100;

  if (maleWithExceptionalService === 0 && femaleWithExceptionalService === 0) {
    return {
      passed: true,
      applicable: false,
      malePercentage: 0,
      femalePercentage: 0,
      ratio: 0,
      threshold,
      reason: 'Exceptional service pay not offered (blank for all jobs)',
    };
  }

  if (malePercentage <= 20) {
    return {
      passed: true,
      applicable: true,
      malePercentage,
      femalePercentage,
      ratio: 0,
      threshold,
      reason: 'Less than 20% of male jobs have exceptional service pay',
    };
  }

  if (femalePercentage === 0) {
    return {
      passed: false,
      applicable: true,
      malePercentage,
      femalePercentage,
      ratio: 0,
      threshold,
      reason: 'Male jobs have exceptional service pay but female jobs do not',
    };
  }

  const ratio = femalePercentage / malePercentage;
  const passed = ratio >= threshold;

  return {
    passed,
    applicable: true,
    malePercentage,
    femalePercentage,
    ratio,
    threshold,
    reason: passed ? 'Exceptional service pay ratio meets threshold' : 'Exceptional service pay ratio below threshold',
  };
}

function calculateGeneralInfo(
  maleJobs: JobClassification[],
  femaleJobs: JobClassification[],
  balancedJobs: JobClassification[],
  allJobs: JobClassification[]
) {
  const maleEmployees = maleJobs.reduce((sum, job) => sum + job.males, 0);
  const femaleEmployees = femaleJobs.reduce((sum, job) => sum + job.females, 0);
  const balancedEmployees = balancedJobs.reduce((sum, job) => sum + job.males + job.females, 0);
  const totalEmployees = allJobs.reduce((sum, job) => sum + job.males + job.females, 0);

  const avgMaxPayMale = maleJobs.length > 0
    ? maleJobs.reduce((sum, job) => sum + job.max_salary, 0) / maleJobs.length
    : 0;

  const avgMaxPayFemale = femaleJobs.length > 0
    ? femaleJobs.reduce((sum, job) => sum + job.max_salary, 0) / femaleJobs.length
    : 0;

  const avgMaxPayBalanced = balancedJobs.length > 0
    ? balancedJobs.reduce((sum, job) => sum + job.max_salary, 0) / balancedJobs.length
    : 0;

  const avgMaxPayAll = allJobs.length > 0
    ? allJobs.reduce((sum, job) => sum + job.max_salary, 0) / allJobs.length
    : 0;

  return {
    maleClasses: maleJobs.length,
    femaleClasses: femaleJobs.length,
    balancedClasses: balancedJobs.length,
    totalClasses: allJobs.length,
    maleEmployees,
    femaleEmployees,
    balancedEmployees,
    totalEmployees,
    avgMaxPayMale,
    avgMaxPayFemale,
    avgMaxPayBalanced,
    avgMaxPayAll,
  };
}

function calculatePredictedPay(points: number, allJobs: JobClassification[]): number {
  if (allJobs.length < 2) return 0;

  const sumX = allJobs.reduce((sum, job) => sum + job.points, 0);
  const sumY = allJobs.reduce((sum, job) => sum + job.max_salary, 0);
  const sumXY = allJobs.reduce((sum, job) => sum + (job.points * job.max_salary), 0);
  const sumX2 = allJobs.reduce((sum, job) => sum + (job.points * job.points), 0);
  const n = allJobs.length;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return slope * points + intercept;
}

function performStatisticalTest(
  maleJobs: JobClassification[],
  femaleJobs: JobClassification[],
  allJobs: JobClassification[]
) {
  if (maleJobs.length === 0 || femaleJobs.length === 0) {
    return {
      underpaymentRatio: 0,
      underpaymentRatioPassed: true,
      maleClassesBelowPredicted: 0,
      femaleClassesBelowPredicted: 0,
      maleTotalClasses: maleJobs.length,
      femaleTotalClasses: femaleJobs.length,
      malePercentBelowPredicted: 0,
      femalePercentBelowPredicted: 0,
      tTestDF: 0,
      tTestValue: 0,
      tTestPassed: true,
      tTestCriticalValue: 0,
      avgDiffMale: 0,
      avgDiffFemale: 0,
    };
  }

  const maleDiffs: number[] = [];
  const femaleDiffs: number[] = [];

  maleJobs.forEach(job => {
    const predicted = calculatePredictedPay(job.points, allJobs);
    const diff = job.max_salary - predicted;
    maleDiffs.push(diff);
  });

  femaleJobs.forEach(job => {
    const predicted = calculatePredictedPay(job.points, allJobs);
    const diff = job.max_salary - predicted;
    femaleDiffs.push(diff);
  });

  const maleClassesBelowPredicted = maleDiffs.filter(d => d < 0).length;
  const femaleClassesBelowPredicted = femaleDiffs.filter(d => d < 0).length;

  const malePercentBelowPredicted = (maleClassesBelowPredicted / maleJobs.length) * 100;
  const femalePercentBelowPredicted = (femaleClassesBelowPredicted / femaleJobs.length) * 100;

  const underpaymentRatio = femalePercentBelowPredicted === 0
    ? 0
    : (malePercentBelowPredicted / femalePercentBelowPredicted) * 100;

  const avgDiffMale = maleDiffs.reduce((sum, d) => sum + d, 0) / maleDiffs.length;
  const avgDiffFemale = femaleDiffs.reduce((sum, d) => sum + d, 0) / femaleDiffs.length;

  const varMale = maleDiffs.reduce((sum, d) => sum + Math.pow(d - avgDiffMale, 2), 0) / (maleDiffs.length - 1);
  const varFemale = femaleDiffs.reduce((sum, d) => sum + Math.pow(d - avgDiffFemale, 2), 0) / (femaleDiffs.length - 1);

  const pooledSE = Math.sqrt(varMale / maleDiffs.length + varFemale / femaleDiffs.length);
  const tTestValue = pooledSE > 0 ? (avgDiffMale - avgDiffFemale) / pooledSE : 0;
  const tTestDF = maleDiffs.length + femaleDiffs.length - 2;

  const tTestCriticalValue = getCriticalTValue(tTestDF);
  const tTestPassed = Math.abs(tTestValue) <= tTestCriticalValue;

  const underpaymentRatioPassed = underpaymentRatio >= 80;

  return {
    underpaymentRatio,
    underpaymentRatioPassed,
    maleClassesBelowPredicted,
    femaleClassesBelowPredicted,
    maleTotalClasses: maleJobs.length,
    femaleTotalClasses: femaleJobs.length,
    malePercentBelowPredicted,
    femalePercentBelowPredicted,
    tTestDF,
    tTestValue,
    tTestPassed,
    tTestCriticalValue,
    avgDiffMale,
    avgDiffFemale,
  };
}

function getCriticalTValue(df: number): number {
  const tTable: { [key: number]: number } = {
    1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
    6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
    11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
    16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086,
    21: 2.080, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.060,
    26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042,
    40: 2.021, 50: 2.009, 60: 2.000, 80: 1.990, 100: 1.984,
    120: 1.980,
  };

  if (df in tTable) {
    return tTable[df];
  }

  if (df > 120) {
    return 1.960;
  }

  const keys = Object.keys(tTable).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < keys.length - 1; i++) {
    if (df >= keys[i] && df < keys[i + 1]) {
      const lower = keys[i];
      const upper = keys[i + 1];
      const ratio = (df - lower) / (upper - lower);
      return tTable[lower] - ratio * (tTable[lower] - tTable[upper]);
    }
  }

  return 1.960;
}
