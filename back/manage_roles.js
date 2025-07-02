require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('./models/roleModel');
const User = require('./models/userModel');

async function manageRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const command = process.argv[2];
    const roleName = process.argv[3];

    switch (command) {
      case 'list':
        await listRoles();
        break;
      case 'create':
        if (!roleName) {
          console.log('❌ Usage: node manage_roles.js create <nom_du_role>');
          return;
        }
        await createRole(roleName);
        break;
      case 'delete':
        if (!roleName) {
          console.log('❌ Usage: node manage_roles.js delete <nom_du_role>');
          return;
        }
        await deleteRole(roleName);
        break;
      case 'users':
        if (!roleName) {
          console.log('❌ Usage: node manage_roles.js users <nom_du_role>');
          return;
        }
        await listUsersByRole(roleName);
        break;
      case 'init':
        await initDefaultRoles();
        break;
      default:
        showHelp();
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

async function listRoles() {
  const roles = await Role.find().sort({ name: 1 });
  
  if (roles.length === 0) {
    console.log('⚠️ Aucun rôle trouvé');
    return;
  }

  console.log('📋 Rôles existants:');
  console.log('==================');
  
  for (const role of roles) {
    const userCount = await User.countDocuments({ roleId: role._id });
    console.log(`• ${role.name} (ID: ${role._id}) - ${userCount} utilisateur(s)`);
    console.log(`  Créé: ${role.createdAt || 'Date inconnue'}`);
  }
}

async function createRole(roleName) {
  const existingRole = await Role.findOne({ 
    name: { $regex: new RegExp(`^${roleName}$`, 'i') } 
  });

  if (existingRole) {
    console.log(`⚠️ Le rôle "${roleName}" existe déjà (ID: ${existingRole._id})`);
    return;
  }

  const role = new Role({
    name: roleName.toLowerCase(),
    createdAt: new Date()
  });

  await role.save();
  console.log(`✅ Rôle "${roleName}" créé avec succès (ID: ${role._id})`);
}

async function deleteRole(roleName) {
  const role = await Role.findOne({ 
    name: { $regex: new RegExp(`^${roleName}$`, 'i') } 
  });

  if (!role) {
    console.log(`❌ Rôle "${roleName}" introuvable`);
    return;
  }

  // Vérifier s'il y a des utilisateurs avec ce rôle
  const userCount = await User.countDocuments({ roleId: role._id });
  
  if (userCount > 0) {
    console.log(`⚠️ Impossible de supprimer le rôle "${roleName}"`);
    console.log(`   ${userCount} utilisateur(s) ont encore ce rôle`);
    console.log('   Réassignez d\'abord ces utilisateurs à un autre rôle');
    return;
  }

  await Role.findByIdAndDelete(role._id);
  console.log(`✅ Rôle "${roleName}" supprimé avec succès`);
}

async function listUsersByRole(roleName) {
  const role = await Role.findOne({ 
    name: { $regex: new RegExp(`^${roleName}$`, 'i') } 
  });

  if (!role) {
    console.log(`❌ Rôle "${roleName}" introuvable`);
    return;
  }

  const users = await User.find({ roleId: role._id }).select('-password');
  
  console.log(`👥 Utilisateurs avec le rôle "${roleName}":`);
  console.log('=====================================');
  
  if (users.length === 0) {
    console.log('Aucun utilisateur trouvé');
    return;
  }

  for (const user of users) {
    try {
      console.log(`• ${user.getDecryptedUsername()} (${user.getDecryptedEmail()})`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Créé: ${user.createdAt}`);
      console.log(`  Dernière connexion: ${user.lastLogin || 'Jamais'}`);
      console.log('---');
    } catch (error) {
      console.log(`• Utilisateur ${user._id} (erreur de décryptage)`);
      console.log('---');
    }
  }
}

async function initDefaultRoles() {
  const defaultRoles = ['admin', 'user', 'moderator'];
  
  console.log('🏗️ Initialisation des rôles par défaut...');
  
  for (const roleName of defaultRoles) {
    const existingRole = await Role.findOne({ 
      name: { $regex: new RegExp(`^${roleName}$`, 'i') } 
    });

    if (existingRole) {
      console.log(`✓ Rôle "${roleName}" existe déjà`);
    } else {
      const role = new Role({
        name: roleName,
        createdAt: new Date()
      });
      await role.save();
      console.log(`✅ Rôle "${roleName}" créé`);
    }
  }
  
  console.log('🎉 Initialisation terminée');
}

function showHelp() {
  console.log('📋 Gestionnaire de rôles');
  console.log('========================');
  console.log('');
  console.log('Usage: node manage_roles.js <commande> [paramètres]');
  console.log('');
  console.log('Commandes disponibles:');
  console.log('  list                    - Lister tous les rôles');
  console.log('  create <nom>           - Créer un nouveau rôle');
  console.log('  delete <nom>           - Supprimer un rôle');
  console.log('  users <nom>            - Lister les utilisateurs d\'un rôle');
  console.log('  init                   - Initialiser les rôles par défaut');
  console.log('');
  console.log('Exemples:');
  console.log('  node manage_roles.js list');
  console.log('  node manage_roles.js create editor');
  console.log('  node manage_roles.js users admin');
  console.log('  node manage_roles.js init');
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  manageRoles();
}

module.exports = { manageRoles, listRoles, createRole, deleteRole, listUsersByRole, initDefaultRoles };
