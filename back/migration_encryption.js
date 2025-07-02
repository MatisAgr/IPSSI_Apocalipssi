require('dotenv').config();
const mongoose = require('mongoose');
const encryptionUtils = require('./utils/encryption');

// Script de migration pour chiffrer les données existantes
async function migrateExistingUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Récupérer tous les utilisateurs avec des données non chiffrées
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    console.log(`📊 ${users.length} utilisateurs trouvés`);

    let migratedCount = 0;

    for (const user of users) {
      try {
        // Vérifier si les données sont déjà chiffrées (contiennent ':')
        const isEmailEncrypted = user.email && user.email.includes(':');
        const isUsernameEncrypted = user.username && user.username.includes(':');

        let needsUpdate = false;
        const updateData = {};

        if (!isEmailEncrypted && user.email) {
          updateData.email = encryptionUtils.encrypt(user.email.toLowerCase().trim());
          needsUpdate = true;
          console.log(`🔒 Chiffrement de l'email pour ${user.email}`);
        }

        if (!isUsernameEncrypted && user.username) {
          updateData.username = encryptionUtils.encrypt(user.username.trim());
          needsUpdate = true;
          console.log(`🔒 Chiffrement du username pour ${user.username}`);
        }

        if (needsUpdate) {
          await mongoose.connection.db.collection('users').updateOne(
            { _id: user._id },
            { $set: updateData }
          );
          migratedCount++;
        }

      } catch (error) {
        console.error(`❌ Erreur lors de la migration de l'utilisateur ${user._id}:`, error);
      }
    }

    console.log(`✅ Migration terminée. ${migratedCount} utilisateurs migrés.`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Script pour décrypter et afficher tous les utilisateurs (pour debug)
async function listDecryptedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const User = require('./models/userModel');
    const users = await User.find().select('-password');

    console.log('\n👥 Liste des utilisateurs (données décryptées):');
    console.log('================================================');

    for (const user of users) {
      try {
        console.log(`ID: ${user._id}`);
        console.log(`Email: ${user.getDecryptedEmail()}`);
        console.log(`Username: ${user.getDecryptedUsername()}`);
        console.log(`Créé: ${user.createdAt}`);
        console.log('---');
      } catch (error) {
        console.error(`❌ Erreur de décryptage pour l'utilisateur ${user._id}:`, error);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Déterminer quelle fonction exécuter selon l'argument
const command = process.argv[2];

if (command === 'migrate') {
  migrateExistingUsers();
} else if (command === 'list') {
  listDecryptedUsers();
} else {
  console.log('Usage:');
  console.log('  node migration_encryption.js migrate  - Migrer les données existantes');
  console.log('  node migration_encryption.js list     - Lister les utilisateurs décryptés');
}

module.exports = { migrateExistingUsers, listDecryptedUsers };
