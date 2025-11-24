import { JobClassification } from './supabase';

export type JobWithPredictedPay = JobClassification & {
  predicted_pay: number;
  pay_difference: number;
  job_type: 'Male' | 'Female' | 'Balanced';
};

export type RegressionResult = {
  slope: number;
  intercept: number;
  rSquared: number;
  minPoints: number;
  maxPoints: number;
  minPredictedPay: number;
  maxPredictedPay: number;
};

export function calculateLinearRegression(
  jobs: JobClassification[]
): RegressionResult {
  const validJobs = jobs.filter(job => job.points > 0 && job.max_salary > 0);

  if (validJobs.length === 0) {
    return {
      slope: 0,
      intercept: 0,
      rSquared: 0,
      minPoints: 0,
      maxPoints: 0,
      minPredictedPay: 0,
      maxPredictedPay: 0,
    };
  }

  const n = validJobs.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  validJobs.forEach(job => {
    const x = job.points;
    const y = job.max_salary;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  let sumSquaredResiduals = 0;
  let sumSquaredTotal = 0;
  const meanY = sumY / n;

  validJobs.forEach(job => {
    const predictedY = slope * job.points + intercept;
    sumSquaredResiduals += Math.pow(job.max_salary - predictedY, 2);
    sumSquaredTotal += Math.pow(job.max_salary - meanY, 2);
  });

  const rSquared = 1 - (sumSquaredResiduals / sumSquaredTotal);

  const points = validJobs.map(j => j.points);
  const minPoints = Math.min(...points);
  const maxPoints = Math.max(...points);

  const minPredictedPay = slope * minPoints + intercept;
  const maxPredictedPay = slope * maxPoints + intercept;

  return {
    slope,
    intercept,
    rSquared,
    minPoints,
    maxPoints,
    minPredictedPay,
    maxPredictedPay,
  };
}

export function calculatePredictedPay(
  points: number,
  regression: RegressionResult
): number {
  return regression.slope * points + regression.intercept;
}

export function classifyJobType(job: JobClassification): 'Male' | 'Female' | 'Balanced' {
  const total = job.males + job.females;

  if (total === 0) return 'Balanced';

  const malePercentage = job.males / total;
  const femalePercentage = job.females / total;

  if (malePercentage >= 0.80) return 'Male';
  if (femalePercentage >= 0.70) return 'Female';
  return 'Balanced';
}

export function enrichJobsWithPredictedPay(
  jobs: JobClassification[]
): JobWithPredictedPay[] {
  const regression = calculateLinearRegression(jobs);

  return jobs.map(job => {
    const predicted_pay = calculatePredictedPay(job.points, regression);
    const pay_difference = job.max_salary - predicted_pay;
    const job_type = classifyJobType(job);

    return {
      ...job,
      predicted_pay,
      pay_difference,
      job_type,
    };
  });
}

export function getChartData(jobs: JobWithPredictedPay[], regression: RegressionResult) {
  const maleJobs = jobs.filter(j => j.job_type === 'Male');
  const femaleJobs = jobs.filter(j => j.job_type === 'Female');
  const balancedJobs = jobs.filter(j => j.job_type === 'Balanced');

  const regressionLinePoints = [
    { x: regression.minPoints, y: regression.minPredictedPay },
    { x: regression.maxPoints, y: regression.maxPredictedPay },
  ];

  const extendedMin = Math.max(-340, regression.minPoints - 500);
  const extendedMax = Math.min(2720, regression.maxPoints + 500);

  const lineExtensionPoints = [
    { x: extendedMin, y: regression.slope * extendedMin + regression.intercept },
    { x: extendedMax, y: regression.slope * extendedMax + regression.intercept },
  ];

  return {
    maleJobs: maleJobs.map(j => ({ x: j.points, y: j.max_salary })),
    femaleJobs: femaleJobs.map(j => ({ x: j.points, y: j.max_salary })),
    balancedJobs: balancedJobs.map(j => ({ x: j.points, y: j.max_salary })),
    regressionLine: regressionLinePoints,
    lineExtension: lineExtensionPoints,
  };
}
