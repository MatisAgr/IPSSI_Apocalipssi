const { extractTextFromPDF } = require('../services/pdfService');
const { summarizeText } = require('../services/huggingfaceService');

exports.processPDF = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Aucun fichier fourni',
        message: 'Veuillez uploader un fichier PDF'
      });
    }

    const extractedText = await extractTextFromPDF(req.file.buffer);
    
    if (!extractedText || extractedText.length < 50) {
      return res.status(400).json({
        error: 'Contenu invalide',
        message: 'Le PDF doit contenir au moins 50 caractères'
      });
    }

    const summary = await summarizeText(extractedText);

    res.json({
      success: true,
      filename: req.file.originalname,
      extracted_text_length: extractedText.length,
      summary,
      model_used: process.env.HUGGINGFACE_MODEL
    });

  } catch (error) {
    next(error);
  }
};