// Script de test simple pour l'API de résumé
const http = require('http');

const simpleTestText = `
Contexte général : Votre client, une start-up spécialisée en solutions d’automatisation pour la veille réglementaire, souhaite lancer rapidement un POC d’un assistant intelligent de synthèse de documents (contrats, rapports, normes). L’idée : l’utilisateur uploade un document PDF et l’outil génère en quelques secondes – à l’aide d’une API LLM pré-entraînée – un résumé structuré, des points clés et des suggestions d’actions. 
Objectif pédagogique :  
Mettre en œuvre Scrum pour livrer un prototype fonctionnel en 4 jours, avec un incrément utilisable 
Tirer parti d’outils de génération de code (Cursor, GitHub Copilot, Bolt) pour accélérer le développement 
Gérer, chaque jour, 2 incidents imprévus pour simuler un contexte « chaotique » et forcer l’adaptation agile 
Technologies suggérées :  
Back-end : Node.js / Python Flask, intégration à une API LLM (OpenAI, Hugging Face) 
Front-end : React ou Vue.js 
CI/CD & DevOps : GitHub Actions, Docker 
Générateurs de code :  
Le POC pourra être réalisé en s’appuyant sur des générateurs de code assistés par une Intelligence Artificielle Générative (IAG), tels que claude, cursor.com, GitHub Copilot, lovable.dev, bolt.new ou v0.dev 
Stockage : MongoDB ou PostgreSQL 
Choix des technos suivant les cours techniques déjà vu et validation des membres de chaque groupe ; ça fait parti des enjeux  
Environnement d’immersion totale : 
Les étudiants (B3 et M1) seront répartis en équipes 
Immergés dans le projet, ils doivent produire des livrables de gestion de projet à intervalles réguliers 
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
