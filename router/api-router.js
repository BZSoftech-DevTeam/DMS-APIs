const express = require('express');
const router = express.Router();
const multer = require('multer');
const bodyParser = require('body-parser');
const upload = multer();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// * IMPORTING CONTROLLERS 😎
const watermarkRoutes = require('../controller/watermark-controller');
const jsonToPDFRoutes = require('../controller/json-pdf-controller');
const splitPDFRoutes = require('../controller/split-pdf-controller');
const lockPDFRoutes = require('../controller/lock-pdf-controller')
const encryptRoutes = require('../controller/encrypt-pdf-controller');
const decryptRoutes = require('../controller/decrypt-pdf-controller');
const mergePDFRoutes = require('../controller/merge-pdf-controller');
const decodeRoutes = require('../controller/decodeBase64');

// * CREATING ROUTES 😎
router.route('/watermark').post(watermarkRoutes.addWatermark);
router.route('/json-to-pdf').post(jsonToPDFRoutes.convertJsonToPdf);
router.post('/split-pdf', express.json({ limit: '50mb' }), splitPDFRoutes.splitPdf);
router.route('/lock-pdf').post(lockPDFRoutes.encryptPDFHandler);
router.post('/encrypt-pdf', upload.single('pdf'), encryptRoutes.encryptPdf);
router.post('/decrypt-pdf', upload.single('pdf'), decryptRoutes.decryptPdf);
router.post('/merge-pdfs', upload.array('pdfs'), mergePDFRoutes.mergePdfs);
router.post('/decode', upload.array('pdfs'), decodeRoutes.decodePDF);

module.exports = router;