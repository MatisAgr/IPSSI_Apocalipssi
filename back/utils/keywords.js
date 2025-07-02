const sw = require('stopword');

function extractKeywords(text, maxKeywords = 10) {
  if (!text || typeof text !== 'string') return [];

  const words = text
    .toLowerCase()
    .replace(/[^\w\sàâäéèêëïîôöùûüç\-']/gi, '')
    .split(/\s+/);

  const filtered = sw.removeStopwords(words, sw.fr);


  const freqMap = {};
  filtered.forEach(word => {
    if (word.length > 2) { 
      freqMap[word] = (freqMap[word] || 0) + 1;
    }
  });

  return Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

module.exports = {
  extractKeywords
};
