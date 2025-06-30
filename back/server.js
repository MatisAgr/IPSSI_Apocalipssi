const express = require('express');
const cors = require('cors');
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
  limit: '10mb',
  // Gestion des erreurs de parsing JSON
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('Erreur de parsing JSON:', e.message);
      console.error('Contenu reçu:', buf.toString());
      throw new Error('JSON invalide: ' + e.message);
    }
  }
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
      model: 'facebook/bart-large-cnn',
      inputs: text,
      parameters: {
        max_length: 150,
        min_length: 30,
        do_sample: false
      }
    });

    console.log('Résumé généré avec succès');

    res.json({
      success: true,
      original_length: text.length,
      summary_length: summary.summary_text.length,
      summary: summary.summary_text,
      model_used: 'facebook/bart-large-cnn'
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
    model: 'facebook/bart-large-cnn',
    description: 'Modèle BART optimisé pour la summarisation de texte',
    max_input_length: 1024,
    recommended_min_length: 50
  });
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
  
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.warn('⚠️  ATTENTION: Clé API Hugging Face manquante. Définissez HUGGINGFACE_API_KEY dans le fichier .env');
  }
});
