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

exports.updateUser = async (req, res) => {
  try {
    const { email,username, newPassword } = req.body;
    const user = await User.findById(req.userId);

    if (!user) throw new Error('Utilisateur non trouvé');


    if (email) user.email = email;

    if (username) user.username = username;

    if (newPassword) {
      user.password = newPassword; 
    }

    await user.save();

    // Maj de l'historique
    await History.create({
      userId: user._id,
      action: 'account_update'
    });

    res.json({ 
      success: true,
      message: 'Compte mis à jour',
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) throw new Error('Utilisateur non trouvé');

    //effacer l'historique relatif à l'utilisateur
    await History.deleteMany({ userId: req.userId });

    // nettoyage du cookie
    res.clearCookie('jwt');

    res.json({ 
      success: true,
      message: 'Compte supprimé définitivement'
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};