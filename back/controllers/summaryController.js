const { summarizeText } = require('../services/ollamaService');
const History = require('../models/historyModel');

exports.summarizeText = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.length < 50) {
      return res.status(400).json({
        error: 'Texte invalide',
        message: 'Le texte doit contenir au moins 50 caractères'
      });
    }

    const summary = await summarizeText(text);

    // Sauvegarder l'historique avec le résumé
    if (req.userId) {
      await History.create({
        userId: req.userId,
        action: 'text_summarized',
        resume: summary,
        metadata: {
          originalTextLength: text.length,
          summaryLength: summary.length
        }
      });
    }

    res.json({
      success: true,
      original_length: text.length,
      summary_length: summary.length,
      summary,
      model_used: process.env.OLLAMA_MODEL
    });

  } catch (error) {
    next(error);
  }
};