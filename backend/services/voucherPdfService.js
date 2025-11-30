import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatVoucherDate } from '../utils/dateUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Company information
const COMPANY_INFO = {
  name: 'AMU MULTI SERVICES LTD.',
  registration: 'RC 1322770',
  slogan: 'Partners of Progress',
  address: 'No. 1, MANGA PLAZA, MAIN MARKET ROAD, HERWA GANA, GOMBE, GOMBE STATE, NIGERIA',
  mobiles: ['+2349033111486', '+234 9038433575'],
  email: 'amumultis@gmail.com'
};

// Convert number to words
function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
  if (num < 1000000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
  if (num < 1000000000) return numberToWords(Math.floor(num / 1000000)) + ' Million' + (num % 1000000 !== 0 ? ' ' + numberToWords(num % 1000000) : '');
  return numberToWords(Math.floor(num / 1000000000)) + ' Billion' + (num % 1000000000 !== 0 ? ' ' + numberToWords(num % 1000000000) : '');
}

export function generatePaymentVoucherPDF(voucherData, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      size: 'A4',
      margin: 40 
    });
    const stream = fs.createWriteStream(outputPath);
    
    doc.pipe(stream);

    let yPos = 30;
    const pageWidth = 595.28; // A4 width in points
    const leftMargin = 50;
    const rightMargin = pageWidth - 50;

    // Company Header - Simple and clean (matching example)
    doc.fontSize(18).font('Helvetica-Bold').text(COMPANY_INFO.name, { align: 'center', y: yPos });
    yPos += 22;
    
    // Slogan
    doc.fontSize(11).font('Helvetica').text(COMPANY_INFO.slogan, { align: 'center', y: yPos });
    yPos += 18;
    
    // Registration
    doc.fontSize(9).text(`Registration: ${COMPANY_INFO.registration}`, { align: 'center', y: yPos });
    yPos += 12;
    
    // Address
    doc.fontSize(8).text(COMPANY_INFO.address, { align: 'center', y: yPos });
    yPos += 12;
    
    // Mobiles and Email
    doc.fontSize(8).text(`Mobiles: ${COMPANY_INFO.mobiles.join(', ')}`, { align: 'center', y: yPos });
    yPos += 10;
    doc.fontSize(8).text(`Email: ${COMPANY_INFO.email}`, { align: 'center', y: yPos });
    yPos += 20;

    // Voucher Number (top right) - Matching example format
    const voucherNumber = voucherData.voucher_number || '';
    const voucherNumText = `Voucher No. ${voucherNumber}`;
    const voucherNumWidth = doc.widthOfString(voucherNumText, { fontSize: 10, font: 'Helvetica-Bold' });
    doc.fontSize(10).font('Helvetica-Bold').text(voucherNumText, rightMargin - voucherNumWidth, 40);
    
    yPos += 5;

    // Voucher Details Section - Matching example layout
    const detailsX = leftMargin;
    doc.fontSize(10).font('Helvetica');
    
    // VOUCHER NO: field (left side, can be empty as number is at top right)
    doc.font('Helvetica-Bold').text('VOUCHER NO.:', detailsX, yPos);
    yPos += 20;
    
           // DATE
           doc.font('Helvetica-Bold').text('DATE:', detailsX, yPos);
           let formattedDate = voucherData.date || '';
           // Use Nigerian timezone formatting
           if (formattedDate) {
             formattedDate = formatVoucherDate(formattedDate);
           }
           doc.font('Helvetica').text(formattedDate, detailsX + 60, yPos);
    
    // In Favour Of
    yPos += 20;
    doc.font('Helvetica-Bold').text('IFO (In Favour Of):', detailsX, yPos);
    doc.font('Helvetica').text(voucherData.in_favour_of || '', detailsX + 120, yPos);
    
    yPos += 30;

    // Itemized Details Table - Simple layout matching example
    const tableX = detailsX;
    const tableWidth = 500;
    const rowHeight = 20;
    const colWidths = { 
      sn: 40, 
      route: 150, 
      trips: 120, 
      rate: 120, 
      total: 70 
    };
    
    const headerY = yPos;
    
    // Table Headers - Simple and clean
    doc.fontSize(10).font('Helvetica-Bold');
    let xPos = tableX;
    doc.text('S/N', xPos, headerY);
    xPos += colWidths.sn;
    doc.text('ROUTE', xPos, headerY);
    xPos += colWidths.route;
    doc.text('NO. OF TRIPS', xPos, headerY);
    xPos += colWidths.trips;
    doc.text('TRIP RATE (N)', xPos, headerY);
    xPos += colWidths.rate;
    doc.text('TOTAL (N)', xPos, headerY);
    
    // Draw header underline
    yPos += 15;
    doc.moveTo(tableX, yPos).lineTo(tableX + tableWidth, yPos).stroke();
    yPos += 8;

    // Table Rows - Simple layout
    doc.font('Helvetica').fontSize(9);
    const items = voucherData.items || [];
    items.forEach((item, index) => {
      if (yPos > 650) {
        doc.addPage();
        yPos = 50;
      }
      
      xPos = tableX;
      // S/N
      doc.text(String(index + 1), xPos, yPos);
      xPos += colWidths.sn;
      
      // ROUTE
      doc.text(item.route || '', xPos, yPos, { width: colWidths.route - 5 });
      xPos += colWidths.route;
      
      // NO. OF TRIPS
      doc.text(item.no_of_trips ? String(item.no_of_trips) : '', xPos, yPos);
      xPos += colWidths.trips;
      
      // TRIP RATE (N) - Format as Naira
      doc.text(item.trip_rate ? `₦${parseFloat(item.trip_rate).toLocaleString()}` : '', xPos, yPos);
      xPos += colWidths.rate;
      
      // TOTAL (N) - Format as Naira
      doc.text(item.total ? `₦${parseFloat(item.total).toLocaleString()}` : '', xPos, yPos);
      
      yPos += 18;
    });
    
    // Draw bottom line of table
    doc.moveTo(tableX, yPos).lineTo(tableX + tableWidth, yPos).stroke();
    yPos += 25;

    // Summary Section - HEAD / N on left, financial items on right (matching example)
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('HEAD / N', detailsX, yPos);
    yPos += 22;
    
    doc.font('Helvetica').fontSize(9);
    const summaryX = detailsX + 200;
    const summaryValueX = summaryX + 180;
    
    // Calculate subtotal from items if not provided
    const calculatedSubtotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.total || 0));
    }, 0);
    const subtotal = parseFloat(voucherData.subtotal || calculatedSubtotal || 0);
    const prevBalance = parseFloat(voucherData.prev_balance || 0);
    const advancePaid = parseFloat(voucherData.advance_paid || 0);
    const totalCostShortage = parseFloat(voucherData.total_cost_shortage || 0);
    const totalCostRepacking = parseFloat(voucherData.total_cost_repacking || 0);
    const totalDue = parseFloat(voucherData.total_due || (subtotal + prevBalance - advancePaid + totalCostShortage + totalCostRepacking));
    
    // SUBTOTAL
    doc.text('SUBTOTAL:', summaryX, yPos);
    doc.text(subtotal > 0 ? `₦${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '', summaryValueX, yPos);
    yPos += 16;
    
    // PREV. BALANCE
    doc.text('PREV. BALANCE:', summaryX, yPos);
    doc.text(prevBalance > 0 ? `₦${prevBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '', summaryValueX, yPos);
    yPos += 16;
    
    // ADVANCE PAID (Bold)
    doc.text('ADVANCE PAID:', summaryX, yPos);
    doc.font('Helvetica-Bold');
    doc.text(advancePaid > 0 ? `₦${advancePaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '', summaryValueX, yPos);
    doc.font('Helvetica');
    yPos += 16;
    
    // TOTAL COST OF SHORTAGE
    doc.text('TOTAL COST OF SHORTAGE:', summaryX, yPos);
    doc.text(totalCostShortage > 0 ? `₦${totalCostShortage.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '', summaryValueX, yPos);
    yPos += 16;
    
    // TOTAL COST OF REPACKING
    doc.text('TOTAL COST OF REPACKING:', summaryX, yPos);
    doc.text(totalCostRepacking > 0 ? `₦${totalCostRepacking.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '', summaryValueX, yPos);
    yPos += 16;
    
    // TOTAL DUE (Bold)
    doc.text('TOTAL DUE:', summaryX, yPos);
    doc.font('Helvetica-Bold');
    doc.text(totalDue > 0 ? `₦${totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '', summaryValueX, yPos);
    doc.font('Helvetica');
    yPos += 30;

    // Payment Information - Matching example format
    const totalAmount = advancePaid || totalDue || 0;
    const amountInWords = numberToWords(Math.floor(totalAmount)) + ' Naira only.';
    
    doc.fontSize(10);
    doc.text('Amount in words:', detailsX, yPos);
    doc.font('Helvetica-Bold');
    doc.text(amountInWords, detailsX + 100, yPos, { width: 400 });
    doc.font('Helvetica');
    yPos += 25;
    
    // Pay Mode Section - Matching example format
    doc.fontSize(10);
    doc.text('Pay Mode:', detailsX, yPos);
    yPos += 18;
    doc.text('1. Cash:', detailsX + 20, yPos);
    if (voucherData.pay_mode === 'cash') {
      doc.font('Helvetica-Bold').text('✓', detailsX + 100, yPos).font('Helvetica');
    }
    
    doc.text('2. Bank:', detailsX + 20, yPos + 15);
    if (voucherData.pay_mode === 'bank') {
      doc.font('Helvetica-Bold').text('✓', detailsX + 100, yPos + 15).font('Helvetica');
      if (voucherData.bank_details && voucherData.bank_details.type) {
        doc.text(`(${voucherData.bank_details.type})`, detailsX + 130, yPos + 15);
      }
    }
    yPos += 35;
    
    // Bank Details (if bank payment)
    if (voucherData.pay_mode === 'bank' && voucherData.bank_details) {
      doc.text('Acct. Name:', detailsX, yPos);
      doc.text(voucherData.bank_details.account_name || '', detailsX + 100, yPos);
      yPos += 16;
      doc.text('Acct. No:', detailsX, yPos);
      doc.text(voucherData.bank_details.account_number || '', detailsX + 100, yPos);
      yPos += 25;
    }

    // Authorization Section - Matching example format
    yPos += 10;
    doc.fontSize(10);
    doc.text('Date of Payment:', detailsX, yPos);
    const paymentDate = voucherData.date_of_payment || voucherData.date || '';
    let formattedPaymentDate = paymentDate ? formatVoucherDate(paymentDate) : '';
    doc.text(formattedPaymentDate, detailsX + 120, yPos);
    
    yPos += 40;
    doc.text('Prepared By:', detailsX, yPos);
    doc.text(voucherData.prepared_by || '', detailsX + 100, yPos);
    
    yPos += 20;
    doc.text('Approved By:', detailsX, yPos);
    doc.text(voucherData.approved_by || '', detailsX + 100, yPos);

    doc.end();
    
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}
