import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { db } from '../lib/db';
import { type Jurisdiction } from '../lib/db';
import { calculateReportingYears, formatReportingYear } from '../lib/reportingYearCalculator';

type JurisdictionWithLastReport = Jurisdiction & {
  lastReportYear: number | null;
};

export function JurisdictionReportingLookup() {
  const [jurisdictions, setJurisdictions] = useState<JurisdictionWithLastReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJurisdictionId, setSelectedJurisdictionId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJurisdictions();
  }, []);

  const fetchJurisdictions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: jurisdictionsData, error: jurisdictionsError } = await supabase
        .from('jurisdictions')
        .select('*')
        .order('name');

      if (jurisdictionsError) throw jurisdictionsError;

      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('jurisdiction_id, report_year, submitted_at')
        .not('submitted_at', 'is', null)
        .order('submitted_at', { ascending: false });

      if (reportsError) throw reportsError;

      const jurisdictionsWithReports: JurisdictionWithLastReport[] = (jurisdictionsData || []).map(jurisdiction => {
        const jurisdictionReports = (reportsData || []).filter(
          report => report.jurisdiction_id === jurisdiction.id
        );

        const lastReportYear = jurisdictionReports.length > 0
          ? Math.max(...jurisdictionReports.map(r => r.report_year))
          : null;

        return {
          ...jurisdiction,
          lastReportYear
        };
      });

      setJurisdictions(jurisdictionsWithReports);
    } catch (err) {
      console.error('Error fetching jurisdictions:', err);
      setError('Failed to load jurisdictions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const selectedJurisdiction = jurisdictions.find(j => j.id === selectedJurisdictionId);
  const reportingInfo = selectedJurisdiction
    ? calculateReportingYears(selectedJurisdiction.lastReportYear)
    : null;

  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#78BE21]" />
          When is My Jurisdiction's Next Report Due?
        </h2>
        <div className="w-12 h-0.5 bg-[#78BE21] rounded"></div>
      </div>

      <p className="text-sm text-gray-700 mb-3">
        Minnesota law requires jurisdictions to submit pay equity reports every three years. Select your jurisdiction below to view your reporting schedule.
      </p>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-800">{error}</p>
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="jurisdiction-select" className="block text-sm font-medium text-gray-700 mb-1.5">
          Select Your Jurisdiction
        </label>
        <select
          id="jurisdiction-select"
          value={selectedJurisdictionId}
          onChange={(e) => setSelectedJurisdictionId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#003865] focus:border-transparent"
          disabled={loading}
        >
          <option value="">
            {loading ? 'Loading jurisdictions...' : 'Choose a jurisdiction...'}
          </option>
          {jurisdictions.map((jurisdiction) => (
            <option key={jurisdiction.id} value={jurisdiction.id}>
              {jurisdiction.name} ({jurisdiction.jurisdiction_type})
            </option>
          ))}
        </select>
      </div>

      {selectedJurisdiction && reportingInfo && (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-gray-900">
                  {selectedJurisdiction.name}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {selectedJurisdiction.jurisdiction_type} • ID: {selectedJurisdiction.jurisdiction_id}
                </p>

                {reportingInfo.lastReportYear ? (
                  <div className="flex items-center gap-1.5 text-xs text-gray-700 mt-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span>Last Report Submitted: <strong>{reportingInfo.lastReportYear}</strong></span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-1.5 rounded mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>No previous report submission found</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-3">
            <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#78BE21]" />
              Your Reporting Schedule
            </h4>

            <div className="space-y-1.5">
              {reportingInfo.upcomingYears.map((year, index) => {
                const isCurrentYear = year === currentYear;
                const isPastDue = year < currentYear;

                return (
                  <div
                    key={year}
                    className={`p-2.5 rounded-lg border transition-all ${
                      isCurrentYear
                        ? 'bg-[#78BE21] bg-opacity-10 border-[#78BE21]'
                        : isPastDue
                        ? 'bg-red-50 border-red-300'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          isCurrentYear
                            ? 'bg-[#78BE21] text-white'
                            : isPastDue
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${isCurrentYear ? 'text-[#003865]' : isPastDue ? 'text-red-700' : 'text-gray-900'}`}>
                          {formatReportingYear(year, isCurrentYear)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {isCurrentYear && 'Report due this year'}
                          {isPastDue && 'Past due - submit ASAP'}
                          {!isCurrentYear && !isPastDue && 'Upcoming reporting year'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-700 leading-relaxed">
                <strong>Note:</strong> Reports are due every three years from your last submission. Questions? Contact the Pay Equity Unit at{' '}
                <a href="tel:651-259-3824" className="text-[#003865] hover:underline font-medium">
                  651-259-3824
                </a>{' '}
                or{' '}
                <a href="mailto:payequity.mmb@state.mn.us" className="text-[#003865] hover:underline font-medium">
                  payequity.mmb@state.mn.us
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {!selectedJurisdiction && !loading && (
        <div className="text-center py-6 text-gray-500">
          <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Select a jurisdiction above to view reporting schedule</p>
        </div>
      )}
    </div>
  );
}
