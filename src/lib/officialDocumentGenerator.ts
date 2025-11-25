import jsPDF from 'jspdf';
import { Report, Jurisdiction, supabase } from './supabase';
import { ComplianceResult } from './complianceAnalysis';

interface SystemConfig {
  commissioner_name: string;
  commissioner_title: string;
  commissioner_signature_base64: string;
  use_signature_image: string;
  contact_person_name: string;
  contact_person_phone: string;
  contact_person_email: string;
  mmb_logo_base64: string;
}

async function getSystemConfig(): Promise<SystemConfig> {
  const { data } = await supabase
    .from('system_config')
    .select('config_key, config_value')
    .in('config_key', [
      'commissioner_name',
      'commissioner_title',
      'commissioner_signature_base64',
      'use_signature_image',
      'contact_person_name',
      'contact_person_phone',
      'contact_person_email',
      'mmb_logo_base64'
    ]);

  const config: SystemConfig = {
    commissioner_name: 'Jim Schowalter',
    commissioner_title: 'Commissioner',
    commissioner_signature_base64: '',
    use_signature_image: 'false',
    contact_person_name: 'Dominique Murray',
    contact_person_phone: '(651) 259-3805',
    contact_person_email: 'pay.equity@state.mn.us',
    mmb_logo_base64: ''
  };

  if (data) {
    data.forEach(item => {
      config[item.config_key as keyof SystemConfig] = item.config_value;
    });
  }

  return config;
}

function formatOfficialDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function addCheckbox(doc: jsPDF, x: number, y: number, checked: boolean, size: number = 12) {
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.rect(x, y, size, size);

  if (checked) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('X', x + 2.5, y + 9.5);
    doc.setFont('helvetica', 'normal');
  }
}

function addMMBLogo(doc: jsPDF, logoBase64: string, x: number, y: number, width: number = 180) {
  if (logoBase64&& logoBase64.length > 0) {
    try {
      const height = width * 0.25;

      let imageData = logoBase64;
      if (!imageData.startsWith('data:')) {
        imageData = `data:image/png;base64,${imageData}`;
      }

      const imageType = imageData.includes('data:image/png') ? 'PNG' :
                       imageData.includes('data:image/jpeg') || imageData.includes('data:image/jpg') ? 'JPEG' : 'PNG';

      doc.addImage(imageData, imageType, x, y, width, height, undefined, 'FAST');
      return;
    } catch (error) {
      console.error('Error adding logo image:', error, 'Logo length:', logoBase64?.length);
    }
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 56, 101);
  doc.text('MANAGEMENT', x, y + 15);
  doc.setTextColor(76, 175, 80);
  doc.text('AND BUDGET', x + 90, y + 15);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
}

