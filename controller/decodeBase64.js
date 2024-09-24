// controllers/pdfController.js

const { Buffer } = require('buffer');

const decodePDF = (req, res) => {
    const { base64Data } = req.body;
    console.log(base64Data);

    if (!base64Data) {
        return res.status(400).json({ error: 'base64Data is required' });
    }

    try {
        // Decode the base64 string
        const buffer = Buffer.from(base64Data, 'base64');

        // Send the PDF buffer as the response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=decoded.pdf');
        res.send(buffer);
    } catch (error) {
        // Handle any errors that might occur
        res.status(500).json({ error: 'Failed to decode and send PDF' });
    }
};

module.exports = { decodePDF }