// Script de test simple pour l'API de résumé
const http = require('http');

const simpleTestText = `
L'intelligence artificielle est une technologie revolutionnaire qui transforme notre facon de vivre et de travailler. 
Elle permet aux machines d'apprendre, de raisonner et de prendre des decisions de maniere autonome. 
Dans le domaine de la sante, l'IA aide les medecins a diagnostiquer les maladies plus rapidement et avec plus de precision. 
En finance, elle detecte les fraudes et optimise les investissements. 
Dans les transports, elle rend possible la conduite autonome. 
L'IA transforme egalement l'education en personnalisant l'apprentissage selon les besoins de chaque etudiant. 
Cependant, elle souleve aussi des questions ethiques importantes concernant l'emploi, la vie privee et la securite. 
Il est crucial de developper l'IA de maniere responsable pour maximiser ses benefices tout en minimisant les risques.
`;

async function testAPI() {
  const postData = JSON.stringify({
    text: simpleTestText.trim()
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/summarize',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: result });
        } catch (error) {
          console.error('Erreur parsing JSON:', error.message);
          console.error('Reponse brute:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('🧪 Test simple de l\'API de resume...\n');
  console.log('📝 Texte a resumer:');
  console.log(simpleTestText.trim());
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    const response = await testAPI();
    
    console.log(`📊 Status: ${response.statusCode}`);
    
    if (response.statusCode === 200 && response.data.success) {
      console.log('✅ Resume genere avec succes!');
      console.log(`📊 Longueur originale: ${response.data.original_length} caracteres`);
      console.log(`📊 Longueur du resume: ${response.data.summary_length} caracteres`);
      console.log(`🤖 Modele: ${response.data.model_used}`);
      console.log('\n📄 Resume:');
      console.log(response.data.summary);
    } else {
      console.log('❌ Erreur:', response.data.error || 'Erreur inconnue');
      console.log('💡 Message:', response.data.message || 'Aucun message');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

if (require.main === module) {
  main();
}
