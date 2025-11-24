import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, FileDown } from 'lucide-react';
import { Report, JobClassification, Jurisdiction } from '../lib/supabase';
import { PredictedPayScatterChart } from './PredictedPayScatterChart';
import { PredictedPayJobTable } from './PredictedPayJobTable';
import {
  enrichJobsWithPredictedPay,
  calculateLinearRegression,
  getChartData,
  JobWithPredictedPay,
} from '../lib/predictedPayAnalysis';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addLogoToPDF } from '../lib/pdfGenerator';
import { Chart as ChartJS } from 'chart.js';

type PredictedPayReportPageProps = {
  report: Report;
  jurisdiction: Jurisdiction;
  jobs: JobClassification[];
  onBack: () => void;
};

export function PredictedPayReportPage({
  report,
  jurisdiction,
  jobs,
  onBack,
}: PredictedPayReportPageProps) {
  const [enrichedJobs, setEnrichedJobs] = useState<JobWithPredictedPay[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [regression, setRegression] = useState<any>(null);
  const chartRef = useRef<ChartJS<'scatter'>>(null);

  useEffect(() => {
    const jobsWithPredictedPay = enrichJobsWithPredictedPay(jobs);
    const regressionResult = calculateLinearRegression(jobs);
    const data = getChartData(jobsWithPredictedPay, regressionResult);

    setEnrichedJobs(jobsWithPredictedPay);
    setRegression(regressionResult);
    setChartData(data);
  }, [jobs]);

  async function exportToPDF() {
    const doc = new jsPDF('portrait', 'pt', 'letter');
    const pageWidth = 612;
    const pageHeight = 792;
    const marginLeft = 40;
    const marginRight = 40;
    const marginTop = 60;

    await addLogoToPDF(doc, '/MMB_logo copy copy copy.jpg');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const titleText = `Predicted Pay Report for: ${jurisdiction.name}`;
    doc.text(titleText, pageWidth / 2, 70, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const caseText = `Case: ${report.report_year} DATA`;
    doc.text(caseText, pageWidth / 2, 90, { align: 'center' });

    if (chartRef.current) {
      const chartImage = chartRef.current.toBase64Image();
      doc.addImage(chartImage, 'PNG', marginLeft, 110, pageWidth - marginLeft - marginRight, 300);
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page 1 of 5`, pageWidth - marginRight, pageHeight - 30, { align: 'right' });
    const timestamp = new Date().toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    doc.text(timestamp, pageWidth - marginRight, pageHeight - 20, { align: 'right' });

    const sortedJobs = [...enrichedJobs].sort((a, b) => a.points - b.points);

    const tableData = sortedJobs.map((job, index) => {
      const total = job.males + job.females;
      const nonBinary = 0;

      return [
        job.job_number || (index + 1).toString(),
        job.title,
        job.males.toString(),
        job.females.toString(),
        nonBinary.toString(),
        total.toString(),
        job.job_type,
        job.points.toString(),
        job.max_salary.toFixed(4),
        job.predicted_pay.toFixed(4),
        job.pay_difference.toFixed(4),
      ];
    });

    let currentPage = 2;
    const rowsPerPage = 35;

    for (let i = 0; i < tableData.length; i += rowsPerPage) {
      if (i > 0) {
        doc.addPage();
      } else {
        doc.addPage();
      }

      await addLogoToPDF(doc, '/MMB_logo copy copy copy.jpg');

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(titleText, pageWidth / 2, 70, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(caseText, pageWidth / 2, 90, { align: 'center' });

      const pageData = tableData.slice(i, i + rowsPerPage);

      autoTable(doc, {
        head: [
          [
            'Job Nbr',
            'Job Title',
            'Nbr\nMales',
            'Nbr\nFemales',
            'Non-\nBinary',
            'Total\nNbr',
            'Job Type',
            'Job\nPoints',
            'Max Mo Salary',
            'Predicted Pay',
            'Pay Difference',
          ],
        ],
        body: pageData,
        startY: 110,
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          lineWidth: 0.5,
          lineColor: [0, 0, 0],
          halign: 'center',
        },
        columnStyles: {
          0: { cellWidth: 35, halign: 'left' },
          1: { cellWidth: 110, halign: 'left' },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 35, halign: 'center' },
          4: { cellWidth: 30, halign: 'center' },
          5: { cellWidth: 30, halign: 'center' },
          6: { cellWidth: 50, halign: 'center' },
          7: { cellWidth: 35, halign: 'center' },
          8: { cellWidth: 60, halign: 'right' },
          9: { cellWidth: 60, halign: 'right' },
          10: { cellWidth: 60, halign: 'right' },
        },
        margin: { left: marginLeft, right: marginRight },
      });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${currentPage} of 5`, pageWidth - marginRight, pageHeight - 30, {
        align: 'right',
      });
      doc.text(timestamp, pageWidth - marginRight, pageHeight - 20, { align: 'right' });

      currentPage++;
    }

    doc.save(`${jurisdiction.name}_${report.report_year}_Predicted_Pay_Report.pdf`);
  }

  if (!chartData || !regression) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003865] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

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
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 px-6 py-3 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
        >
          <FileDown className="w-5 h-5" />
          Export to PDF
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6 text-center">
          <img
            src="/MMB_logo copy copy copy.jpg"
            alt="Management and Budget"
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">
            Predicted Pay Report for: {jurisdiction.name}
          </h1>
          <p className="text-lg text-gray-700 mt-2">Case: {report.report_year} DATA</p>
        </div>

        <div className="mb-8">
          <PredictedPayScatterChart
            maleJobs={chartData.maleJobs}
            femaleJobs={chartData.femaleJobs}
            balancedJobs={chartData.balancedJobs}
            regressionLine={chartData.regressionLine}
            lineExtension={chartData.lineExtension}
            regression={regression}
            chartRef={chartRef}
          />
        </div>

        <div className="mt-8">
          <PredictedPayJobTable jobs={enrichedJobs} />
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>
            Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </span>
          <span>Page 1 of 5</span>
        </div>
      </div>
    </div>
  );
}
