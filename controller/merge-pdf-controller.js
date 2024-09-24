// controllers/pdfController.js
const { PDFDocument } = require('pdf-lib');

const mergePdfs = async (req, res) => {
  try {
    const pdfFiles = req.files;

    if (!pdfFiles || pdfFiles.length === 0) {
      return res.status(400).json({ error: 'No PDF files uploaded.' });
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of pdfFiles) {
      const pdfDoc = await PDFDocument.load(file.buffer);
      const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();

    res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(mergedPdfBytes));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = { mergePdfs }