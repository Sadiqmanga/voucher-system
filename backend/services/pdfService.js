import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateVoucherReport(vouchers, status, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    
    doc.pipe(stream);

    // Header with AMU branding
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#333').text('AMU MULTI SERVICES LTD', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(18).font('Helvetica').fillColor('#666').text('Voucher Management System', { align: 'center' });
    doc.moveDown();
    const statusLabel = status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1);
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#667eea').text(`${statusLabel} Vouchers Report`, { align: 'center' });
    doc.fillColor('#000'); // Reset to black
    doc.moveDown(2);

    // Report date and date range if provided
    doc.fontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();
    if (vouchers.length > 0) {
      const firstDate = new Date(vouchers[vouchers.length - 1].created_at).toLocaleDateString();
      const lastDate = new Date(vouchers[0].created_at).toLocaleDateString();
      if (firstDate !== lastDate) {
        doc.text(`Date Range: ${firstDate} to ${lastDate}`, { align: 'right' });
      }
    }
    doc.moveDown(2);

    // Table header
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Voucher Number', 50, doc.y);
    doc.text('Accountant', 200, doc.y);
    doc.text('GM Status', 350, doc.y);
    doc.text('Uploader Status', 450, doc.y);
    doc.text('Date', 550, doc.y);
    
    doc.moveTo(50, doc.y + 5).lineTo(750, doc.y + 5).stroke();
    doc.moveDown();

    // Voucher rows
    doc.font('Helvetica').fontSize(10);
    vouchers.forEach((voucher, index) => {
      if (doc.y > 700) {
        doc.addPage();
        // Redraw header on new page
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text('Voucher Number', 50, 50);
        doc.text('Accountant', 200, 50);
        doc.text('GM Status', 350, 50);
        doc.text('Uploader Status', 450, 50);
        doc.text('Date', 550, 50);
        doc.moveTo(50, 55).lineTo(750, 55).stroke();
        doc.font('Helvetica').fontSize(10);
        doc.y = 70;
      }

      doc.text(voucher.voucher_number || 'N/A', 50, doc.y);
      doc.text(voucher.accountant_name || 'N/A', 200, doc.y);
      doc.text(voucher.gm_status || 'N/A', 350, doc.y);
      doc.text(voucher.uploader_status || 'N/A', 450, doc.y);
      doc.text(new Date(voucher.created_at).toLocaleDateString(), 550, doc.y);
      doc.moveDown();
    });

    // Footer
    const statusLabel = status === 'all' ? 'total' : status;
    doc.fontSize(10).text(`Total ${statusLabel} vouchers: ${vouchers.length}`, 50, doc.y + 20);

    doc.end();
    
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

