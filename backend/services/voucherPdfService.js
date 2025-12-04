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
  registration: 'RC-13227/70',
  slogan: '... Partners of Progress',
  address: 'No. 1, MANGA PLAZA, MAIN MARKET ROAD, HERWA GANA, GOMBE, GOMBE STATE, NIGERIA',
  mobiles: ['+2349033111486', '+234 9038433575'],
  email: 'amumultis@gmail.com'
};

// Convert number to words (matching format: "Eleven Million, Eight Hundred & Forty thousand Five Hundred")
function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const result = tens[Math.floor(num / 10)];
    return num % 10 !== 0 ? result + ' ' + ones[num % 10] : result;
  }
  if (num < 1000) {
    const hundreds = ones[Math.floor(num / 100)] + ' Hundred';
    const remainder = num % 100;
    return remainder !== 0 ? hundreds + ' & ' + numberToWords(remainder) : hundreds;
  }
  if (num < 1000000) {
    const thousands = numberToWords(Math.floor(num / 1000)) + ' Thousand';
    const remainder = num % 1000;
    return remainder !== 0 ? thousands + ', ' + numberToWords(remainder) : thousands;
  }
  if (num < 1000000000) {
    const millions = numberToWords(Math.floor(num / 1000000)) + ' Million';
    const remainder = num % 1000000;
    return remainder !== 0 ? millions + ', ' + numberToWords(remainder) : millions;
  }
  const billions = numberToWords(Math.floor(num / 1000000000)) + ' Billion';
  const remainder = num % 1000000000;
  return remainder !== 0 ? billions + ', ' + numberToWords(remainder) : billions;
}

