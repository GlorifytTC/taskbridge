const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateInvoicePDF = async (payment, organization, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `invoice-${payment.invoiceNumber}.pdf`;
      const filepath = path.join(__dirname, '../invoices', filename);
      
      // Ensure invoices directory exists
      if (!fs.existsSync(path.join(__dirname, '../invoices'))) {
        fs.mkdirSync(path.join(__dirname, '../invoices'));
      }
      
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);
      
      // Header
      doc.fontSize(20).text('INVOICE', { align: 'center' });
      doc.moveDown();
      
      // Company Info
      doc.fontSize(10).text('TaskBridge', 50, 100);
      doc.text('123 Business Street');
      doc.text('Stockholm, Sweden 111 22');
      doc.text('Email: billing@taskbridge.com');
      doc.text('VAT: SE12345678901');
      
      // Invoice Info
      doc.fontSize(10);
      doc.text(`Invoice Number: ${payment.invoiceNumber}`, 400, 100);
      doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`, 400, 115);
      doc.text(`Due Date: ${new Date(payment.createdAt).toLocaleDateString()}`, 400, 130);
      
      // Organization Info
      doc.moveDown();
      doc.text('Bill To:', 50, 180);
      doc.text(organization.name, 50, 195);
      doc.text(organization.email || '', 50, 210);
      if (organization.address) {
        doc.text(`${organization.address.street || ''}`, 50, 225);
        doc.text(`${organization.address.city || ''} ${organization.address.postalCode || ''}`, 50, 240);
      }
      
      // Invoice Items
      const startY = 280;
      doc.moveDown();
      doc.fontSize(12).text('Description', 50, startY);
      doc.text('Amount', 400, startY);
      doc.text('VAT', 450, startY);
      doc.text('Total', 500, startY);
      
      doc.moveDown();
      doc.fontSize(10);
      doc.text(payment.description || 'Subscription Payment', 50, startY + 25);
      doc.text(`${payment.amount} ${payment.currency}`, 400, startY + 25);
      doc.text(`${payment.vat?.rate || 0}%`, 450, startY + 25);
      doc.text(`${payment.totalAmount} ${payment.currency}`, 500, startY + 25);
      
      // Total
      const totalY = startY + 60;
      doc.fontSize(12);
      doc.text('Total Amount:', 400, totalY);
      doc.text(`${payment.totalAmount} ${payment.currency}`, 500, totalY);
      
      // Footer
      doc.fontSize(8);
      doc.text('Thank you for your business!', 50, 700, { align: 'center' });
      doc.text(`Generated on ${new Date().toLocaleString()}`, 50, 715, { align: 'center' });
      
      doc.end();
      
      stream.on('finish', () => {
        resolve(filepath);
      });
      
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};