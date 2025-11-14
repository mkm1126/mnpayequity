import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, RotateCcw, ArrowLeft, Edit2, XCircle } from 'lucide-react';
import { JobClassification } from '../lib/supabase';
import { analyzeCompliance, ComplianceResult } from '../lib/complianceAnalysis';
import { ContextualHelp } from './ContextualHelp';

type WhatIfCalculatorProps = {
  jobs: JobClassification[];
  currentResult: ComplianceResult;
  onClose: () => void;
};

type FieldAdjustment = {
  jobId: string;
  originalJob: JobClassification;
  adjustedJob: Partial<JobClassification>;
};

type EditModalJob = {
  job: JobClassification;
  adjustedValues: Partial<JobClassification>;
} | null;

export function WhatIfCalculator({ jobs, currentResult, onClose }: WhatIfCalculatorProps) {
  const [adjustments, setAdjustments] = useState<Map<string, FieldAdjustment>>(new Map());
  const [scenarioResult, setScenarioResult] = useState<ComplianceResult | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [editModalJob, setEditModalJob] = useState<EditModalJob>(null);
  const [showQuickAdjustments, setShowQuickAdjustments] = useState(false);

  const femaleJobs = jobs.filter(job => {
    const total = job.males + job.females;
    return total > 0 && (job.females / total) >= 0.70;
  });
  const maleJobs = jobs.filter(job => {
    const total = job.males + job.females;
    return total > 0 && (job.males / total) >= 0.80;
  });

  useEffect(() => {
    calculateScenario();
  }, [adjustments]);

  const calculateScenario = () => {
    const adjustedJobs = jobs.map(job => {
      const adjustment = adjustments.get(job.id);
      if (adjustment) {
        return {
          ...job,
          ...adjustment.adjustedJob
        };
      }
      return job;
    });

    const result = analyzeCompliance(adjustedJobs);
    setScenarioResult(result);

    const cost = Array.from(adjustments.values()).reduce((sum, adj) => {
      const original = adj.originalJob;
      const adjusted = { ...original, ...adj.adjustedJob };

      const originalMaxAnnual = original.max_salary * (original.males + original.females) * 12;
      const adjustedMaxAnnual = (adjusted.max_salary || original.max_salary) *
        ((adjusted.males ?? original.males) + (adjusted.females ?? original.females)) * 12;

      return sum + (adjustedMaxAnnual - originalMaxAnnual);
    }, 0);
    setTotalCost(cost);
  };

  const handleAdjustField = (jobId: string, field: keyof JobClassification, value: any) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const currentAdjustment = adjustments.get(jobId);
    const adjustedJob = currentAdjustment?.adjustedJob || {};

    const newAdjustedJob = {
      ...adjustedJob,
      [field]: value
    };

    const hasChanges = Object.keys(newAdjustedJob).some(
      key => newAdjustedJob[key as keyof JobClassification] !== job[key as keyof JobClassification]
    );

    const newAdjustments = new Map(adjustments);
    if (hasChanges) {
      newAdjustments.set(jobId, {
        jobId,
        originalJob: job,
        adjustedJob: newAdjustedJob
      });
    } else {
      newAdjustments.delete(jobId);
    }
    setAdjustments(newAdjustments);
  };

  const handlePercentageAdjustment = (jobId: string, field: 'min_salary' | 'max_salary', percent: number) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const currentAdjustment = adjustments.get(jobId);
    const currentValue = currentAdjustment?.adjustedJob[field] ?? job[field];
    const newValue = currentValue * (1 + percent / 100);
    handleAdjustField(jobId, field, newValue);
  };

  const handleApplyToAll = (jobIds: string[], field: 'min_salary' | 'max_salary', percent: number) => {
    jobIds.forEach(jobId => {
      handlePercentageAdjustment(jobId, field, percent);
    });
  };

  const handleReset = () => {
    setAdjustments(new Map());
  };

  const getAdjustedValue = (jobId: string, field: keyof JobClassification) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return null;

    const adjustment = adjustments.get(jobId);
    return adjustment?.adjustedJob[field] ?? job[field];
  };

  const hasAnyChanges = (jobId: string) => {
    return adjustments.has(jobId);
  };

  const complianceImproved = scenarioResult && currentResult && (
    (scenarioResult.isCompliant && !currentResult.isCompliant) ||
    (scenarioResult.salaryRangeTest?.passed && !currentResult.salaryRangeTest?.passed) ||
    (scenarioResult.exceptionalServiceTest?.passed && !currentResult.exceptionalServiceTest?.passed)
  );

  const totalJobsModified = adjustments.size;

  const openEditModal = (job: JobClassification) => {
    const adjustment = adjustments.get(job.id);
    setEditModalJob({
      job,
      adjustedValues: adjustment?.adjustedJob || {}
    });
  };

  const saveEditModal = () => {
    if (!editModalJob) return;

    const { job, adjustedValues } = editModalJob;
    const hasChanges = Object.keys(adjustedValues).some(
      key => adjustedValues[key as keyof JobClassification] !== job[key as keyof JobClassification]
    );

    const newAdjustments = new Map(adjustments);
    if (hasChanges && Object.keys(adjustedValues).length > 0) {
      newAdjustments.set(job.id, {
        jobId: job.id,
        originalJob: job,
        adjustedJob: adjustedValues
      });
    } else {
      newAdjustments.delete(job.id);
    }
    setAdjustments(newAdjustments);
    setEditModalJob(null);
  };

  const updateEditModalField = (field: keyof JobClassification, value: any) => {
    if (!editModalJob) return;
    setEditModalJob({
      ...editModalJob,
      adjustedValues: {
        ...editModalJob.adjustedValues,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <ContextualHelp context="what-if-calculator" />

      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-[#003865] hover:text-[#004d7a] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Results
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All Changes
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">What-If Scenario Calculator</h1>
          <p className="text-gray-600">Model changes to job classifications and analyze compliance impact</p>
        </div>

        {complianceImproved && (
          <div className={`mb-6 p-5 rounded-xl ${
            scenarioResult?.isCompliant
              ? 'bg-emerald-50 border border-emerald-200'
              : 'bg-amber-50 border border-amber-200'
          }`}>
            <p className={`text-sm font-medium ${
              scenarioResult?.isCompliant
                ? 'text-emerald-800'
                : 'text-amber-800'
            }`}>
              {scenarioResult?.isCompliant
                ? 'These adjustments would bring your jurisdiction into compliance.'
                : 'These adjustments would improve your compliance status, but additional changes may be needed.'}
            </p>
          </div>
        )}

        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Scenario Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-white">
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Metric</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Current</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Scenario</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Change</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-white">
                  <td className="py-3 px-4 font-medium text-gray-700">Compliance Status</td>
                  <td className="text-center py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      currentResult.isCompliant
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {currentResult.isCompliant ? (
                        <><CheckCircle className="w-3 h-3" /> Compliant</>
                      ) : (
                        <><AlertCircle className="w-3 h-3" /> Non-Compliant</>
                      )}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      scenarioResult?.isCompliant
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {scenarioResult?.isCompliant ? (
                        <><CheckCircle className="w-3 h-3" /> Compliant</>
                      ) : (
                        <><AlertCircle className="w-3 h-3" /> Non-Compliant</>
                      )}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4 text-gray-900">
                    {complianceImproved ? (
                      <span className="text-emerald-600 font-medium">Improved</span>
                    ) : (
                      <span className="text-gray-500">No change</span>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-white">
                  <td className="py-3 px-4 font-medium text-gray-700">Jobs Modified</td>
                  <td className="text-center py-3 px-4 text-gray-900">-</td>
                  <td className="text-center py-3 px-4 font-bold text-gray-900">{totalJobsModified} of {jobs.length}</td>
                  <td className="text-center py-3 px-4 text-gray-900">
                    {totalJobsModified > 0 ? `${totalJobsModified} changed` : 'No changes'}
                  </td>
                </tr>
                <tr className="hover:bg-white">
                  <td className="py-3 px-4 font-medium text-gray-700">Annual Cost Impact</td>
                  <td className="text-center py-3 px-4 text-gray-900">$0.00</td>
                  <td className="text-center py-3 px-4 font-bold text-gray-900">
                    ${Math.abs(totalCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`font-medium ${totalCost > 0 ? 'text-rose-600' : totalCost < 0 ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {totalCost > 0 ? '+' : ''}{totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-8">
          <button
            onClick={() => setShowQuickAdjustments(!showQuickAdjustments)}
            className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <h2 className="text-xl font-bold text-gray-900">Quick Adjustments (Optional)</h2>
            <span className="text-sm text-gray-600">
              {showQuickAdjustments ? 'Hide' : 'Show'}
            </span>
          </button>

          {showQuickAdjustments && (
            <div className="mt-4 p-6 bg-white rounded-lg border border-gray-200">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Female-Dominated Classes ({femaleJobs.length} classes)
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">Apply salary increases to all female-dominated job classes:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleApplyToAll(femaleJobs.map(j => j.id), 'max_salary', 2)}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      +2% Max Salary
                    </button>
                    <button
                      onClick={() => handleApplyToAll(femaleJobs.map(j => j.id), 'max_salary', 5)}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      +5% Max Salary
                    </button>
                    <button
                      onClick={() => handleApplyToAll(femaleJobs.map(j => j.id), 'max_salary', 10)}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      +10% Max Salary
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Male-Dominated Classes ({maleJobs.length} classes)
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">Apply salary increases to all male-dominated job classes:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleApplyToAll(maleJobs.map(j => j.id), 'max_salary', 2)}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      +2% Max Salary
                    </button>
                    <button
                      onClick={() => handleApplyToAll(maleJobs.map(j => j.id), 'max_salary', 5)}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      +5% Max Salary
                    </button>
                    <button
                      onClick={() => handleApplyToAll(maleJobs.map(j => j.id), 'max_salary', 10)}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      +10% Max Salary
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Individual Job Adjustments</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50">
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Job Nbr</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Class Title</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Males</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Females</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Type</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">Max Salary</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Status</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const maleCount = job.males || 0;
                  const femaleCount = job.females || 0;
                  const total = maleCount + femaleCount;
                  const malePercent = total > 0 ? (maleCount / total) * 100 : 0;
                  const femalePercent = total > 0 ? (femaleCount / total) * 100 : 0;
                  const hasChanges = hasAnyChanges(job.id);
                  const adjustedMaxSalary = getAdjustedValue(job.id, 'max_salary') as number;

                  let classType = 'B';
                  let badgeColor = 'bg-gray-100 text-gray-800';

                  if (malePercent >= 80) {
                    classType = 'M';
                    badgeColor = 'bg-sky-100 text-sky-800';
                  } else if (femalePercent >= 70) {
                    classType = 'F';
                    badgeColor = 'bg-pink-100 text-pink-800';
                  }

                  return (
                    <tr key={job.id} className={`border-b border-gray-100 ${hasChanges ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <td className="py-3 px-4 text-gray-900">{job.job_number || ''}</td>
                      <td className="py-3 px-4 text-gray-900">{job.title || ''}</td>
                      <td className="text-center py-3 px-4 text-gray-900">{maleCount}</td>
                      <td className="text-center py-3 px-4 text-gray-900">{femaleCount}</td>
                      <td className="text-center py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${badgeColor}`}>
                          {classType}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        {adjustedMaxSalary !== job.max_salary ? (
                          <div>
                            <div className="font-bold text-blue-600">
                              ${adjustedMaxSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-gray-500 line-through">
                              ${job.max_salary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-900">
                            ${job.max_salary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        {hasChanges ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            Modified
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        <button
                          onClick={() => openEditModal(job)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-[#003865] hover:bg-[#003865] hover:text-white rounded-lg transition-colors border border-[#003865]"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {scenarioResult && (
          <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Scenario Test Results</h2>
            <div className="space-y-4">
              {scenarioResult.salaryRangeTest && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">Salary Range Test</h3>
                    {scenarioResult.salaryRangeTest.passed ? (
                      <span className="flex items-center gap-2 text-emerald-600 text-sm font-bold px-3 py-1.5 bg-emerald-50 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        Passed
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-rose-600 text-sm font-bold px-3 py-1.5 bg-rose-50 rounded-lg">
                        <XCircle className="w-4 h-4" />
                        Failed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">
                    Result: <span className="font-semibold">{(scenarioResult.salaryRangeTest.ratio * 100).toFixed(2)}%</span>
                  </p>
                </div>
              )}
              {scenarioResult.exceptionalServiceTest && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">Exceptional Service Pay Test</h3>
                    {scenarioResult.exceptionalServiceTest.passed ? (
                      <span className="flex items-center gap-2 text-emerald-600 text-sm font-bold px-3 py-1.5 bg-emerald-50 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        Passed
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-rose-600 text-sm font-bold px-3 py-1.5 bg-rose-50 rounded-lg">
                        <XCircle className="w-4 h-4" />
                        Failed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">
                    Result: <span className="font-semibold">{(scenarioResult.exceptionalServiceTest.ratio * 100).toFixed(2)}%</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Changes are not saved automatically. This calculator is for planning purposes only.
          </p>
        </div>
      </div>

      {editModalJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Edit Job: {editModalJob.job.title}</h2>
                <button
                  onClick={() => setEditModalJob(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Salary</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editModalJob.adjustedValues.min_salary ?? editModalJob.job.min_salary}
                    onChange={(e) => updateEditModalField('min_salary', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                  />
                  {editModalJob.adjustedValues.min_salary !== undefined && editModalJob.adjustedValues.min_salary !== editModalJob.job.min_salary && (
                    <p className="text-xs text-blue-600 mt-1">Original: ${editModalJob.job.min_salary.toFixed(2)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Salary</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editModalJob.adjustedValues.max_salary ?? editModalJob.job.max_salary}
                    onChange={(e) => updateEditModalField('max_salary', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                  />
                  {editModalJob.adjustedValues.max_salary !== undefined && editModalJob.adjustedValues.max_salary !== editModalJob.job.max_salary && (
                    <p className="text-xs text-blue-600 mt-1">Original: ${editModalJob.job.max_salary.toFixed(2)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Male Employees</label>
                  <input
                    type="number"
                    min="0"
                    value={editModalJob.adjustedValues.males ?? editModalJob.job.males}
                    onChange={(e) => updateEditModalField('males', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                  />
                  {editModalJob.adjustedValues.males !== undefined && editModalJob.adjustedValues.males !== editModalJob.job.males && (
                    <p className="text-xs text-blue-600 mt-1">Original: {editModalJob.job.males}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Female Employees</label>
                  <input
                    type="number"
                    min="0"
                    value={editModalJob.adjustedValues.females ?? editModalJob.job.females}
                    onChange={(e) => updateEditModalField('females', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                  />
                  {editModalJob.adjustedValues.females !== undefined && editModalJob.adjustedValues.females !== editModalJob.job.females && (
                    <p className="text-xs text-blue-600 mt-1">Original: {editModalJob.job.females}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Evaluation Points</label>
                  <input
                    type="number"
                    min="0"
                    value={editModalJob.adjustedValues.points ?? editModalJob.job.points}
                    onChange={(e) => updateEditModalField('points', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                  />
                  {editModalJob.adjustedValues.points !== undefined && editModalJob.adjustedValues.points !== editModalJob.job.points && (
                    <p className="text-xs text-blue-600 mt-1">Original: {editModalJob.job.points}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years to Maximum</label>
                  <input
                    type="number"
                    min="0"
                    value={editModalJob.adjustedValues.years_to_max ?? editModalJob.job.years_to_max}
                    onChange={(e) => updateEditModalField('years_to_max', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                  />
                  {editModalJob.adjustedValues.years_to_max !== undefined && editModalJob.adjustedValues.years_to_max !== editModalJob.job.years_to_max && (
                    <p className="text-xs text-blue-600 mt-1">Original: {editModalJob.job.years_to_max}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setEditModalJob(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveEditModal}
                className="px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
