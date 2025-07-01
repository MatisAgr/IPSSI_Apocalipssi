const History = require('../models/historyModel');

exports.historyAction = (action) => {
  return async (req, res, next) => {
    if (req.userId) {
      try {
        await History.create({
          userId: req.userId,
          resume: `Action ${action} effectuée`, 
          metadata: {
            ...(req.file && { 
              filename: req.file.originalname,
              size: req.file.size 
            }),
            endpoint: req.originalUrl
          }
        });
      } catch (err) {
        console.error('Erreur historique:', err);
      }
    }
    next();
  };
};