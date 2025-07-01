const { ollamaClient, OLLAMA_CONFIG, checkOllamaHealth } = require('../config/ollama');

const summarizeText = async (text) => {
  try {
    // Vérifier si Ollama est accessible
    const isHealthy = await checkOllamaHealth();
    if (!isHealthy) {
      throw new Error('Ollama n\'est pas accessible. Assurez-vous qu\'Ollama est en cours d\'exécution.');
    }

    // Préparer le prompt pour la summarisation
    const prompt = `IMPORTANT: Réponds UNIQUEMENT en français en TEXTE SIMPLE sans formatage Markdown (pas de **, *, #, etc.).

Résume ce texte de façon concise en français. N'utilise pas de formatage. Écris directement le contenu du résumé en texte simple :

${text}

Résumé simple en français :`;

    // Appel à l'API Ollama
    console.log(`🤖 Génération de résumé avec le modèle: ${OLLAMA_CONFIG.model}`);
    const response = await ollamaClient.post('/api/generate', {
      model: OLLAMA_CONFIG.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: OLLAMA_CONFIG.temperature,
        num_predict: OLLAMA_CONFIG.maxTokens,
        stop: ['\n\n\n', '---'],
        top_k: 40,
        top_p: 0.9
      }
    });

    // Debug: afficher la réponse complète
    console.log('📝 Réponse Ollama complète:', JSON.stringify(response.data, null, 2));

    if (!response.data) {
      throw new Error('Aucune donnée reçue d\'Ollama');
    }

    if (!response.data.response) {
      // Vérifier si le modèle existe
      const availableModels = await getAvailableModels();
      const modelExists = availableModels.some(model => model.name === OLLAMA_CONFIG.model);
      
      if (!modelExists) {
        throw new Error(`Le modèle ${OLLAMA_CONFIG.model} n'est pas disponible. Modèles disponibles: ${availableModels.map(m => m.name).join(', ')}`);
      }
      
      throw new Error(`Réponse invalide d'Ollama: ${JSON.stringify(response.data)}`);
    }

    // Nettoyer la réponse
    let summary = response.data.response.trim();
    
    // Supprimer les préfixes indésirables en français et anglais
    summary = summary.replace(/^(Le résumé\s*:\s*|Résumé\s*:\s*|Voici le résumé\s*:\s*|Voici un résumé\s*:\s*|Okay,?\s*here'?s?\s*|Here'?s?\s*)/i, '');
    
    // Supprimer les phrases d'introduction en français et anglais
    summary = summary.replace(/^(Voici\s+|Le document\s+|Ce document\s+|Le texte\s+|This document\s+|The document\s+).*?:\s*/i, '');
    
    // Supprimer les formules anglaises communes
    summary = summary.replace(/^(a breakdown of|a summary of|overall purpose|key sections)/i, '');
    
    // Supprimer tout le formatage Markdown
    summary = summary.replace(/\*\*(.*?)\*\*/g, '$1'); // Gras **texte**
    summary = summary.replace(/\*(.*?)\*/g, '$1'); // Italique *texte*
    summary = summary.replace(/#{1,6}\s*/g, ''); // Titres # ## ###
    summary = summary.replace(/`([^`]*)`/g, '$1'); // Code `texte`
    summary = summary.replace(/^\s*[\*\-\+]\s*/gm, '• '); // Listes - * +
    summary = summary.replace(/^\s*\d+\.\s*/gm, ''); // Listes numérotées
    
    // Nettoyer les retours à la ligne multiples
    summary = summary.replace(/\n\s*\n/g, '\n').trim();
    
    console.log('🧹 Résumé nettoyé:', summary);
    
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
