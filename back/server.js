require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');
const { handleErrors } = require('./middlewares/errorMiddleware');
const { MODEL_CONFIG } = require('./config/huggingface');

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', apiRoutes);

// Gestion des erreurs
app.use(handleErrors);

// Démarrer le serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  const PDF_MAX_SIZE_MB = parseInt(process.env.PDF_MAX_SIZE_MB) || 10;
  
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📝 API de résumé disponible sur http://localhost:${PORT}/api/summarize`);
  console.log(`📄 API de résumé PDF disponible sur http://localhost:${PORT}/api/summarize-pdf`);
  console.log(`🤖 Modèle configuré: ${MODEL_CONFIG.name}`);
  console.log(`📏 Longueur résumé: ${MODEL_CONFIG.minLength}-${MODEL_CONFIG.maxLength} tokens`);
  console.log(`📎 Taille max PDF: ${PDF_MAX_SIZE_MB}MB`);
  
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.warn('⚠️  ATTENTION: Clé API Hugging Face manquante. Définissez HUGGINGFACE_API_KEY dans le fichier .env');
  }
});