const Role = require('../models/roleModel');

exports.getRoleIdByName = async (roleName) => {
  const role = await Role.findOne({ 
    name: { $regex: new RegExp(`^${roleName}$`, 'i') } 
  });

  if (!role) throw new Error(`Rôle "${roleName}" introuvable`);
  return role._id; 
};

exports.getRoleNameById = async (roleId) => {
  const role = await Role.findById(roleId);
  if (!role) throw new Error(`Rôle avec ID "${roleId}" introuvable`);
  return role.name;
};