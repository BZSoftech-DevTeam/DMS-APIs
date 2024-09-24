const { PDFDocument } = require('pdf-lib');

const splitPdf = async (req, res) => {
    try {
        const { base64Pdf, startPage, endPage } = req.body;

        // Log the size of the base64 payload
        console.log(`Base64 PDF size: ${Buffer.byteLength(base64Pdf, 'base64')} bytes`);

        // Validate input
        if (typeof base64Pdf !== 'string' || !base64Pdf.trim()) {
            return res.status(400).json({ error: 'Base64 PDF data is required' });
        }
        if (typeof startPage !== 'number' || typeof endPage !== 'number') {
            return res.status(400).json({ error: 'Start page and end page must be numbers' });
        }
        if (startPage < 1 || endPage < startPage) {
            return res.status(400).json({ error: 'Invalid page range' });
        }

        // Decode base64 PDF
        const pdfData = Buffer.from(base64Pdf, 'base64');
        const pdfDoc = await PDFDocument.load(pdfData);

        const totalPages = pdfDoc.getPageCount();

        if (endPage > totalPages) {
            return res.status(400).json({ error: `End page exceeds total number of pages in the PDF. Total pages: ${totalPages}` });
        }

        const newPdfDoc = await PDFDocument.create();

        for (let i = startPage - 1; i < endPage; i++) {
            const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
            newPdfDoc.addPage(copiedPage);
        }

        const newPdfBytes = await newPdfDoc.save();
        const newBase64Pdf = Buffer.from(newPdfBytes).toString('base64');

        res.json({ base64Pdf: newBase64Pdf });
    } catch (error) {
        console.error('Error splitting PDF:', error);
        res.status(500).json({ error: 'An error occurred while processing the PDF' });
    }
};

module.exports = { splitPdf };
