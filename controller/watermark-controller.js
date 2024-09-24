const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib'); // Ensure pdf-lib is installed
// asdf
const addWatermark = async (req, res) => {
    try {
        const { pdfBase64, watermarkText, textSize, opacity, rotationDegree } = req.body;

        if (!pdfBase64) {
            return res.status(400).json({ error: 'PDF is missing!' });
        }

        if (!watermarkText) {
            return res.status(400).json({ error: 'Watermark text is missing' });
        }

        if (!textSize) {
            return res.status(400).json({ error: 'Text size is missing' });
        }

        if (opacity === undefined) {
            return res.status(400).json({ error: 'Opacity is missing' });
        }

        if (rotationDegree === undefined) {
            return res.status(400).json({ error: 'Rotation Degree is missing' });
        }

        // Decode the Base64 string to a buffer
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');

        // Function to add watermark to PDF
        const addWatermarkToPDF = async (pdfBuffer, watermarkText, textSize, opacity, rotationDegree) => {
            try {
                // Load the PDF document
                const pdfDoc = await PDFDocument.load(pdfBuffer);

                // Define the font for the watermark
                const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
                const textSizeNum = parseInt(textSize, 10);
                if (isNaN(textSizeNum) || textSizeNum <= 0) {
                    throw new Error('Invalid text size');
                }

                // Convert rotation degree to radians
                const radiansAngle = (rotationDegree * Math.PI) / 180;

                // Iterate over all pages and add the watermark
                const pages = pdfDoc.getPages();
                for (const page of pages) {
                    // Get the size of the page
                    const { width, height } = page.getSize();

                    // Calculate text width and height
                    const textWidth = font.widthOfTextAtSize(watermarkText, textSizeNum);
                    const textHeight = textSizeNum;

                    // Calculate watermark position
                    const centerX = width / 2;
                    const centerY = height / 2;

                    const offsetX = textWidth / 2;
                    const offsetY = textHeight / 2;

                    const rotatedX = offsetX * Math.cos(radiansAngle) - offsetY * Math.sin(radiansAngle);
                    const rotatedY = offsetX * Math.sin(radiansAngle) + offsetY * Math.cos(radiansAngle);

                    const x = centerX - rotatedX;
                    const y = centerY - rotatedY;

                    // Add the watermark text to the page
                    page.drawText(watermarkText, {
                        x,
                        y,
                        size: textSizeNum,
                        font,
                        color: rgb(0, 0, 0), // Black color
                        opacity: parseFloat(opacity),
                        rotate: degrees(rotationDegree),
                    });
                }

                // Save the PDF and return as buffer
                const pdfBytes = await pdfDoc.save();
                return Buffer.from(pdfBytes);
            } catch (error) {
                console.error('Error inside addWatermarkToPDF:', error.message);
                throw new Error('Error processing the PDF: ' + error.message);
            }
        };

        // Add watermark to the PDF
        const watermarkedPdfBuffer = await addWatermarkToPDF(pdfBuffer, watermarkText, textSize, opacity, rotationDegree);

        // Convert the resulting PDF back to Base64
        const watermarkedPdfBase64 = watermarkedPdfBuffer.toString('base64');

        // Send response with the Base64-encoded watermarked PDF
        res.json({ watermarkAdded: watermarkedPdfBase64 });
    } catch (error) {
        console.error('Error adding watermark:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    addWatermark,
};
