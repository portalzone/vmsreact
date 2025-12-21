import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file (without extension)
 * @param {String} sheetName - Name of the worksheet
 */
export const exportToExcel = (data, filename = 'export', sheetName = 'Sheet1') => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Create blob and save
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Export to Excel failed:', error);
    return false;
  }
};

/**
 * Format data for export by removing unnecessary fields
 * @param {Array} data - Raw data array
 * @param {Array} excludeFields - Fields to exclude from export
 */
export const formatDataForExport = (data, excludeFields = []) => {
  return data.map(item => {
    const formatted = { ...item };
    
    // Remove excluded fields
    excludeFields.forEach(field => {
      delete formatted[field];
    });
    
    // Remove common unnecessary fields
    delete formatted.created_at;
    delete formatted.updated_at;
    delete formatted.deleted_at;
    
    return formatted;
  });
};