// Format number with commas for display
function formatNumber(num) {
  return parseFloat(num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Draw simple logo representation (circular with AMS letters)
function drawLogo(doc, x, y, size = 50) {
  const radius = size / 2;
  const centerX = x + radius;
  const centerY = y + radius;
  
  // Draw circle
  doc.circle(centerX, centerY, radius)
     .fillColor('#3b82f6')
     .fill()
     .strokeColor('#ef4444')
     .lineWidth(2)
     .stroke();
  
  // Draw AMS letters inside (simplified representation)
  doc.fontSize(size * 0.3)
     .fillColor('#ffffff')
     .text('AMS', centerX - size * 0.15, centerY - size * 0.15, {
       width: size * 0.3,
       align: 'center'
     });
}

export function generatePaymentVoucherPDF(voucherData, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      size: 'A4',
      margin: 40 
    });
    const stream = fs.createWriteStream(outputPath);
    
    doc.pipe(stream);

    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const leftMargin = 50;
    const rightMargin = pageWidth - 50;
    let yPos = 30;

    // ===== HEADER SECTION =====
    // Logo at top-left
    const logoSize = 50;
    const logoX = leftMargin;
    const logoY = yPos;
    drawLogo(doc, logoX, logoY, logoSize);
    
    // Registration number below logo
    doc.fontSize(8)
       .fillColor('#000000')
       .font('Helvetica')
       .text(COMPANY_INFO.registration, logoX, logoY + logoSize + 5);
    
    // Voucher number at top-right (format: 000083)
    const voucherNumber = String(voucherData.voucher_number || '000000').padStart(6, '0');
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text(voucherNumber, rightMargin - 60, yPos + 10, { align: 'right' });
    
    // Company name - centered, blue, underlined
    yPos = logoY + logoSize + 20;
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#0000ff') // Blue color
       .text(COMPANY_INFO.name, leftMargin, yPos, { 
         width: pageWidth - 100,
         align: 'center'
       });
    
    // Draw underline
    const nameWidth = doc.widthOfString(COMPANY_INFO.name, { fontSize: 16, font: 'Helvetica-Bold' });
    const nameX = (pageWidth - nameWidth) / 2;
    doc.moveTo(nameX, yPos + 18)
       .lineTo(nameX + nameWidth, yPos + 18)
       .strokeColor('#0000ff')
       .lineWidth(1)
       .stroke();
    
    // Slogan
    yPos += 25;
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#000000')
       .text(COMPANY_INFO.slogan, leftMargin, yPos, { 
         width: pageWidth - 100,
         align: 'center'
       });
    
    // Address
    yPos += 15;
    doc.fontSize(8)
       .text(COMPANY_INFO.address, leftMargin, yPos, { 
         width: pageWidth - 100,
         align: 'center'
       });
    
    // Contact information
    yPos += 12;
    doc.fontSize(8)
       .text(`Mobiles: ${COMPANY_INFO.mobiles.join(', ')}`, leftMargin, yPos, { 
         width: pageWidth - 100,
         align: 'center'
       });
    
    yPos += 10;
    doc.fontSize(8)
       .text(`Email: ${COMPANY_INFO.email}`, leftMargin, yPos, { 
         width: pageWidth - 100,
         align: 'center'
       });
    
    yPos += 20;
    
    // ===== PAYMENT VOUCHER TITLE =====
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('PAYMENT VOUCHER', leftMargin, yPos, { 
         width: pageWidth - 100,
         align: 'center'
       });
    
    yPos += 25;
    
    // ===== VOUCHER DETAILS SECTION =====
    const detailsX = leftMargin;
    doc.fontSize(10)
       .font('Helvetica');
    
    // VOUCHER NO. (can be blank as number is at top right)
    doc.font('Helvetica-Bold').text('VOUCHER NO.:', detailsX, yPos);
    // Leave blank or show the number
    doc.font('Helvetica').text('', detailsX + 100, yPos);
    
    yPos += 20;
    
    // DATE
    doc.font('Helvetica-Bold').text('DATE:', detailsX, yPos);
    let formattedDate = voucherData.date || '';
    if (formattedDate) {
      formattedDate = formatVoucherDate(formattedDate);
    }
    doc.font('Helvetica').text(formattedDate, detailsX + 60, yPos);
    
    yPos += 20;
    
    // IFO (In Favour Of)
    doc.font('Helvetica-Bold').text('IFO:', detailsX, yPos);
    doc.font('Helvetica').text(voucherData.in_favour_of || '', detailsX + 50, yPos);
    
    yPos += 30;
    
    // ===== SERVICES TABLE =====
    const tableX = detailsX;
    const tableWidth = pageWidth - 100;
    const colWidths = { 
      sn: 50, 
      route: 150, 
      trips: 120, 
      rate: 140, 
      total: 135 
    };
    
    const headerY = yPos;
    
    // Table Header - Dark background
    doc.rect(tableX, headerY, tableWidth, 25)
       .fillColor('#1a1a1a') // Dark gray/black
       .fill();
    
    // Header text (white on dark background)
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#ffffff');
    
    let xPos = tableX + 5;
    doc.text('S/N', xPos, headerY + 8);
    xPos += colWidths.sn;
    doc.text('ROUTE', xPos, headerY + 8);
    xPos += colWidths.route;
    doc.text('NO. OF TRIPS', xPos, headerY + 8);
    xPos += colWidths.trips;
    doc.text('TRIP RATE (N)', xPos, headerY + 8);
    xPos += colWidths.rate;
    doc.text('TOTAL (N)', xPos, headerY + 8);
    
    yPos = headerY + 25;
    
    // Table Rows - Alternating colors
    doc.font('Helvetica')
       .fontSize(9)
       .fillColor('#000000');
    
    const items = voucherData.items || [];
    items.forEach((item, index) => {
      if (yPos > 650) {
        doc.addPage();
        yPos = 50;
      }
      
      // Alternate row background
      if (index % 2 === 0) {
        doc.rect(tableX, yPos - 2, tableWidth, 18)
           .fillColor('#f5f5f5')
           .fill();
      }
      
      xPos = tableX + 5;
      // S/N
      doc.fillColor('#000000').text(String(index + 1), xPos, yPos);
      xPos += colWidths.sn;
      
      // ROUTE
      doc.text(item.route || '', xPos, yPos, { width: colWidths.route - 5 });
      xPos += colWidths.route;
      
      // NO. OF TRIPS
      doc.text(item.no_of_trips ? String(item.no_of_trips) : '', xPos, yPos);
      xPos += colWidths.trips;
      
      // TRIP RATE (N) - Format as Naira
      doc.text(item.trip_rate ? `₦${formatNumber(item.trip_rate)}` : '', xPos, yPos);
      xPos += colWidths.rate;
      
      // TOTAL (N) - Format as Naira
      doc.text(item.total ? `₦${formatNumber(item.total)}` : '', xPos, yPos);
      
      yPos += 18;
    });
    
    // Draw table borders
    doc.strokeColor('#000000')
       .lineWidth(0.5);
    // Top border
    doc.moveTo(tableX, headerY).lineTo(tableX + tableWidth, headerY).stroke();
    // Bottom border
    doc.moveTo(tableX, yPos).lineTo(tableX + tableWidth, yPos).stroke();
    // Left border
    doc.moveTo(tableX, headerY).lineTo(tableX, yPos).stroke();
    // Right border
    doc.moveTo(tableX + tableWidth, headerY).lineTo(tableX + tableWidth, yPos).stroke();
    
    yPos += 20;
    
    // ===== FINANCIAL SUMMARY SECTION =====
    // HEAD / N label on left
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('HEAD', detailsX, yPos);
    
    doc.text('N', detailsX + 50, yPos);
    
    // Summary items on right
    const summaryX = detailsX + 200;
    const summaryValueX = summaryX + 200;
    
    doc.font('Helvetica')
       .fontSize(9);
    
    // Calculate values
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
    doc.text(subtotal > 0 ? `₦${formatNumber(subtotal)}` : '', summaryValueX, yPos, { align: 'right' });
    yPos += 16;
    
    // PREV. BALANCE (show line if empty)
    doc.text('PREV. BALANCE:', summaryX, yPos);
    if (prevBalance > 0) {
      doc.text(`₦${formatNumber(prevBalance)}`, summaryValueX, yPos, { align: 'right' });
    } else {
      // Draw line for empty field
      doc.moveTo(summaryValueX - 80, yPos + 8)
         .lineTo(summaryValueX, yPos + 8)
         .stroke();
    }
    yPos += 16;
    
    // ADVANCE PAID
    doc.font('Helvetica-Bold').text('ADVANCE PAID:', summaryX, yPos);
    doc.text(advancePaid > 0 ? `₦${formatNumber(advancePaid)}` : '', summaryValueX, yPos, { align: 'right' });
    doc.font('Helvetica');
    yPos += 16;
    
    // TOTAL COST OF SHORTAGE
    doc.text('TOTAL COST OF SHORTAGE:', summaryX, yPos);
    doc.text(totalCostShortage > 0 ? `₦${formatNumber(totalCostShortage)}` : '', summaryValueX, yPos, { align: 'right' });
    yPos += 16;
    
    // TOTAL COST OF REPACKING (show line if empty)
    doc.text('TOTAL COST OF REPACKING:', summaryX, yPos);
    if (totalCostRepacking > 0) {
      doc.text(`₦${formatNumber(totalCostRepacking)}`, summaryValueX, yPos, { align: 'right' });
    } else {
      // Draw line for empty field
      doc.moveTo(summaryValueX - 80, yPos + 8)
         .lineTo(summaryValueX, yPos + 8)
         .stroke();
    }
    yPos += 16;
    
    // TOTAL DUE (Bold)
    doc.font('Helvetica-Bold').text('TOTAL DUE:', summaryX, yPos);
    doc.text(totalDue > 0 ? `₦${formatNumber(totalDue)}` : '', summaryValueX, yPos, { align: 'right' });
    doc.font('Helvetica');
    yPos += 30;
    
    // ===== AMOUNT IN WORDS =====
    const totalAmount = totalDue || advancePaid || 0;
    const amountInWords = numberToWords(Math.floor(totalAmount)) + ' Naira only.';
    
    doc.fontSize(10)
       .text('Amount in words:', detailsX, yPos);
    doc.font('Helvetica-Bold');
    doc.text(amountInWords, detailsX + 100, yPos, { width: 400 });
    doc.font('Helvetica');
    yPos += 25;
    
    // ===== PAYMENT MODE SECTION =====
    doc.fontSize(10)
       .text('Pay Mode:', detailsX, yPos);
    yPos += 18;
    
    // 1. Cash
    doc.text('1. Cash.', detailsX + 20, yPos);
    if (voucherData.pay_mode === 'cash') {
      doc.font('Helvetica-Bold').text('✓', detailsX + 100, yPos).font('Helvetica');
    }
    
    // 2. Bank
    yPos += 15;
    doc.text('2. Bank:', detailsX + 20, yPos);
    if (voucherData.pay_mode === 'bank') {
      doc.font('Helvetica-Bold').text('✓', detailsX + 100, yPos).font('Helvetica');
      
      // Bank details
      if (voucherData.bank_details) {
        const bankType = voucherData.bank_details.type || '';
        const bankName = voucherData.bank_details.bank_name || '';
        // Format: "Access. (CHO/TRF)" or just bank name
        if (bankType) {
          doc.text(`${bankName || ''}. (${bankType})`, detailsX + 130, yPos);
        } else {
          doc.text(bankName || '', detailsX + 130, yPos);
        }
        
        yPos += 16;
        doc.text('Acct. Name:', detailsX, yPos);
        doc.text(voucherData.bank_details.account_name || '', detailsX + 100, yPos);
        
        yPos += 16;
        doc.text('Acct. No:', detailsX, yPos);
        doc.text(voucherData.bank_details.account_number || '', detailsX + 100, yPos);
      }
    }
    
    yPos += 30;
    
    // ===== SIGNATURE SECTION =====
    doc.fontSize(10)
       .text('Date of Payment:', detailsX, yPos);
    const paymentDate = voucherData.date_of_payment || voucherData.date || '';
    let formattedPaymentDate = paymentDate ? formatVoucherDate(paymentDate) : '';
    doc.text(formattedPaymentDate, detailsX + 120, yPos);
    
    yPos += 30;
    doc.text('Prepared By:', detailsX, yPos);
    // Draw signature line
    doc.moveTo(detailsX + 100, yPos + 12)
       .lineTo(detailsX + 300, yPos + 12)
       .stroke();
    doc.text(voucherData.prepared_by || '', detailsX + 100, yPos);
    
    yPos += 25;
    doc.text('Approved By:', detailsX, yPos);
    // Draw signature line
    doc.moveTo(detailsX + 100, yPos + 12)
       .lineTo(detailsX + 300, yPos + 12)
       .stroke();
    doc.text(voucherData.approved_by || '', detailsX + 100, yPos);

    doc.end();
    
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}
