import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, AlertCircle } from 'lucide-react';
import { db } from '../lib/db';
import { type AdminCaseNote, type Jurisdiction, type Report } from '../lib/db';

type FollowUpCalendarProps = {
  onSelectNote: (note: AdminCaseNote) => void;
};

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  notes: AdminCaseNote[];
};

export function FollowUpCalendar({ onSelectNote }: FollowUpCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [followupNotes, setFollowupNotes] = useState<AdminCaseNote[]>([]);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [notesData, jurisdictionsData, reportsData] = await Promise.all([
        supabase
          .from('admin_case_notes')
          .select('*')
          .eq('category', 'follow-up')
          .is('completed_at', null)
          .not('due_date', 'is', null)
          .order('due_date', { ascending: true }),
        db.from('jurisdictions').select('*'),
        db.from('reports').select('*')
      ]);

      if (notesData.error) throw notesData.error;
      if (jurisdictionsData.error) throw jurisdictionsData.error;
      if (reportsData.error) throw reportsData.error;

      setFollowupNotes(notesData.data || []);
      setJurisdictions(jurisdictionsData.data || []);
      setReports(reportsData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days: CalendarDay[] = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateStr = currentDay.toISOString().split('T')[0];
      const notesForDay = followupNotes.filter(note => note.due_date === dateStr);

      days.push({
        date: new Date(currentDay),
        isCurrentMonth: currentDay.getMonth() === month,
        notes: notesForDay
      });

      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getNoteStatus = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    if (due < today) {
      return { label: 'Overdue', color: 'bg-red-500' };
    } else if (due.getTime() === today.getTime()) {
      return { label: 'Due Today', color: 'bg-orange-500' };
    } else {
      const daysUntil = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 7) {
        return { label: `${daysUntil}d`, color: 'bg-yellow-500' };
      }
      return { label: 'Upcoming', color: 'bg-blue-500' };
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003865] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  const calendarDays = getCalendarDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueNotes = followupNotes.filter(note => {
    if (!note.due_date) return false;
    const dueDate = new Date(note.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Follow-up Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-[#003865] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CalendarIcon className="inline w-4 h-4 mr-2" />
            Calendar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-[#003865] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <List className="inline w-4 h-4 mr-2" />
            List
          </button>
        </div>
      </div>

      {overdueNotes.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Overdue Follow-ups</h3>
              <p className="text-sm text-red-800">
                You have {overdueNotes.length} overdue follow-up{overdueNotes.length !== 1 ? 's' : ''} requiring attention
              </p>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Today
              </button>
              <button
                onClick={goToPreviousMonth}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {dayNames.map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                {day}
              </div>
            ))}

            {calendarDays.map((day, index) => {
              const hasNotes = day.notes.length > 0;
              const isCurrentDay = isToday(day.date);

              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 border rounded-lg ${
                    !day.isCurrentMonth
                      ? 'bg-gray-50 border-gray-100'
                      : isCurrentDay
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200'
                  } ${hasNotes ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                >
                  <div className={`text-sm font-medium ${
                    !day.isCurrentMonth
                      ? 'text-gray-400'
                      : isCurrentDay
                      ? 'text-blue-600'
                      : 'text-gray-900'
                  }`}>
                    {day.date.getDate()}
                  </div>

                  {hasNotes && (
                    <div className="mt-1 space-y-1">
                      {day.notes.slice(0, 3).map(note => {
                        const status = getNoteStatus(note.due_date!);
                        return (
                          <button
                            key={note.id}
                            onClick={() => onSelectNote(note)}
                            className={`w-full text-left px-2 py-1 ${status.color} text-white text-xs rounded truncate hover:opacity-80 transition-opacity`}
                            title={note.title}
                          >
                            {note.title}
                          </button>
                        );
                      })}
                      {day.notes.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{day.notes.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-600">Overdue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-gray-600">Due Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-gray-600">Due This Week</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Upcoming</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              All Follow-ups ({followupNotes.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {followupNotes.length === 0 ? (
              <div className="p-12 text-center">
                <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No follow-ups scheduled</p>
              </div>
            ) : (
              followupNotes.map(note => {
                const jurisdiction = jurisdictions.find(j => j.id === note.jurisdiction_id);
                const report = note.report_id ? reports.find(r => r.id === note.report_id) : null;
                const status = getNoteStatus(note.due_date!);

                return (
                  <button
                    key={note.id}
                    onClick={() => onSelectNote(note)}
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{note.title}</h4>
                          <span className={`px-3 py-1 ${status.color} text-white text-xs font-medium rounded-full whitespace-nowrap`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">{note.content}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                          <span>
                            <span className="font-medium">Due:</span> {new Date(note.due_date!).toLocaleDateString()}
                          </span>
                          <span>
                            <span className="font-medium">Jurisdiction:</span> {jurisdiction?.name || 'Unknown'}
                          </span>
                          {report && (
                            <span>
                              <span className="font-medium">Case:</span> {report.report_year} - Case {report.case_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
