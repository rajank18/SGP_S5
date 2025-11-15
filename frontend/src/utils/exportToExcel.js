// Dynamic import to support both CommonJS and ES modules
let XLSX;

async function loadXLSX() {
  if (!XLSX) {
    try {
      XLSX = await import('xlsx');
    } catch (error) {
      console.error('Failed to load XLSX library. Please install it using: npm install xlsx');
      throw new Error('XLSX library is not installed. Please install it first.');
    }
  }
  return XLSX;
}

/**
 * Export course project data to Excel file
 * @param {Array} exportData - Array of project data
 * @param {String} courseName - Name of the course
 * @param {String} exportDate - Date of export
 */
export const generateExcelExport = async (exportData, courseName = 'Course Export', exportDate = new Date()) => {
  try {
    const XLSX_lib = await loadXLSX();
    
    // Calculate max weeks across all projects
    const maxWeeks = Math.max(...exportData.map(item => item.maxWeeks || 0), 0);

    // Build header row
    const headers = [
      'Group Name',
      'Project Title',
      'Student Names',
      'Final Report Link',
      'PPT Link',
      'GitHub Repository Link'
    ];

    // Add evaluation score headers dynamically
    const evaluationHeaders = new Set();
    exportData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key.startsWith('evaluationScore_')) {
          evaluationHeaders.add(key);
        }
      });
    });
    
    evaluationHeaders.forEach(header => {
      const parts = header.split('_');
      const rubricName = parts.slice(2).join(' ');
      headers.push(`${rubricName}`);
    });
    
    headers.push('Total Evaluation Score');

    // Add week headers
    for (let week = 1; week <= maxWeeks; week++) {
      headers.push(`Week ${week}`);
    }

    // Build data rows
    const rows = [];
    rows.push(headers);

    exportData.forEach(item => {
      const row = [
        item.groupName,
        item.projectTitle,
        item.studentNames,
        item.finalReportLink,
        item.pptLink,
        item.githubLink
      ];

      // Add evaluation scores
      evaluationHeaders.forEach(header => {
        row.push(item[header] || '');
      });

      row.push(item.totalEvaluationScore || 0);

      // Add weekly submission status
      for (let week = 1; week <= maxWeeks; week++) {
        const status = item[`week_${week}_status`];
        row.push(status || 'Not Submitted');
      }

      rows.push(row);
    });

    // Create workbook
    const workbook = XLSX_lib.utils.book_new();

    // Add main data sheet
    const worksheet = XLSX_lib.utils.aoa_to_sheet(rows);
    
    // Set column widths
    worksheet['!cols'] = headers.map((header, idx) => {
      if (idx >= headers.length - maxWeeks) {
        return { wch: 12 };
      }
      if (header.includes('Link')) {
        return { wch: 25 };
      }
      if (header === 'Student Names') {
        return { wch: 30 };
      }
      return { wch: 20 };
    });

    XLSX_lib.utils.book_append_sheet(workbook, worksheet, 'Project Data');

    // Create summary sheet
    const summaryData = [
      ['Course Export Summary'],
      [],
      ['Course Name', courseName],
      ['Export Date', exportDate.toLocaleString()],
      ['Total Groups', exportData.length],
      ['Total Weeks', maxWeeks],
      [],
      ['Submission Summary']
    ];

    // Add submission statistics
    for (let week = 1; week <= maxWeeks; week++) {
      const submitted = exportData.filter(item => item[`week_${week}_status`] === 'Submitted').length;
      const total = exportData.length;
      summaryData.push([`Week ${week}`, `${submitted}/${total} submitted`]);
    }

    const summarySheet = XLSX_lib.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 20 }, { wch: 30 }];
    XLSX_lib.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Generate file name
    const timestamp = new Date().getTime();
    const fileName = `${courseName.replace(/\s+/g, '_')}_Export_${timestamp}.xlsx`;

    // Write file
    XLSX_lib.writeFile(workbook, fileName);
    return true;
  } catch (error) {
    console.error('Error generating Excel export:', error);
    throw error;
  }
};

/**
 * Export as CSV format
 */
export const generateCSVExport = (exportData, courseName = 'Course Export') => {
  try {
    const maxWeeks = Math.max(...exportData.map(item => item.maxWeeks || 0), 0);

    // Build CSV header
    const headers = [
      'Group Name',
      'Project Title',
      'Student Names',
      'Final Report Link',
      'PPT Link',
      'GitHub Repository Link'
    ];

    // Add evaluation score headers
    const evaluationHeaders = new Set();
    exportData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key.startsWith('evaluationScore_')) {
          evaluationHeaders.add(key);
        }
      });
    });
    
    evaluationHeaders.forEach(header => {
      const parts = header.split('_');
      const rubricName = parts.slice(2).join(' ');
      headers.push(rubricName);
    });
    
    headers.push('Total Evaluation Score');

    // Add week headers
    for (let week = 1; week <= maxWeeks; week++) {
      headers.push(`Week ${week}`);
    }

    // Build CSV rows
    let csv = headers.map(h => `"${h}"`).join(',') + '\n';

    exportData.forEach(item => {
      const row = [
        `"${item.groupName}"`,
        `"${item.projectTitle}"`,
        `"${item.studentNames}"`,
        `"${item.finalReportLink}"`,
        `"${item.pptLink}"`,
        `"${item.githubLink}"`
      ];

      // Add evaluation scores
      evaluationHeaders.forEach(header => {
        row.push(`"${item[header] || ''}"`);
      });

      row.push(`"${item.totalEvaluationScore || 0}"`);

      // Add weekly submission status
      for (let week = 1; week <= maxWeeks; week++) {
        const status = item[`week_${week}_status`] || 'Not Submitted';
        row.push(`"${status}"`);
      }

      csv += row.join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().getTime();
    link.setAttribute('href', url);
    link.setAttribute('download', `${courseName.replace(/\s+/g, '_')}_Export_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error generating CSV export:', error);
    throw error;
  }
};
