const Role = require('../models/roleModel');

exports.getRoleIdByName = async (roleName) => {
  let role = await Role.findOne({ 
    name: { $regex: new RegExp(`^${roleName}$`, 'i') } 
  });

  // Si le rôle n'existe pas, le créer automatiquement
  if (!role) {
    console.log(`🏗️ Création automatique du rôle "${roleName}"`);
    role = new Role({
      name: roleName.toLowerCase(),
      createdAt: new Date()
    });
    await role.save();
    console.log(`✅ Rôle "${roleName}" créé automatiquement (ID: ${role._id})`);
  }

  return role._id; 
};

exports.getRoleNameById = async (roleId) => {
  const role = await Role.findById(roleId);
  if (!role) throw new Error(`Rôle avec ID "${roleId}" introuvable`);
  return role.name;
};