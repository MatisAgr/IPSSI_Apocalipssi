const Log = require('../models/logModel');

exports.auditLog = async (req, res, next) => {
  try {
    await Log.create({
      userId: req.userId || null,
      action: `${req.method} ${req.path}`
    });
    next();
  } catch (err) {
    console.error('Erreur audit:', err);
    next();
  }
};