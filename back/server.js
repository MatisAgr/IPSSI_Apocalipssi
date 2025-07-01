require('dotenv').config();
require('./config/db');

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');
const { handleErrors } = require('./middlewares/errorMiddleware');
const { OLLAMA_CONFIG } = require('./config/ollama');

const app = express();

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', apiRoutes);

// Gestion des erreurs
app.use(handleErrors);

// Démarrage du serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  const PDF_MAX_SIZE_MB = parseInt(process.env.PDF_MAX_SIZE_MB) || 10;
  
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📝 API de résumé disponible sur http://localhost:${PORT}/api/summarize`);
  console.log(`📄 API de résumé PDF disponible sur http://localhost:${PORT}/api/summarize-pdf`);
  console.log(`🤖 Modèle Ollama configuré: ${OLLAMA_CONFIG.model}`);
  console.log(`🌡️ Température: ${OLLAMA_CONFIG.temperature}`);
  console.log(`📏 Tokens max: ${OLLAMA_CONFIG.maxTokens}`);
  console.log(`📎 Taille max PDF: ${PDF_MAX_SIZE_MB}MB`);
  console.log(`🔗 Ollama URL: ${OLLAMA_CONFIG.baseURL}`);
  
});