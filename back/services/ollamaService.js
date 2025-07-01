const { ollamaClient, OLLAMA_CONFIG, checkOllamaHealth } = require('../config/ollama');

const summarizeText = async (text) => {
  try {
    // Vérifier si Ollama est accessible
    const isHealthy = await checkOllamaHealth();
    if (!isHealthy) {
      throw new Error('Ollama n\'est pas accessible. Assurez-vous qu\'Ollama est en cours d\'exécution.');
    }

    // Préparer le prompt pour la summarisation
    const prompt = `Résume le texte suivant en français de manière concise et claire. Le résumé doit capturer les points essentiels en quelques phrases :

${text}

Résumé :`;

    // Appel à l'API Ollama
    const response = await ollamaClient.post('/api/generate', {
      model: OLLAMA_CONFIG.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: OLLAMA_CONFIG.temperature,
        num_predict: OLLAMA_CONFIG.maxTokens,
        stop: ['\n\n', 'Texte suivant:', 'Résumé suivant:']
      }
    });

    if (!response.data || !response.data.response) {
      throw new Error('Réponse invalide d\'Ollama');
    }

    // Nettoyer la réponse
    let summary = response.data.response.trim();
    
    // Supprimer les préfixes indésirables
    summary = summary.replace(/^(Résumé\s*:\s*|Voici le résumé\s*:\s*)/i, '');
    
    // S'assurer qu'il y a du contenu
    if (!summary || summary.length < 10) {
      throw new Error('Le résumé généré est trop court ou vide');
    }

    return summary;

  } catch (error) {
    console.error('Erreur lors de la summarisation avec Ollama:', error);
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Impossible de se connecter à Ollama. Vérifiez qu\'Ollama est en cours d\'exécution sur http://localhost:11434');
    }
    
    if (error.response) {
      throw new Error(`Erreur Ollama: ${error.response.data?.error || error.response.statusText}`);
    }
    
    throw new Error(error.message || 'Erreur lors de la génération du résumé');
  }
};

// Fonction pour obtenir les modèles disponibles
const getAvailableModels = async () => {
  try {
    const response = await ollamaClient.get('/api/tags');
    return response.data.models || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des modèles:', error);
    return [];
  }
};

// Fonction pour vérifier si un modèle spécifique est disponible
const isModelAvailable = async (modelName) => {
  try {
    const models = await getAvailableModels();
    return models.some(model => model.name === modelName);
  } catch (error) {
    return false;
  }
};

module.exports = { 
  summarizeText,
  getAvailableModels,
  isModelAvailable
};
