require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('./models/roleModel');

async function initializeRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Vérifier si des rôles existent déjà
    const existingRoles = await Role.find();
    
    if (existingRoles.length > 0) {
      console.log('📋 Rôles existants trouvés:');
      existingRoles.forEach(role => {
        console.log(`  - ${role.name} (ID: ${role._id})`);
      });
      console.log('\n⚠️ Des rôles existent déjà. Voulez-vous les recréer ?');
      console.log('Pour forcer la recréation, utilisez: node init_roles.js --force');
      
      if (!process.argv.includes('--force')) {
        return;
      }
      
      // Supprimer tous les rôles existants si --force
      await Role.deleteMany({});
      console.log('🗑️ Tous les rôles existants ont été supprimés');
    }

    // Créer les rôles par défaut
    const defaultRoles = [
      { name: 'admin' },
      { name: 'user' },
      { name: 'moderator' }
    ];

    console.log('\n🏗️ Création des rôles par défaut...');

    for (const roleData of defaultRoles) {
      const role = new Role({
        name: roleData.name,
        createdAt: new Date()
      });

      await role.save();
      console.log(`✅ Rôle "${role.name}" créé (ID: ${role._id})`);
    }

    console.log('\n🎉 Initialisation des rôles terminée !');

    // Afficher un récapitulatif
    const allRoles = await Role.find();
    console.log('\n📋 Rôles disponibles:');
    allRoles.forEach(role => {
      console.log(`  - ${role.name} (ID: ${role._id})`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des rôles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Fonction pour vérifier l'existence des rôles
async function checkRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const roles = await Role.find();
    
    if (roles.length === 0) {
      console.log('⚠️ Aucun rôle trouvé dans la base de données');
      console.log('Exécutez: node init_roles.js pour créer les rôles par défaut');
    } else {
      console.log('📋 Rôles existants:');
      roles.forEach(role => {
        console.log(`  - ${role.name} (ID: ${role._id}, Créé: ${role.createdAt})`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Déterminer quelle fonction exécuter
const command = process.argv[2];

if (command === 'check') {
  checkRoles();
} else {
  initializeRoles();
}

module.exports = { initializeRoles, checkRoles };
