const path = require('path');
const fs = require('fs');

// Test de l'API de résumé PDF
async function testPdfSummarization() {
  const FormData = require('form-data');
  const fetch = require('node-fetch');
  
  try {
    // Créer un FormData pour simuler l'upload d'un PDF
    const form = new FormData();
    
    // Remplacez ce chemin par un fichier PDF de test réel
    const pdfPath = path.join(__dirname, 'test-file.pdf');
    
    if (!fs.existsSync(pdfPath)) {
      console.log('❌ Fichier PDF de test non trouvé. Créez un fichier test-file.pdf dans le dossier back/');
      return;
    }
    
    const pdfBuffer = fs.readFileSync(pdfPath);
    form.append('pdf', pdfBuffer, {
      filename: 'test-file.pdf',
      contentType: 'application/pdf'
    });
    
    console.log('📤 Upload du PDF en cours...');
    
    const response = await fetch('http://localhost:3001/api/summarize-pdf', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Résumé généré avec succès !');
      console.log('📄 Fichier:', result.filename);
      console.log('📊 Taille:', Math.round(result.file_size / 1024), 'KB');
      console.log('📝 Texte extrait:', result.extracted_text_length, 'caractères');
      console.log('📋 Résumé:', result.summary);
    } else {
      console.log('❌ Erreur:', result.error);
      console.log('💬 Message:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Test de l'API d'informations
async function testModelInfo() {
  try {
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:3001/api/model-info');
    const info = await response.json();
    
    console.log('ℹ️  Informations du modèle:');
    console.log('🤖 Modèle:', info.model);
    console.log('📏 Longueur résumé:', info.min_summary_length, '-', info.max_summary_length);
    console.log('📄 Support PDF:', info.pdf_support.enabled ? '✅' : '❌');
    console.log('📎 Taille max PDF:', info.pdf_support.max_file_size_mb, 'MB');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

console.log('🧪 Tests des APIs de résumé');
console.log('Assurez-vous que le serveur est démarré (npm run dev)');
console.log('');

// Exécuter les tests
testModelInfo();

// Décommenter la ligne suivante pour tester l'upload PDF (nécessite un fichier test-file.pdf)
// testPdfSummarization();