export async function generateOfficialComplianceCertificate(
  report: Report,
  jurisdiction: Jurisdiction,
  issueDate?: Date
): Promise<string> {
  const doc = new jsPDF('portrait', 'pt', 'letter');
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const config = await getSystemConfig();
  const officialDate = issueDate || new Date();

  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(3);
  doc.rect(30, 30, pageWidth - 60, pageHeight - 60, 'S');

  addMMBLogo(doc, config.mmb_logo_base64, 50, 50, 180);

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Notice of Pay Equity Compliance', pageWidth / 2, 150, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'italic');
  doc.text('Presented to', pageWidth / 2, 200, { align: 'center' });

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const jurisdictionName = `${jurisdiction.name}`;
  doc.text(jurisdictionName, pageWidth / 2, 260, { align: 'center' });

  const jurisdictionAbbrev = `(${jurisdiction.jurisdiction_id})`;
  doc.setFontSize(18);
  doc.text(jurisdictionAbbrev, pageWidth / 2, 290, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const maxWidth = pageWidth - 120;
  const complianceText = `For successfully meeting the requirements of the Local Government Pay Equity Act M.S. 471.991 - 471.999 and Minnesota rules Chapter 3920. This notice is a result of an official review of your ${report.report_year} pay equity report by Minnesota Management & Budget.`;

  const lines = doc.splitTextToSize(complianceText, maxWidth);
  let yPos = 350;
  lines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, yPos, { align: 'center' });
    yPos += 18;
  });

  yPos += 20;
  const appreciationText = 'Your cooperation in complying with the local government pay equity requirements is greatly appreciated.';
  const appreciationLines = doc.splitTextToSize(appreciationText, maxWidth);
  appreciationLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, yPos, { align: 'center' });
    yPos += 18;
  });

  const signatureY = pageHeight - 180;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.line(80, signatureY, 250, signatureY);
  doc.line(pageWidth - 250, signatureY, pageWidth - 80, signatureY);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(formatOfficialDate(officialDate), 165, signatureY + 20, { align: 'center' });
  doc.setFontSize(9);
  doc.text('Date', 165, signatureY + 35, { align: 'center' });

  const useSignature = config.use_signature_image === 'true' && config.commissioner_signature_base64;
  if (useSignature) {
    try {
      doc.addImage(config.commissioner_signature_base64, 'PNG', pageWidth - 220, signatureY - 40, 120, 30);
    } catch (error) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'italic');
      doc.text(config.commissioner_name, pageWidth - 165, signatureY - 10, { align: 'center' });
    }
  } else {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'italic');
    doc.text(config.commissioner_name, pageWidth - 165, signatureY - 10, { align: 'center' });
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`${config.commissioner_name}, ${config.commissioner_title}`, pageWidth - 165, signatureY + 20, { align: 'center' });

  return doc.output('dataurlstring');
}

