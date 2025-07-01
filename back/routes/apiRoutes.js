const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {
  summarizeText
} = require('../controllers/summaryController');
const {
  processPDF
} = require('../controllers/pdfController');
const { authenticate } = require('../middlewares/authMiddleware');
const { historyAction } = require('../middlewares/historyMiddleware');
const { auditLog } = require('../middlewares/logMiddleware');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { getAvailableModels, isModelAvailable } = require('../services/ollamaService');

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authenticate, authController.getMe);

router.get('/me', authenticate, auditLog, userController.getProfile);
router.get('/history', authenticate, auditLog, userController.getHistory);
router.put('/update', authenticate, auditLog, userController.updateUser);
router.delete('/delete', authenticate, auditLog, userController.deleteUser); 

router.post('/summarize', authenticate, auditLog, summarizeText);
router.post('/summarize-pdf', authenticate, auditLog, upload.single('pdf'), processPDF);

router.get('/model-info', (req, res) => {
  res.json({
    model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
    description: 'Modèle Ollama local optimisé pour la summarisation de texte',
    max_tokens: parseInt(process.env.SUMMARY_MAX_TOKENS) || 500,
    temperature: parseFloat(process.env.OLLAMA_TEMPERATURE) || 0.3,
    max_pdf_size: `${process.env.PDF_MAX_SIZE_MB}MB`,
    ollama_url: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
  });
});

router.get('/models', async (req, res) => {
  try {
    const models = await getAvailableModels();
    res.json({
      success: true,
      models: models,
      current_model: process.env.OLLAMA_MODEL || 'llama3.2:3b'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des modèles',
      message: error.message
    });
  }
});

module.exports = router;