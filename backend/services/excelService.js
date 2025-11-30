import XLSX from 'xlsx';
import fs from 'fs';

export function generateVoucherExcelReport(vouchers, status, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      // Prepare data for Excel
      const statusLabel = status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1);
      
      // Create worksheet data
      const worksheetData = [
        // Column headers
        [
          'Voucher Number',
          'Date',
          'In Favour Of',
          'Accountant',
          'GM Status',
          'Uploader Status',
          'Uploader',
          'Amount (₦)',
          'Created At',
          'GM Verified At',
          'Uploader Verified At'
        ]
      ];

      // Add voucher rows
      vouchers.forEach((voucher) => {
        try {
          const voucherData = JSON.parse(voucher.voucher_data || '{}');
          const amount = voucherData.advance_paid || voucherData.total_due || 0;
          
          worksheetData.push([
            voucher.voucher_number || '',
            voucherData.date || '',
            voucherData.in_favour_of || '',
            voucher.accountant_name || '',
            voucher.gm_status || '',
            voucher.uploader_status || '',
            voucher.uploader_name || 'Not assigned',
            amount,
            voucher.created_at ? new Date(voucher.created_at).toLocaleString() : '',
            voucher.gm_verified_at ? new Date(voucher.gm_verified_at).toLocaleString() : '',
            voucher.uploader_verified_at ? new Date(voucher.uploader_verified_at).toLocaleString() : ''
          ]);
        } catch (e) {
          console.error('Error parsing voucher data:', e);
          // Add row with basic info even if parsing fails
          worksheetData.push([
            voucher.voucher_number || '',
            '',
            '',
            voucher.accountant_name || '',
            voucher.gm_status || '',
            voucher.uploader_status || '',
            voucher.uploader_name || 'Not assigned',
            0,
            voucher.created_at ? new Date(voucher.created_at).toLocaleString() : '',
            voucher.gm_verified_at ? new Date(voucher.gm_verified_at).toLocaleString() : '',
            voucher.uploader_verified_at ? new Date(voucher.uploader_verified_at).toLocaleString() : ''
          ]);
        }
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 15 }, // Voucher Number
        { wch: 12 }, // Date
        { wch: 25 }, // In Favour Of
        { wch: 20 }, // Accountant
        { wch: 12 }, // GM Status
        { wch: 15 }, // Uploader Status
        { wch: 20 }, // Uploader
        { wch: 15 }, // Amount
        { wch: 20 }, // Created At
        { wch: 20 }, // GM Verified At
        { wch: 20 }  // Uploader Verified At
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Vouchers');

      // Write file
      XLSX.writeFile(workbook, outputPath);

      resolve(outputPath);
    } catch (error) {
      reject(error);
    }
  });
}

