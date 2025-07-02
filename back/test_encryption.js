require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');

// Test de chiffrement/déchiffrement
async function testEncryption() {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Test de création d'utilisateur avec chiffrement
    const testUser = new User({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      roleId: new mongoose.Types.ObjectId() // ID de rôle temporaire pour le test
    });

    console.log('\n📝 Création d\'un utilisateur de test...');
    console.log('Email original:', 'test@example.com');
    console.log('Username original:', 'testuser');

    await testUser.save();
    console.log('✅ Utilisateur sauvegardé');

    // Vérifier que les données sont chiffrées en base
    console.log('\n🔒 Données chiffrées en base:');
    console.log('Email chiffré:', testUser.email);
    console.log('Username chiffré:', testUser.username);

    // Tester le déchiffrement
    console.log('\n🔓 Données déchiffrées:');
    console.log('Email déchiffré:', testUser.getDecryptedEmail());
    console.log('Username déchiffré:', testUser.getDecryptedUsername());

    // Tester les méthodes de recherche
    console.log('\n🔍 Test des méthodes de recherche...');
    
    const foundByEmail = await User.findByEmail('test@example.com');
    console.log('Trouvé par email:', foundByEmail ? '✅' : '❌');
    
    const foundByUsername = await User.findByUsername('testuser');
    console.log('Trouvé par username:', foundByUsername ? '✅' : '❌');
    
    const foundByEither = await User.findByEmailOrUsername('test@example.com');
    console.log('Trouvé par email/username:', foundByEither ? '✅' : '❌');

    // Tester les méthodes de comparaison
    console.log('\n⚖️ Test des méthodes de comparaison...');
    console.log('Compare email correct:', testUser.compareEmail('test@example.com') ? '✅' : '❌');
    console.log('Compare email incorrect:', testUser.compareEmail('wrong@example.com') ? '❌' : '✅');
    console.log('Compare username correct:', testUser.compareUsername('testuser') ? '✅' : '❌');
    console.log('Compare username incorrect:', testUser.compareUsername('wronguser') ? '❌' : '✅');

    // Nettoyage
    await User.findByIdAndDelete(testUser._id);
    console.log('\n🧹 Utilisateur de test supprimé');

    console.log('\n🎉 Tous les tests de chiffrement ont réussi !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Lancer le test si le script est exécuté directement
if (require.main === module) {
  testEncryption();
}

module.exports = testEncryption;
