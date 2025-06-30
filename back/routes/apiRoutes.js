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
const { logAction } = require('../middlewares/historyMiddleware');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);

router.get('/me', authenticate, userController.getProfile);
router.get('/history', authenticate, userController.getHistory);
router.put('/update', authenticate, userController.updateUser);
router.delete('/delete', authenticate, userController.deleteUser); 

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