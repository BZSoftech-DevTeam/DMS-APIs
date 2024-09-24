const fs = require('fs');
const { Recipe } = require('muhammara');
const { promisify } = require('util');
const tmp = require('tmp');

// Promisify fs functions for async/await support
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

// Function to encrypt PDF
const encryptPDF = async (pdfBuffer, userPassword) => {
    // Create temporary files
    const inputTmpFile = tmp.fileSync({ postfix: '.pdf' });
    const outputTmpFile = tmp.fileSync({ postfix: '.pdf' });

    try {
        // Write the PDF buffer to a temporary file
        await writeFile(inputTmpFile.name, pdfBuffer);

        // Encrypt the PDF using muhammara
        const pdfDoc = new Recipe(inputTmpFile.name, outputTmpFile.name);

        pdfDoc.encrypt({
            userPassword,
            ownerPassword: '', // Optional: set if needed
            userProtectionFlag: 4, // Permissions: 4 = no modification, copying, etc.
        });

        pdfDoc.endPDF();

        // Read the encrypted PDF and return as buffer
        const lockedPDFBuffer = await readFile(outputTmpFile.name);

        return lockedPDFBuffer;
    } catch (error) {
        console.error('Error encrypting PDF:', error);
        throw new Error('Error encrypting PDF: ' + error.message);
    } finally {
        // Ensure the temporary files are cleaned up
        try {
            if (fs.existsSync(inputTmpFile.name)) await unlink(inputTmpFile.name);
            if (fs.existsSync(outputTmpFile.name)) await unlink(outputTmpFile.name);
        } catch (cleanupError) {
            console.error('Error cleaning up temporary files:', cleanupError);
        }
    }
};

// Controller function to handle PDF encryption requests
const encryptPDFHandler = async (req, res) => {
    const { userPassword, pdfBase64 } = req.body;

    if (!userPassword || !pdfBase64) {
        return res.status(400).json({ error: 'userPassword and pdf are required' });
    }

    try {
        // Decode base64 PDF
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');

        // Encrypt the PDF
        const lockedPDFBuffer = await encryptPDF(pdfBuffer, userPassword);

        // Convert the encrypted PDF to base64
        const lockedPDFBase64 = lockedPDFBuffer.toString('base64');

        // Send the base64-encoded encrypted PDF as response
        res.json({ pdf: lockedPDFBase64 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { encryptPDFHandler };
