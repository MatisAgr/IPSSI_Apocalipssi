const User = require('../models/userModel');
const History = require('../models/historyModel');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) throw new Error("Utilisateur non trouvé");

    res.json({ success: true, user });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await History.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};