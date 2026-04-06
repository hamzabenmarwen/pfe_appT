import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerPhone: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  status: string;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'uploads', 'invoices');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = `${data.invoiceNumber}.pdf`;
  const filepath = path.join(uploadsDir, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('TRAITEUR', 50, 50);
    doc.fontSize(10).font('Helvetica').text('Service Traiteur Professionnel', 50, 80);
    doc.text('Sfax, Tunisie', 50, 95);
    doc.text('Tél: +216 98 765 432', 50, 110);

    // Invoice number & date
    doc.fontSize(20).font('Helvetica-Bold').text('FACTURE', 400, 50, { align: 'right' });
    doc.fontSize(10).font('Helvetica');
    doc.text(`N°: ${data.invoiceNumber}`, 400, 80, { align: 'right' });
    doc.text(`Date: ${data.date}`, 400, 95, { align: 'right' });
    doc.text(`Échéance: ${data.dueDate}`, 400, 110, { align: 'right' });
    doc.text(`Statut: ${data.status}`, 400, 125, { align: 'right' });

    // Separator
    doc.moveTo(50, 150).lineTo(545, 150).stroke();

    // Customer info
    doc.fontSize(12).font('Helvetica-Bold').text('Facturer à:', 50, 170);
    doc.fontSize(10).font('Helvetica');
    doc.text(data.customerName, 50, 190);
    doc.text(data.customerEmail, 50, 205);
    doc.text(data.customerAddress || 'N/A', 50, 220);
    doc.text(data.customerPhone || 'N/A', 50, 235);

    // Table header
    const tableTop = 280;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Description', 50, tableTop);
    doc.text('Qté', 320, tableTop, { width: 50, align: 'center' });
    doc.text('Prix Unit.', 380, tableTop, { width: 80, align: 'right' });
    doc.text('Total', 470, tableTop, { width: 75, align: 'right' });

    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

    // Table rows
    let y = tableTop + 25;
    doc.font('Helvetica').fontSize(10);
    for (const item of data.items) {
      const itemTotal = item.quantity * item.unitPrice;
      doc.text(item.description, 50, y, { width: 260 });
      doc.text(item.quantity.toString(), 320, y, { width: 50, align: 'center' });
      doc.text(`${item.unitPrice.toFixed(2)} TND`, 380, y, { width: 80, align: 'right' });
      doc.text(`${itemTotal.toFixed(2)} TND`, 470, y, { width: 75, align: 'right' });
      y += 20;
    }

    // Total
    doc.moveTo(380, y + 5).lineTo(545, y + 5).stroke();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Total:', 380, y + 15, { width: 80, align: 'right' });
    doc.text(`${data.totalAmount.toFixed(2)} TND`, 470, y + 15, { width: 75, align: 'right' });

    // Footer
    doc.fontSize(8).font('Helvetica').fillColor('#666');
    doc.text(
      'Merci pour votre confiance. Paiement à effectuer avant la date d\'échéance.',
      50,
      750,
      { align: 'center', width: 495 }
    );

    doc.end();
    stream.on('finish', () => resolve(`/uploads/invoices/${filename}`));
    stream.on('error', reject);
  });
}
