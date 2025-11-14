import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, AlertCircle, CheckCircle, RotateCcw, ChevronDown, ChevronUp, Eye, EyeOff, Users, Award, Clock, Gift, ArrowLeft } from 'lucide-react';
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

type ViewMode = 'simple' | 'advanced';
type VisibleColumns = {
  minSalary: boolean;
  maxSalary: boolean;
  employees: boolean;
  points: boolean;
  yearsToMax: boolean;
  yearsServicePay: boolean;
  exceptionalCategory: boolean;
  benefits: boolean;
  additionalComp: boolean;
};

export function WhatIfCalculator({ jobs, currentResult, onClose }: WhatIfCalculatorProps) {
  const [adjustments, setAdjustments] = useState<Map<string, FieldAdjustment>>(new Map());
  const [scenarioResult, setScenarioResult] = useState<ComplianceResult | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('simple');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    minSalary: true,
    maxSalary: true,
    employees: true,
    points: true,
    yearsToMax: true,
    yearsServicePay: false,
    exceptionalCategory: false,
    benefits: false,
    additionalComp: false,
  });

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
    setExpandedJobId(null);
  };

  const toggleColumn = (column: keyof VisibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
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

  const getChangeSummary = () => {
    const changes: { type: string; count: number }[] = [];
    const fieldCounts = new Map<string, number>();

    adjustments.forEach((adj) => {
      Object.keys(adj.adjustedJob).forEach(field => {
        fieldCounts.set(field, (fieldCounts.get(field) || 0) + 1);
      });
    });

    fieldCounts.forEach((count, field) => {
      const label = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      changes.push({ type: label, count });
    });

    return changes;
  };

  const complianceImproved = scenarioResult && currentResult && (
    (scenarioResult.isCompliant && !currentResult.isCompliant) ||
    (scenarioResult.salaryRangeTest?.passed && !currentResult.salaryRangeTest?.passed) ||
    (scenarioResult.exceptionalServiceTest?.passed && !currentResult.exceptionalServiceTest?.passed)
  );

  const changeSummary = getChangeSummary();
  const totalJobsModified = adjustments.size;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Results
        </button>
      </div>

      <ContextualHelp context="what-if-calculator" />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#003865] rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">What-If Scenario Calculator</h2>
              <p className="text-sm text-gray-600">Model changes to any job field to analyze compliance impact</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Current Status</h3>
                {currentResult.isCompliant ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <p className={`text-lg font-bold ${
                currentResult.isCompliant ? 'text-green-700' : 'text-red-700'
              }`}>
                {currentResult.isCompliant ? 'In Compliance' : 'Out of Compliance'}
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Scenario Result</h3>
                {scenarioResult?.isCompliant ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <p className={`text-lg font-bold ${
                scenarioResult?.isCompliant ? 'text-green-700' : 'text-red-700'
              }`}>
                {scenarioResult?.isCompliant ? 'Would Be Compliant' : 'Still Out of Compliance'}
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Annual Cost Impact</h3>
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Jobs Modified</h3>
                <Calculator className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                {totalJobsModified} of {jobs.length}
              </p>
            </div>
          </div>

          {complianceImproved && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Compliance Improvement Detected</p>
                  <p className="text-sm text-green-800 mt-1">
                    These adjustments would improve your compliance status. Review the changes below.
                  </p>
                </div>
              </div>
            </div>
          )}

          {changeSummary.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Change Summary</h4>
              <div className="flex flex-wrap gap-3 text-sm">
                {changeSummary.map(change => (
                  <span key={change.type} className="px-3 py-1 bg-white border border-blue-300 text-blue-900 rounded-full">
                    {change.type}: {change.count} {change.count === 1 ? 'job' : 'jobs'}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">View Mode</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('simple')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'simple'
                      ? 'bg-[#003865] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Simple
                </button>
                <button
                  onClick={() => setViewMode('advanced')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'advanced'
                      ? 'bg-[#003865] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Advanced
                </button>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All
            </button>
          </div>

          {viewMode === 'advanced' && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Column Visibility
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Select which fields to show when you expand a job below
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries({
                  minSalary: 'Min Salary',
                  maxSalary: 'Max Salary',
                  employees: 'Employee Counts',
                  points: 'Job Points',
                  yearsToMax: 'Years to Max',
                  yearsServicePay: 'Service Pay Years',
                  exceptionalCategory: 'Exceptional Category',
                  benefits: 'Benefits in Salary',
                  additionalComp: 'Additional Compensation'
                }).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleColumn(key as keyof VisibleColumns)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                      visibleColumns[key as keyof VisibleColumns]
                        ? 'bg-[#003865] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {visibleColumns[key as keyof VisibleColumns] ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Adjustments</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                <h4 className="font-semibold text-pink-900 mb-3">Female-Dominated Classes ({femaleJobs.length})</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-pink-800 mb-1">Max Salary Adjustments:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleApplyToAll(femaleJobs.map(j => j.id), 'max_salary', 2)}
                        className="px-3 py-1.5 bg-white border border-pink-300 text-pink-900 rounded-md hover:bg-pink-100 transition-colors text-sm"
                      >
                        +2% All
                      </button>
                      <button
                        onClick={() => handleApplyToAll(femaleJobs.map(j => j.id), 'max_salary', 5)}
                        className="px-3 py-1.5 bg-white border border-pink-300 text-pink-900 rounded-md hover:bg-pink-100 transition-colors text-sm"
                      >
                        +5% All
                      </button>
                      <button
                        onClick={() => handleApplyToAll(femaleJobs.map(j => j.id), 'max_salary', 10)}
                        className="px-3 py-1.5 bg-white border border-pink-300 text-pink-900 rounded-md hover:bg-pink-100 transition-colors text-sm"
                      >
                        +10% All
                      </button>
                    </div>
                  </div>
                  {viewMode === 'advanced' && (
                    <div>
                      <p className="text-xs text-pink-800 mb-1">Min Salary Adjustments:</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleApplyToAll(femaleJobs.map(j => j.id), 'min_salary', 2)}
                          className="px-3 py-1.5 bg-white border border-pink-300 text-pink-900 rounded-md hover:bg-pink-100 transition-colors text-sm"
                        >
                          +2% All
                        </button>
                        <button
                          onClick={() => handleApplyToAll(femaleJobs.map(j => j.id), 'min_salary', 5)}
                          className="px-3 py-1.5 bg-white border border-pink-300 text-pink-900 rounded-md hover:bg-pink-100 transition-colors text-sm"
                        >
                          +5% All
                        </button>
                        <button
                          onClick={() => handleApplyToAll(femaleJobs.map(j => j.id), 'min_salary', 10)}
                          className="px-3 py-1.5 bg-white border border-pink-300 text-pink-900 rounded-md hover:bg-pink-100 transition-colors text-sm"
                        >
                          +10% All
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">Male-Dominated Classes ({maleJobs.length})</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-blue-800 mb-1">Max Salary Adjustments:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleApplyToAll(maleJobs.map(j => j.id), 'max_salary', 2)}
                        className="px-3 py-1.5 bg-white border border-blue-300 text-blue-900 rounded-md hover:bg-blue-100 transition-colors text-sm"
                      >
                        +2% All
                      </button>
                      <button
                        onClick={() => handleApplyToAll(maleJobs.map(j => j.id), 'max_salary', 5)}
                        className="px-3 py-1.5 bg-white border border-blue-300 text-blue-900 rounded-md hover:bg-blue-100 transition-colors text-sm"
                      >
                        +5% All
                      </button>
                      <button
                        onClick={() => handleApplyToAll(maleJobs.map(j => j.id), 'max_salary', 10)}
                        className="px-3 py-1.5 bg-white border border-blue-300 text-blue-900 rounded-md hover:bg-blue-100 transition-colors text-sm"
                      >
                        +10% All
                      </button>
                    </div>
                  </div>
                  {viewMode === 'advanced' && (
                    <div>
                      <p className="text-xs text-blue-800 mb-1">Min Salary Adjustments:</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleApplyToAll(maleJobs.map(j => j.id), 'min_salary', 2)}
                          className="px-3 py-1.5 bg-white border border-blue-300 text-blue-900 rounded-md hover:bg-blue-100 transition-colors text-sm"
                        >
                          +2% All
                        </button>
                        <button
                          onClick={() => handleApplyToAll(maleJobs.map(j => j.id), 'min_salary', 5)}
                          className="px-3 py-1.5 bg-white border border-blue-300 text-blue-900 rounded-md hover:bg-blue-100 transition-colors text-sm"
                        >
                          +5% All
                        </button>
                        <button
                          onClick={() => handleApplyToAll(maleJobs.map(j => j.id), 'min_salary', 10)}
                          className="px-3 py-1.5 bg-white border border-blue-300 text-blue-900 rounded-md hover:bg-blue-100 transition-colors text-sm"
                        >
                          +10% All
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Job Adjustments</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {jobs.map(job => {
                const isExpanded = expandedJobId === job.id;
                const hasChanges = hasAnyChanges(job.id);
                const isFemale = job.females > 0 && job.males === 0;
                const isMale = job.males > 0 && job.females === 0;
                const genderLabel = isFemale ? 'Female' : isMale ? 'Male' : 'Balanced';

                return (
                  <div key={job.id} className={`border rounded-lg ${hasChanges ? 'border-[#003865] bg-blue-50' : 'border-gray-200 bg-white'}`}>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{job.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                isFemale ? 'bg-pink-100 text-pink-800' :
                                isMale ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {genderLabel}
                              </span>
                              <span className="text-xs text-gray-500">
                                {job.males}M / {job.females}F
                              </span>
                              <span className="text-xs text-gray-500">
                                Points: {job.points}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Current Range</p>
                          <p className="font-medium text-gray-900">
                            ${job.min_salary.toFixed(2)} - ${job.max_salary.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            {visibleColumns.minSalary && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  <DollarSign className="w-4 h-4 inline mr-1" />
                                  Minimum Salary
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={getAdjustedValue(job.id, 'min_salary') as number}
                                  onChange={(e) => handleAdjustField(job.id, 'min_salary', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                                />
                                {job.min_salary !== getAdjustedValue(job.id, 'min_salary') && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Original: ${job.min_salary.toFixed(2)}
                                  </p>
                                )}
                              </div>
                            )}

                            {visibleColumns.maxSalary && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  <DollarSign className="w-4 h-4 inline mr-1" />
                                  Maximum Salary
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={getAdjustedValue(job.id, 'max_salary') as number}
                                  onChange={(e) => handleAdjustField(job.id, 'max_salary', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                                />
                                {job.max_salary !== getAdjustedValue(job.id, 'max_salary') && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Original: ${job.max_salary.toFixed(2)}
                                  </p>
                                )}
                              </div>
                            )}

                            {visibleColumns.employees && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Users className="w-4 h-4 inline mr-1" />
                                    Male Employees
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={getAdjustedValue(job.id, 'males') as number}
                                    onChange={(e) => handleAdjustField(job.id, 'males', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                                  />
                                  {job.males !== getAdjustedValue(job.id, 'males') && (
                                    <p className="text-xs text-blue-600 mt-1">
                                      Original: {job.males}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Users className="w-4 h-4 inline mr-1" />
                                    Female Employees
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={getAdjustedValue(job.id, 'females') as number}
                                    onChange={(e) => handleAdjustField(job.id, 'females', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                                  />
                                  {job.females !== getAdjustedValue(job.id, 'females') && (
                                    <p className="text-xs text-blue-600 mt-1">
                                      Original: {job.females}
                                    </p>
                                  )}
                                </div>
                              </>
                            )}

                            {visibleColumns.points && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  <Award className="w-4 h-4 inline mr-1" />
                                  Job Evaluation Points
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={getAdjustedValue(job.id, 'points') as number}
                                  onChange={(e) => handleAdjustField(job.id, 'points', parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                                />
                                {job.points !== getAdjustedValue(job.id, 'points') && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Original: {job.points}
                                  </p>
                                )}
                              </div>
                            )}

                            {visibleColumns.yearsToMax && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  <Clock className="w-4 h-4 inline mr-1" />
                                  Years to Maximum
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={getAdjustedValue(job.id, 'years_to_max') as number}
                                  onChange={(e) => handleAdjustField(job.id, 'years_to_max', parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                                />
                                {job.years_to_max !== getAdjustedValue(job.id, 'years_to_max') && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Original: {job.years_to_max}
                                  </p>
                                )}
                              </div>
                            )}

                            {visibleColumns.yearsServicePay && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  <Clock className="w-4 h-4 inline mr-1" />
                                  Years Service Pay
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={getAdjustedValue(job.id, 'years_service_pay') as number}
                                  onChange={(e) => handleAdjustField(job.id, 'years_service_pay', parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                                />
                                {job.years_service_pay !== getAdjustedValue(job.id, 'years_service_pay') && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Original: {job.years_service_pay}
                                  </p>
                                )}
                              </div>
                            )}

                            {visibleColumns.exceptionalCategory && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  <Award className="w-4 h-4 inline mr-1" />
                                  Exceptional Service Category
                                </label>
                                <input
                                  type="text"
                                  value={getAdjustedValue(job.id, 'exceptional_service_category') as string}
                                  onChange={(e) => handleAdjustField(job.id, 'exceptional_service_category', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                                />
                                {job.exceptional_service_category !== getAdjustedValue(job.id, 'exceptional_service_category') && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Original: {job.exceptional_service_category || '(empty)'}
                                  </p>
                                )}
                              </div>
                            )}

                            {visibleColumns.benefits && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  <Gift className="w-4 h-4 inline mr-1" />
                                  Benefits Included in Salary
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={getAdjustedValue(job.id, 'benefits_included_in_salary') as number}
                                  onChange={(e) => handleAdjustField(job.id, 'benefits_included_in_salary', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                                />
                                {job.benefits_included_in_salary !== getAdjustedValue(job.id, 'benefits_included_in_salary') && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Original: ${job.benefits_included_in_salary.toFixed(2)}
                                  </p>
                                )}
                              </div>
                            )}

                            {visibleColumns.additionalComp && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  <DollarSign className="w-4 h-4 inline mr-1" />
                                  Additional Cash Compensation
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={getAdjustedValue(job.id, 'additional_cash_compensation') as number}
                                  onChange={(e) => handleAdjustField(job.id, 'additional_cash_compensation', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                                />
                                {job.additional_cash_compensation !== getAdjustedValue(job.id, 'additional_cash_compensation') && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Original: ${job.additional_cash_compensation.toFixed(2)}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {scenarioResult && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">Scenario Test Results</h3>
              <div className="space-y-2 text-sm">
                {scenarioResult.salaryRangeTest && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Salary Range Test:</span>
                    <span className={`font-medium ${
                      scenarioResult.salaryRangeTest.passed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {scenarioResult.salaryRangeTest.passed ? 'Pass' : 'Fail'} ({(scenarioResult.salaryRangeTest.ratio * 100).toFixed(1)}%)
                    </span>
                  </div>
                )}
                {scenarioResult.exceptionalServiceTest && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Exceptional Service Test:</span>
                    <span className={`font-medium ${
                      scenarioResult.exceptionalServiceTest.passed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {scenarioResult.exceptionalServiceTest.passed ? 'Pass' : 'Fail'} ({(scenarioResult.exceptionalServiceTest.ratio * 100).toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <p className="text-sm text-gray-600">
            Changes are not saved. This is for planning purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
