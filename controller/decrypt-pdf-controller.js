// controllers/decryptController.js
const CryptoJS = require('crypto-js');

exports.decryptPdf = (req, res) => {
    const password = req.body.password;
    const encryptedBuffer = req.file?.buffer;

    // Check if the encrypted file is missing
    if (!encryptedBuffer) {
        return res.status(400).json({ error: 'Encrypted file is required.' });
    }

    // Check if the password is missing
    if (!password) {
        return res.status(400).json({ error: 'Password is required.' });
    }

    try {
        // Convert the buffer to a string for decryption
        const encryptedData = encryptedBuffer.toString();

        // Decrypt the data
        const decryptedData = CryptoJS.AES.decrypt(encryptedData, password);
        const decryptedBase64 = decryptedData.toString(CryptoJS.enc.Utf8);

        // If decryption failed (e.g., due to incorrect password), decryptedBase64 will be empty or invalid
        if (!decryptedBase64) {
            return res.status(401).json({ error: 'Incorrect password.' });
        }

        // Validate that the decryptedBase64 is indeed a valid Base64 string
        try {
            const decryptedBuffer = Buffer.from(decryptedBase64, 'base64');
            
            // Check if the buffer can be converted back to a valid binary PDF
            if (!decryptedBuffer || decryptedBuffer.length === 0) {
                throw new Error('Decryption resulted in an invalid buffer.');
            }

            // Set the response headers to download the decrypted file
            res.setHeader('Content-Disposition', 'attachment; filename="decrypted.pdf"');
            res.setHeader('Content-Type', 'application/pdf');

            // Send the decrypted PDF buffer as the response
            res.send(decryptedBuffer);
        } catch (bufferError) {
            return res.status(401).json({ error: 'Incorrect password or corrupted file.' });
        }

    } catch (error) {
        console.error('Error decrypting the file:', error);
        res.status(500).json({ error: 'An error occurred during decryption. - Check Password' });
    }
};
