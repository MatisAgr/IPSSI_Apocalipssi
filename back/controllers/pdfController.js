const { extractTextFromPDF } = require('../services/pdfService');
const { summarizeText } = require('../services/ollamaService');

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
      file_size: req.file.size,
      extracted_text_length: extractedText.length,
      summary_length: summary.length,
      summary,
      model_used: process.env.OLLAMA_MODEL || 'llama3.2:3b'
    });

  } catch (error) {
    next(error);
  }
};