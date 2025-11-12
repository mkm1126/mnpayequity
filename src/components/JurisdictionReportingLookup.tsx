import { useState, useEffect } from 'react';
import { Calendar, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase, type Jurisdiction } from '../lib/supabase';
import { calculateReportingYears, formatReportingYear } from '../lib/reportingYearCalculator';

type JurisdictionWithLastReport = Jurisdiction & {
  lastReportYear: number | null;
};

export function JurisdictionReportingLookup() {
  const [jurisdictions, setJurisdictions] = useState<JurisdictionWithLastReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJurisdictionId, setSelectedJurisdictionId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredJurisdictions = jurisdictions.filter(j =>
    j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.jurisdiction_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#78BE21]" />
          When is My Jurisdiction's Next Report Due?
        </h2>
        <div className="w-12 h-0.5 bg-[#78BE21] rounded"></div>
      </div>

      <p className="text-sm text-gray-700 mb-4">
        Minnesota law requires jurisdictions to submit pay equity reports every three years.
        Select your jurisdiction below to view your reporting schedule.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="jurisdiction-search" className="block text-sm font-medium text-gray-700 mb-2">
          Select Your Jurisdiction
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            id="jurisdiction-search"
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#003865] focus:border-transparent"
            disabled={loading}
          />
        </div>
      </div>

      <div className="mb-4">
        <select
          value={selectedJurisdictionId}
          onChange={(e) => setSelectedJurisdictionId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#003865] focus:border-transparent"
          disabled={loading}
        >
          <option value="">
            {loading ? 'Loading jurisdictions...' : 'Choose a jurisdiction...'}
          </option>
          {filteredJurisdictions.map((jurisdiction) => (
            <option key={jurisdiction.id} value={jurisdiction.id}>
              {jurisdiction.name} ({jurisdiction.jurisdiction_type})
            </option>
          ))}
        </select>
      </div>

      {selectedJurisdiction && reportingInfo && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-gray-900 mb-1">
                  {selectedJurisdiction.name}
                </h3>
                <p className="text-xs text-gray-600 mb-2">
                  {selectedJurisdiction.jurisdiction_type} • ID: {selectedJurisdiction.jurisdiction_id}
                </p>

                {reportingInfo.lastReportYear ? (
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>Last Report Submitted: <strong>{reportingInfo.lastReportYear}</strong></span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>No previous report submission found in system</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#78BE21]" />
              Your Reporting Schedule
            </h4>

            <div className="space-y-2">
              {reportingInfo.upcomingYears.map((year, index) => {
                const isCurrentYear = year === currentYear;
                const isPastDue = year < currentYear;

                return (
                  <div
                    key={year}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isCurrentYear
                        ? 'bg-[#78BE21] bg-opacity-10 border-[#78BE21]'
                        : isPastDue
                        ? 'bg-red-50 border-red-300'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
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
                          <p className={`font-bold ${isCurrentYear ? 'text-[#003865]' : isPastDue ? 'text-red-700' : 'text-gray-900'}`}>
                            {formatReportingYear(year, isCurrentYear)}
                          </p>
                          {isCurrentYear && (
                            <p className="text-xs text-[#003865] font-medium">
                              Report due this year
                            </p>
                          )}
                          {isPastDue && (
                            <p className="text-xs text-red-600 font-medium">
                              Past due - please submit as soon as possible
                            </p>
                          )}
                          {!isCurrentYear && !isPastDue && (
                            <p className="text-xs text-gray-600">
                              Upcoming reporting year
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-700 leading-relaxed">
                <strong>Note:</strong> Reports are due every three years from your last submission.
                If you have questions about your specific reporting schedule or compliance status,
                please contact the Pay Equity Unit at{' '}
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
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Select a jurisdiction above to view reporting schedule</p>
        </div>
      )}
    </div>
  );
}
