const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  resume: { type: String, required: false }, // Le résumé généré par l'IA
  metadata: { type: Object }, // Métadonnées (taille, nom fichier, longueurs, type, etc.)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', historySchema);