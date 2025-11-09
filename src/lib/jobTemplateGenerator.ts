import * as XLSX from 'xlsx';

export function generateJobImportTemplate(): void {
  const headers = ['jobid', 'title', 'males', 'females', 'points', 'mins', 'maxs', 'yrmax', 'yrsrv', 'exsrv'];

  const sampleData = [1, 'Accountant', 3, 5, 450, 45000, 65000, 5, 2, 'A'];

  const worksheetData = [headers, sampleData];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 25 },
    { wch: 8 },
    { wch: 10 },
    { wch: 8 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'JobImportTemplate');

  XLSX.writeFile(workbook, 'job_import_template.xlsx');
}
