const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {
  summarizeText
} = require('../controllers/summaryController');
const {
  processPDF
} = require('../controllers/pdfController');

router.post('/summarize', summarizeText);
router.post('/summarize-pdf', upload.single('pdf'), processPDF);

router.get('/model-info', (req, res) => {
  res.json({
    model: process.env.HUGGINGFACE_MODEL,
    description: 'Modèle BART optimisé pour la summarisation de texte',
    max_length: parseInt(process.env.SUMMARY_MAX_LENGTH),
    min_length: parseInt(process.env.SUMMARY_MIN_LENGTH),
    max_pdf_size: `${process.env.PDF_MAX_SIZE_MB}MB`
  });
});

module.exports = router;