// controllers/encryptController.js
const CryptoJS = require('crypto-js');

exports.encryptPdf = (req, res) => {
    const password = req.body.password;
    const fileBuffer = req.file?.buffer; // File data is in memory as a Buffer

    if (!fileBuffer) {
        return res.status(400).send('PDF file is required.');
    }

    if (!password) {
        return res.status(400).send('Password is required.');
    }

    try {
        // Encrypt the file buffer directly without converting to base64
        const encryptedData = CryptoJS.AES.encrypt(
            fileBuffer.toString('base64'),
            password
        ).toString();

        // Convert the encrypted string back to a buffer
        const encryptedBuffer = Buffer.from(encryptedData);

        // Set the response headers to download the file with a .pdf.encrypted extension
        res.setHeader('Content-Disposition', 'attachment; filename="encrypted.pdf.encrypted"');
        res.setHeader('Content-Type', 'application/octet-stream');

        // Send the encrypted buffer as the response
        res.send(encryptedBuffer);
    } catch (error) {
        console.error('Error encrypting the file:', error);
        res.status(500).send('Error encrypting the file.');
    }
};
