const History = require('../models/historyModel');

exports.logAction = (action) => {
  return async (req, res, next) => {
    if (req.userId) {
      await History.create({
        userId: req.userId,
        action,
        metadata: req.file ? { 
          filename: req.file.originalname,
          size: req.file.size 
        } : null
      });
    }
    next();
  };
};