export async function generateTestResultsDocument(
  report: Report,
  jurisdiction: Jurisdiction,
  complianceResult: ComplianceResult,
  issueDate?: Date
): Promise<string> {
  const doc = new jsPDF('portrait', 'pt', 'letter');
  const pageWidth = doc.internal.pageSize.width;
  const config = await getSystemConfig();
  const officialDate = issueDate || new Date();

  addMMBLogo(doc, config.mmb_logo_base64, 50, 40, 180);

  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(1);
  doc.line(50, 85, pageWidth - 50, 85);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Results of Tests for Pay Equity Compliance', pageWidth / 2, 120, { align: 'center' });

  let yPos = 160;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${formatOfficialDate(officialDate)}`, 50, yPos);

  yPos += 18;
  const jurisdictionLine = `Jurisdiction: ${jurisdiction.name} (${jurisdiction.jurisdiction_id})`;
  doc.text(jurisdictionLine, 50, yPos);
  doc.text(`ID#: ${jurisdiction.jurisdiction_id}`, pageWidth - 150, yPos);

  yPos += 40;
  doc.setFont('helvetica', 'bold');
  doc.text('1. Completeness and Accuracy Test', 50, yPos);
  yPos += 20;
  doc.setFont('helvetica', 'normal');

  const submittedOnTime = report.submitted_on_time ?? true;
  addCheckbox(doc, 70, yPos - 8, submittedOnTime);
  doc.text('Passed. Required information was submitted accurately and on time.', 90, yPos);

  yPos += 40;
  doc.setFont('helvetica', 'bold');
  doc.text('2. Alternative Analysis Test', 50, yPos);
  yPos += 20;
  doc.setFont('helvetica', 'normal');

  const maleClasses = complianceResult.generalInfo.maleClasses;
  const usedAlternativeTest = maleClasses <= 3;
  const option1 = usedAlternativeTest && maleClasses <= 3;
  const option2 = !usedAlternativeTest && maleClasses >= 4 && maleClasses <= 5;
  const option3 = !usedAlternativeTest && maleClasses >= 6;

  addCheckbox(doc, 70, yPos - 8, option1);
  const text1 = 'Passed. Jurisdiction had three or fewer male classes and there was no';
  doc.text(text1, 90, yPos);
  yPos += 16;
  doc.text('compensation disadvantage for at least 80% of female classes compared to male', 90, yPos);
  yPos += 16;
  doc.text('classes.', 90, yPos);

  yPos += 24;
  addCheckbox(doc, 70, yPos - 8, option2);
  doc.text('Passed. Jurisdiction had four or five male classes, an underpayment ratio below', 90, yPos);
  yPos += 16;
  doc.text('80%, but no compensation disadvantage for at least 80% of female classes', 90, yPos);
  yPos += 16;
  doc.text('compared to male classes. Jurisdictions in this category started in the statistical', 90, yPos);
  yPos += 16;
  doc.text('analysis but moved to the alternative analysis because of the combination of', 90, yPos);
  yPos += 16;
  doc.text('factors listed.', 90, yPos);

  yPos += 24;
  addCheckbox(doc, 70, yPos - 8, option3);
  doc.text('Passed. Jurisdiction had at least six male classes, no classes with a salary range,', 90, yPos);
  yPos += 16;
  doc.text('an underpayment ratio below 80%, but no compensation disadvantage for at', 90, yPos);
  yPos += 16;
  doc.text('least 80% of female classes compared to male classes. Jurisdictions in this', 90, yPos);
  yPos += 16;
  doc.text('category started in the statistical analysis but moved to the alternative analysis', 90, yPos);
  yPos += 16;
  doc.text('because of the combination of factors listed.', 90, yPos);

  yPos += 40;
  doc.setFont('helvetica', 'bold');
  doc.text('3. Salary Range Test', 50, yPos);
  yPos += 20;
  doc.setFont('helvetica', 'normal');

  const salaryRangeNotApplicable = !complianceResult.salaryRangeTest?.applicable;
  const salaryRangePassed = complianceResult.salaryRangeTest?.passed && complianceResult.salaryRangeTest?.applicable;

  addCheckbox(doc, 70, yPos - 8, salaryRangeNotApplicable);
  doc.text('Passed. Too few classes had an established number of years to move through a', 90, yPos);
  yPos += 16;
  doc.text('salary range.', 90, yPos);

  yPos += 24;
  addCheckbox(doc, 70, yPos - 8, salaryRangePassed);
  doc.text('Passed. Salary range test showed a score of 80% or more.', 90, yPos);

  yPos += 40;
  doc.setFont('helvetica', 'bold');
  doc.text('4. Exceptional Service Pay Test', 50, yPos);
  yPos += 20;
  doc.setFont('helvetica', 'normal');

  const exceptionalNotApplicable = !complianceResult.exceptionalServiceTest?.applicable;
  const exceptionalPassed = complianceResult.exceptionalServiceTest?.passed && complianceResult.exceptionalServiceTest?.applicable;

  addCheckbox(doc, 70, yPos - 8, exceptionalNotApplicable);
  doc.text('Passed. Too few classes received exceptional service pay.', 90, yPos);

  yPos += 24;
  addCheckbox(doc, 70, yPos - 8, exceptionalPassed);
  doc.text('Passed. Exceptional service pay test showed a score of 80% or more.', 90, yPos);

  yPos += 50;
  doc.setFontSize(10);
  const contactText = `If you have questions or need assistance, please contact ${config.contact_person_name} at ${config.contact_person_phone}, or by email: ${config.contact_person_email}`;
  const contactLines = doc.splitTextToSize(contactText, pageWidth - 100);
  contactLines.forEach((line: string) => {
    doc.text(line, 50, yPos);
    yPos += 14;
  });

  return doc.output('dataurlstring');
}

export async function saveCertificatesToDatabase(
  reportId: string,
  certificateData: string,
  testResultsData: string,
  commissionerName: string,
  issueDate: Date,
  version: number = 1
) {
  const { data, error } = await supabase
    .from('compliance_certificates')
    .insert({
      report_id: reportId,
      certificate_data: certificateData,
      test_results_document: testResultsData,
      document_issue_date: issueDate.toISOString(),
      commissioner_name: commissionerName,
      document_version: version
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCertificatesForReport(reportId: string) {
  const { data, error } = await supabase
    .from('compliance_certificates')
    .select('*')
    .eq('report_id', reportId)
    .order('document_version', { ascending: false });

  if (error) throw error;
  return data;
}
