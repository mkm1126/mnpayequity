import { JobWithPredictedPay } from '../lib/predictedPayAnalysis';

type PredictedPayJobTableProps = {
  jobs: JobWithPredictedPay[];
};

export function PredictedPayJobTable({ jobs }: PredictedPayJobTableProps) {
  const sortedJobs = [...jobs].sort((a, b) => a.job_value_points - b.job_value_points);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-bold text-gray-900 border-r border-gray-300">
              Job Nbr
            </th>
            <th className="px-3 py-2 text-left text-xs font-bold text-gray-900 border-r border-gray-300">
              Job Title
            </th>
            <th className="px-3 py-2 text-center text-xs font-bold text-gray-900 border-r border-gray-300">
              Nbr Males
            </th>
            <th className="px-3 py-2 text-center text-xs font-bold text-gray-900 border-r border-gray-300">
              Nbr Females
            </th>
            <th className="px-3 py-2 text-center text-xs font-bold text-gray-900 border-r border-gray-300">
              Non-Binary
            </th>
            <th className="px-3 py-2 text-center text-xs font-bold text-gray-900 border-r border-gray-300">
              Total Nbr
            </th>
            <th className="px-3 py-2 text-center text-xs font-bold text-gray-900 border-r border-gray-300">
              Job Type
            </th>
            <th className="px-3 py-2 text-center text-xs font-bold text-gray-900 border-r border-gray-300">
              Job Points
            </th>
            <th className="px-3 py-2 text-right text-xs font-bold text-gray-900 border-r border-gray-300">
              Max Mo Salary
            </th>
            <th className="px-3 py-2 text-right text-xs font-bold text-gray-900 border-r border-gray-300">
              Predicted Pay
            </th>
            <th className="px-3 py-2 text-right text-xs font-bold text-gray-900">
              Pay Difference
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {sortedJobs.map((job, index) => {
            const total = job.males + job.females;
            const nonBinary = 0;

            return (
              <tr key={job.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 text-xs text-gray-900 border-r border-gray-300">
                  {job.job_number || index + 1}
                </td>
                <td className="px-3 py-2 text-xs text-gray-900 border-r border-gray-300">
                  {job.title}
                </td>
                <td className="px-3 py-2 text-xs text-center text-gray-900 border-r border-gray-300">
                  {job.males}
                </td>
                <td className="px-3 py-2 text-xs text-center text-gray-900 border-r border-gray-300">
                  {job.females}
                </td>
                <td className="px-3 py-2 text-xs text-center text-gray-900 border-r border-gray-300">
                  {nonBinary}
                </td>
                <td className="px-3 py-2 text-xs text-center text-gray-900 border-r border-gray-300">
                  {total}
                </td>
                <td className="px-3 py-2 text-xs text-center text-gray-900 border-r border-gray-300">
                  {job.job_type}
                </td>
                <td className="px-3 py-2 text-xs text-center text-gray-900 border-r border-gray-300">
                  {job.job_value_points}
                </td>
                <td className="px-3 py-2 text-xs text-right text-gray-900 border-r border-gray-300">
                  {job.max_salary.toFixed(4)}
                </td>
                <td className="px-3 py-2 text-xs text-right text-gray-900 border-r border-gray-300">
                  {job.predicted_pay.toFixed(4)}
                </td>
                <td className="px-3 py-2 text-xs text-right text-gray-900">
                  {job.pay_difference.toFixed(4)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4 text-sm text-gray-700 font-semibold">
        Job Number Count: {jobs.length}
      </div>
    </div>
  );
}
