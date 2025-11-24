import { useState, useEffect } from 'react';
import { ArrowLeft, FileDown, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Report, JobClassification, Jurisdiction, Contact, ImplementationReport, supabase } from '../lib/supabase';
import { ComplianceResult } from '../lib/complianceAnalysis';
import jsPDF from 'jspdf';
import { addLogoToPDF, addPageNumbers } from '../lib/pdfGenerator';

type ImplementationReportDisplayProps = {
  report: Report;
  jurisdiction: Jurisdiction;
  jobs: JobClassification[];
  complianceResult: ComplianceResult;
  onBack: () => void;
};

export function ImplementationReportDisplay({ report, jurisdiction, jobs, complianceResult, onBack }: ImplementationReportDisplayProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [implementationData, setImplementationData] = useState<ImplementationReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [report.id]);

  async function loadData() {
    try {
      const [contactsData, implData] = await Promise.all([
        supabase
          .from('contacts')
          .select('*')
          .eq('jurisdiction_id', jurisdiction.id)
          .order('is_primary', { ascending: false }),
        supabase
          .from('implementation_reports')
          .select('*')
          .eq('report_id', report.id)
          .maybeSingle()
      ]);

      if (contactsData.error) throw contactsData.error;
      if (implData.error) throw implData.error;

      setContacts(contactsData.data || []);
      setImplementationData(implData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function exportToPDF() {
    const doc = new jsPDF('portrait', 'pt', 'letter');
    const pageWidth = 612;
    const marginLeft = 40;
    const marginRight = 40;
    const contentWidth = pageWidth - marginLeft - marginRight;
    let yPosition = 60;

    await addLogoToPDF(doc, '/MMB_logo copy copy copy.jpg');

    yPosition = 90;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const title = 'Pay Equity Implementation Report';
    doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 30;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Part A: Jurisdiction Identification', marginLeft, yPosition);
    yPosition += 20;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Jurisdiction: ${jurisdiction.name}`, marginLeft + 20, yPosition);
    doc.text(`Jurisdiction Type: ${jurisdiction.jurisdiction_type}`, pageWidth - marginRight - 150, yPosition, { align: 'right' });
    yPosition += 15;

    if (jurisdiction.address) {
      doc.text(jurisdiction.address, marginLeft + 60, yPosition);
      yPosition += 12;
    }
    if (jurisdiction.city && jurisdiction.state && jurisdiction.zipcode) {
      doc.text(`${jurisdiction.city}, ${jurisdiction.state} ${jurisdiction.zipcode}`, marginLeft + 60, yPosition);
      yPosition += 20;
    }

    contacts.slice(0, 3).forEach((contact) => {
      doc.text(`Contact: ${contact.name}`, marginLeft + 20, yPosition);
      doc.text(`Phone: ${contact.phone || '() -'}`, marginLeft + 250, yPosition);
      doc.text(`E-Mail: ${contact.email}`, marginLeft + 380, yPosition);
      yPosition += 15;
    });
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Part B: Official Verification', marginLeft, yPosition);
    yPosition += 20;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('1.', marginLeft + 20, yPosition);
    doc.setFont('helvetica', 'normal');
    const q1Text = 'The job evaluation system used measured skill, effort responsibility and working conditions and the same system was used for all classes of employees.';
    const q1Lines = doc.splitTextToSize(q1Text, contentWidth - 60);
    doc.text(q1Lines, marginLeft + 40, yPosition);
    yPosition += q1Lines.length * 12 + 10;

    doc.text('The system was used: ' + (implementationData?.evaluation_system_type || implementationData?.evaluation_system || 'Not specified'), marginLeft + 40, yPosition);
    yPosition += 12;
    doc.text('Description:', marginLeft + 40, yPosition);
    yPosition += 15;

    if (implementationData?.evaluation_description) {
      doc.setFillColor(240, 240, 240);
      doc.rect(marginLeft + 40, yPosition - 10, contentWidth - 80, 40, 'F');
      const descLines = doc.splitTextToSize(implementationData.evaluation_description, contentWidth - 100);
      doc.text(descLines, marginLeft + 45, yPosition);
      yPosition += Math.max(40, descLines.length * 12) + 5;
    } else {
      doc.setFillColor(240, 240, 240);
      doc.rect(marginLeft + 40, yPosition - 10, contentWidth - 80, 40, 'F');
      yPosition += 45;
    }
    yPosition += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('3.', marginLeft + 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text('An official notice has been posted at:', marginLeft + 40, yPosition);
    yPosition += 15;
    doc.text(implementationData?.notice_posting_locations || implementationData?.notice_location || 'Not specified', marginLeft + 60, yPosition);
    yPosition += 12;
    doc.text('(prominent location)', marginLeft + 60, yPosition);
    yPosition += 15;

    const noticeText = 'informing employees that the Pay Equity Implementation Report has been filed and is available to employees upon request. A copy of the notice has been sent to each exclusive representative, if any, and also to the public library.';
    const noticeLines = doc.splitTextToSize(noticeText, contentWidth - 80);
    doc.text(noticeLines, marginLeft + 40, yPosition);
    yPosition += noticeLines.length * 12 + 10;

    doc.text('The report was approved by:', marginLeft + 40, yPosition);
    yPosition += 15;
    doc.text(implementationData?.approved_by_body || 'Not specified', marginLeft + 60, yPosition);
    yPosition += 12;
    doc.text('(governing body)', marginLeft + 60, yPosition);
    yPosition += 15;
    doc.text(implementationData?.chief_elected_official || 'Not specified', marginLeft + 60, yPosition);
    yPosition += 12;
    doc.text('(chief elected official)', marginLeft + 60, yPosition);
    yPosition += 15;
    doc.text(implementationData?.official_title || 'Not specified', marginLeft + 60, yPosition);
    yPosition += 12;
    doc.text('(title)', marginLeft + 60, yPosition);
    yPosition += 20;

    doc.setFont('helvetica', 'bold');
    doc.text('2.', marginLeft + 20, yPosition);
    doc.setFont('helvetica', 'normal');
    const q2Text = 'Health Insurance benefits for male and female classes of comparable value have been evaluated and:';
    const q2Lines = doc.splitTextToSize(q2Text, contentWidth - 80);
    doc.text(q2Lines, marginLeft + 40, yPosition);
    yPosition += q2Lines.length * 12 + 10;

    doc.text(implementationData?.health_benefits_status || implementationData?.health_benefits_evaluated || 'Not specified', marginLeft + 40, yPosition);
    yPosition += 20;

    if (yPosition > 700) {
      doc.addPage();
      yPosition = 60;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Part C: Total Payroll', marginLeft, yPosition);
    yPosition += 20;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setFillColor(240, 240, 240);
    doc.rect(marginLeft + 40, yPosition - 10, 150, 20, 'F');
    doc.rect(marginLeft + 40, yPosition - 10, 150, 20, 'S');
    const payrollAmount = implementationData?.total_payroll ? `$${implementationData.total_payroll.toFixed(2)}` : '$0.00';
    doc.text(payrollAmount, marginLeft + 115, yPosition + 2, { align: 'center' });
    yPosition += 25;

    const payrollText = `is the annual payroll for the calendar year just ended December 31.`;
    doc.text(payrollText, marginLeft + 40, yPosition);
    yPosition += 30;

    doc.rect(marginLeft + 40, yPosition - 8, 10, 10, 'S');
    if (implementationData?.certification_checkbox_confirmed) {
      doc.setFont('helvetica', 'bold');
      doc.text('X', marginLeft + 42, yPosition);
      doc.setFont('helvetica', 'normal');
    }
    doc.text('[X]', marginLeft + 40, yPosition);
    doc.text('Checking this box indicates the following:', marginLeft + 55, yPosition);
    yPosition += 15;

    const certItems = [
      '- signature of chief elected official',
      '- approval by governing body',
      '- all information is complete and accurate, and',
      '- all employees over which the jurisdiction has',
      '  final budgetary authority are included'
    ];
    certItems.forEach(item => {
      doc.text(item, marginLeft + 55, yPosition);
      yPosition += 12;
    });
    yPosition += 5;

    const submittedDate = implementationData?.date_submitted
      ? new Date(implementationData.date_submitted).toLocaleDateString()
      : new Date().toLocaleDateString();
    doc.text(`Date Submitted: ${submittedDate}`, marginLeft + 40, yPosition);

    const footerY = 750;
    doc.setFontSize(8);
    doc.text(`Page 1 of 1`, pageWidth - marginRight, footerY, { align: 'right' });
    doc.text(new Date().toLocaleString(), pageWidth - marginRight - 100, footerY, { align: 'right' });

    doc.save(`${jurisdiction.name}_${report.report_year}_Implementation_Report.pdf`);
  }

  const maleJobs = jobs.filter(job => {
    const total = job.males + job.females;
    return total > 0 && (job.males / total) >= 0.80;
  });

  const femaleJobs = jobs.filter(job => {
    const total = job.males + job.females;
    return total > 0 && (job.females / total) >= 0.70;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003865] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  const isComplete = implementationData?.certification_checkbox_confirmed &&
                     implementationData?.total_payroll &&
                     implementationData?.chief_elected_official &&
                     implementationData?.approved_by_body;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#003865] hover:text-[#004d7a] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Reports
        </button>
        <div className="flex items-center gap-3">
          {isComplete ? (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle size={18} />
              Report Complete
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-600 text-sm font-medium">
              <AlertCircle size={18} />
              Incomplete
            </div>
          )}
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-6 py-3 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
          >
            <FileDown className="w-5 h-5" />
            Export to PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8">
          <div className="mb-8 text-center">
            <img src="/MMB_logo copy copy copy.jpg" alt="Management and Budget" className="h-16 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900">Pay Equity Implementation Report</h1>
          </div>

          <div className="space-y-8">
            <div className="border-t-4 border-[#003865] pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Part A: Jurisdiction Identification</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Jurisdiction:</p>
                  <p className="text-gray-900">{jurisdiction.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Jurisdiction Type:</p>
                  <p className="text-gray-900">{jurisdiction.jurisdiction_type}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-semibold text-gray-700">Address:</p>
                  <p className="text-gray-900">{jurisdiction.address}</p>
                  <p className="text-gray-900">{jurisdiction.city}, {jurisdiction.state} {jurisdiction.zipcode}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <p className="text-sm font-semibold text-gray-700">Contacts:</p>
                {contacts.length > 0 ? (
                  contacts.slice(0, 3).map((contact, index) => (
                    <div key={contact.id} className="flex items-center gap-6 p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Contact: <span className="font-medium">{contact.name}</span></span>
                      <span className="text-gray-700">Phone: <span className="font-medium">{contact.phone || '() -'}</span></span>
                      <span className="text-gray-700">E-Mail: <span className="font-medium">{contact.email}</span></span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No contacts available</p>
                )}
              </div>
            </div>

            <div className="border-t-4 border-[#003865] pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Part B: Official Verification</h2>

              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-gray-900">1.</span>
                    <div className="flex-1">
                      <p className="text-gray-900 mb-4">
                        The job evaluation system used measured skill, effort responsibility and working conditions and the same system was used for all classes of employees.
                      </p>
                      <div className="ml-4 space-y-2">
                        <p className="text-gray-700">
                          The system was used: <span className="font-semibold">
                            {implementationData?.evaluation_system_type || implementationData?.evaluation_system || 'Not specified'}
                          </span>
                        </p>
                        <p className="text-gray-700">Description:</p>
                        <div className="bg-white p-4 rounded border border-gray-200 min-h-[60px]">
                          <p className="text-gray-700">
                            {implementationData?.evaluation_description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-gray-900">2.</span>
                    <div className="flex-1">
                      <p className="text-gray-900 mb-4">
                        Health Insurance benefits for male and female classes of comparable value have been evaluated and:
                      </p>
                      <div className="ml-4">
                        <p className="text-gray-700 font-semibold">
                          {implementationData?.health_benefits_status ||
                           implementationData?.health_benefits_evaluated ||
                           'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-gray-900">3.</span>
                    <div className="flex-1">
                      <p className="text-gray-900 mb-4">An official notice has been posted at:</p>
                      <div className="ml-4 space-y-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {implementationData?.notice_posting_locations ||
                             implementationData?.notice_location ||
                             'Not specified'}
                          </p>
                          <p className="text-sm text-gray-600">(prominent location)</p>
                        </div>
                        <p className="text-gray-700 text-sm">
                          informing employees that the Pay Equity Implementation Report has been filed and is available to employees upon request. A copy of the notice has been sent to each exclusive representative, if any, and also to the public library.
                        </p>
                        <div className="mt-4 space-y-2">
                          <p className="text-gray-700">The report was approved by:</p>
                          <div className="ml-4 space-y-1">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {implementationData?.approved_by_body || 'Not specified'}
                              </p>
                              <p className="text-sm text-gray-600">(governing body)</p>
                            </div>
                            <div className="mt-2">
                              <p className="font-semibold text-gray-900">
                                {implementationData?.chief_elected_official || 'Not specified'}
                              </p>
                              <p className="text-sm text-gray-600">(chief elected official)</p>
                            </div>
                            <div className="mt-2">
                              <p className="font-semibold text-gray-900">
                                {implementationData?.official_title || 'Not specified'}
                              </p>
                              <p className="text-sm text-gray-600">(title)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t-4 border-[#003865] pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Part C: Total Payroll</h2>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-white border-2 border-gray-300 rounded p-4 min-w-[200px]">
                    <p className="text-2xl font-bold text-gray-900 text-center">
                      {implementationData?.total_payroll
                        ? `$${implementationData.total_payroll.toFixed(2)}`
                        : '$0.00'}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 mb-6">
                      is the annual payroll for the calendar year just ended December 31.
                    </p>

                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-5 h-5 border-2 border-gray-400 rounded mt-1">
                        {implementationData?.certification_checkbox_confirmed && (
                          <CheckCircle size={16} className="text-[#003865]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-2">
                          Checking this box indicates the following:
                        </p>
                        <ul className="text-sm text-gray-700 space-y-1 ml-2">
                          <li>- signature of chief elected official</li>
                          <li>- approval by governing body</li>
                          <li>- all information is complete and accurate, and</li>
                          <li>- all employees over which the jurisdiction has final budgetary authority are included</li>
                        </ul>
                        <p className="text-gray-700 mt-4">
                          Date Submitted: <span className="font-semibold">
                            {implementationData?.date_submitted
                              ? new Date(implementationData.date_submitted).toLocaleDateString()
                              : new Date().toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {!isComplete && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900 mb-2">Report Incomplete</p>
                  <p className="text-yellow-800 text-sm">
                    Please complete the Implementation Form to fill in all required fields before submitting this report.
                    Missing information includes certification, approval details, or payroll data.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
