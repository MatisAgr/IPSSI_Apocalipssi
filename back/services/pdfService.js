const pdfParse = require('pdf-parse');

const extractTextFromPDF = async (buffer) => {
  try {
    const { text } = await pdfParse(buffer);
    return text.trim();
  } catch (error) {
    throw new Error('Erreur lors de l\'extraction du texte PDF');
  }
};

module.exports = { extractTextFromPDF };