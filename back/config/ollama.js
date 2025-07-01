const axios = require('axios');

const OLLAMA_CONFIG = {
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
  maxTokens: parseInt(process.env.SUMMARY_MAX_TOKENS) || 500,
  temperature: parseFloat(process.env.OLLAMA_TEMPERATURE) || 0.3
};

// Client Ollama
const ollamaClient = axios.create({
  baseURL: OLLAMA_CONFIG.baseURL,
  timeout: 60000, // 60 secondes de timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Fonction pour vérifier si Ollama est accessible
const checkOllamaHealth = async () => {
  try {
    await ollamaClient.get('/api/tags');
    return true;
  } catch (error) {
    console.error('Ollama n\'est pas accessible:', error.message);
    return false;
  }
};

module.exports = { 
  ollamaClient, 
  OLLAMA_CONFIG,
  checkOllamaHealth
};
