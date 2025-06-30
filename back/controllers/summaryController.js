const { summarizeText } = require('../services/huggingfaceService');

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

    res.json({
      success: true,
      original_length: text.length,
      summary,
      model_used: process.env.HUGGINGFACE_MODEL
    });

  } catch (error) {
    next(error);
  }
};