const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration CORS pour permettre les requêtes depuis le frontend
app.use(cors({
  origin: 'http://localhost:5173', // Port par défaut de Vite
  credentials: true
}));

app.use(express.json({ 
  limit: '10mb' //Size limit
}));

// Middleware pour gérer les erreurs de parsing JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Erreur de syntaxe JSON:', err.message);
    return res.status(400).json({
      error: 'JSON invalide',
      message: 'Le format JSON envoyé est incorrect. Vérifiez l\'échappement des caractères spéciaux.',
      details: err.message
    });
  }
  next(err);
});

// Initialiser l'API Hugging Face
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Configuration du modèle depuis les variables d'environnement
const MODEL_CONFIG = {
  name: process.env.HUGGINGFACE_MODEL || 'facebook/bart-large-cnn',
  maxLength: parseInt(process.env.SUMMARY_MAX_LENGTH) || 150,
  minLength: parseInt(process.env.SUMMARY_MIN_LENGTH) || 30
};

// Configuration pour l'upload de fichiers
const PDF_CONFIG = {
  maxSize: (parseInt(process.env.PDF_MAX_SIZE_MB) || 10) * 1024 * 1024, // Conversion MB vers octets
  allowedMimeTypes: ['application/pdf']
};

// Configuration de multer pour l'upload de fichiers
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: PDF_CONFIG.maxSize
  },
  fileFilter: (req, file, cb) => {
    if (PDF_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
    }
  }
});

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'Serveur de résumé de texte opérationnel !' });
});

// Route pour résumer le texte
app.post('/api/summarize', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ 
        error: 'Le texte est requis',
        message: 'Veuillez fournir un texte à résumer'
      });
    }

    if (text.length < 50) {
      return res.status(400).json({ 
        error: 'Texte trop court',
        message: 'Le texte doit contenir au moins 50 caractères pour être résumé'
      });
    }

    console.log(`Résumé en cours pour un texte de ${text.length} caractères...`);

    // Utiliser le modèle de résumé de Hugging Face
    const summary = await hf.summarization({
      model: MODEL_CONFIG.name,
      inputs: text,
      parameters: {
        max_length: MODEL_CONFIG.maxLength,
        min_length: MODEL_CONFIG.minLength,
        do_sample: false
      }
    });

    console.log('Résumé généré avec succès');

    res.json({
      success: true,
      original_length: text.length,
      summary_length: summary.summary_text.length,
      summary: summary.summary_text,
      model_used: MODEL_CONFIG.name
    });

  } catch (error) {
    console.error('Erreur lors du résumé:', error);
    
    if (error.message.includes('Authorization')) {
      return res.status(401).json({
        error: 'Erreur d\'autorisation',
        message: 'Vérifiez votre clé API Hugging Face'
      });
    }

    if (error.message.includes('Rate limit')) {
      return res.status(429).json({
        error: 'Limite de taux atteinte',
        message: 'Trop de requêtes, veuillez réessayer plus tard'
      });
    }

    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors du résumé du texte'
    });
  }
});

// Route pour obtenir des informations sur le modèle
app.get('/api/model-info', (req, res) => {
  res.json({
    model: MODEL_CONFIG.name,
    description: 'Modèle BART optimisé pour la summarisation de texte',
    max_input_length: 1024,
    recommended_min_length: 50,
    max_summary_length: MODEL_CONFIG.maxLength,
    min_summary_length: MODEL_CONFIG.minLength,
    pdf_support: {
      enabled: true,
      max_file_size: PDF_CONFIG.maxSize,
      max_file_size_mb: PDF_CONFIG.maxSize / (1024 * 1024),
      allowed_types: PDF_CONFIG.allowedMimeTypes
    }
  });
});

// Route pour résumer un PDF uploadé
app.post('/api/summarize-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Aucun fichier fourni',
        message: 'Veuillez uploader un fichier PDF'
      });
    }

    console.log(`Traitement du PDF: ${req.file.originalname} (${req.file.size} bytes)`);

    // Extraire le texte du PDF
    let extractedText;
    try {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text;
    } catch (pdfError) {
      console.error('Erreur lors de l\'extraction du PDF:', pdfError);
      return res.status(400).json({
        error: 'Erreur de traitement du PDF',
        message: 'Impossible d\'extraire le texte du fichier PDF. Le fichier pourrait être corrompu ou protégé par un mot de passe.'
      });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        error: 'PDF vide',
        message: 'Aucun texte n\'a pu être extrait du PDF'
      });
    }

    if (extractedText.length < 50) {
      return res.status(400).json({
        error: 'Contenu trop court',
        message: 'Le texte extrait du PDF doit contenir au moins 50 caractères pour être résumé'
      });
    }

    console.log(`Texte extrait: ${extractedText.length} caractères. Génération du résumé...`);

    // Utiliser le modèle de résumé de Hugging Face
    const summary = await hf.summarization({
      model: MODEL_CONFIG.name,
      inputs: extractedText.substring(0, 1024), // Limiter la longueur pour l'API
      parameters: {
        max_length: MODEL_CONFIG.maxLength,
        min_length: MODEL_CONFIG.minLength,
        do_sample: false
      }
    });

    console.log('Résumé généré avec succès pour le PDF');

    res.json({
      success: true,
      filename: req.file.originalname,
      file_size: req.file.size,
      extracted_text_length: extractedText.length,
      summary_length: summary.summary_text.length,
      summary: summary.summary_text,
      model_used: MODEL_CONFIG.name
    });

  } catch (error) {
    console.error('Erreur lors du traitement du PDF:', error);
    
    if (error.message.includes('Seuls les fichiers PDF')) {
      return res.status(400).json({
        error: 'Type de fichier non autorisé',
        message: 'Seuls les fichiers PDF sont acceptés'
      });
    }

    if (error.message.includes('File too large')) {
      return res.status(413).json({
        error: 'Fichier trop volumineux',
        message: `La taille du fichier ne doit pas dépasser ${PDF_CONFIG.maxSize / (1024 * 1024)}MB`
      });
    }

    if (error.message.includes('Authorization')) {
      return res.status(401).json({
        error: 'Erreur d\'autorisation',
        message: 'Vérifiez votre clé API Hugging Face'
      });
    }

    if (error.message.includes('Rate limit')) {
      return res.status(429).json({
        error: 'Limite de taux atteinte',
        message: 'Trop de requêtes, veuillez réessayer plus tard'
      });
    }

    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors du traitement du PDF'
    });
  }
});

// Middleware de gestion d'erreur global
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: 'Une erreur inattendue s\'est produite'
  });
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.originalUrl} n'existe pas`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📝 API de résumé disponible sur http://localhost:${PORT}/api/summarize`);
  console.log(`📄 API de résumé PDF disponible sur http://localhost:${PORT}/api/summarize-pdf`);
  console.log(`🤖 Modèle configuré: ${MODEL_CONFIG.name}`);
  console.log(`📏 Longueur résumé: ${MODEL_CONFIG.minLength}-${MODEL_CONFIG.maxLength} tokens`);
  console.log(`📎 Taille max PDF: ${PDF_CONFIG.maxSize / (1024 * 1024)}MB`);
  
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.warn('⚠️  ATTENTION: Clé API Hugging Face manquante. Définissez HUGGINGFACE_API_KEY dans le fichier .env');
  }
});
