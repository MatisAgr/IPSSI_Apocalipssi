const User = require('../models/userModel');
const History = require('../models/historyModel');
const {getRoleIdByName} = require('../utils/roleUtils');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) throw new Error("Utilisateur non trouvé");

    res.json({ 
      success: true, 
      user: {
        ...user.toObject(),
        email: user.getDecryptedEmail(),
        username: user.getDecryptedUsername()
      }
    });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await History.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    // Retourner l'historique avec les résumés et métadonnées
    const cleanedHistory = history.map(entry => {
      const cleaned = entry.toObject();
      return cleaned;
    });

    res.json({ success: true, history: cleanedHistory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { email, username, newPassword, newRoleName } = req.body;
    const user = await User.findById(req.userId);

    if (!user) throw new Error('Utilisateur non trouvé');

    if (!email && !username && !newPassword && !newRoleName) throw new Error('Aucune donnée à mettre à jour');

    // Vérifier l'unicité de l'email si modifié
    if (email && email !== user.getDecryptedEmail()) {
      const existingUserByEmail = await User.findByEmail(email);
      if (existingUserByEmail && existingUserByEmail._id.toString() !== user._id.toString()) {
        throw new Error('Cet email est déjà utilisé');
      }
      user.email = email;
    }

    // Vérifier l'unicité du username si modifié
    if (username && username !== user.getDecryptedUsername()) {
      const existingUserByUsername = await User.findByUsername(username);
      if (existingUserByUsername && existingUserByUsername._id.toString() !== user._id.toString()) {
        throw new Error('Ce nom d\'utilisateur est déjà utilisé');
      }
      user.username = username;
    }

    if (newPassword) {
      user.password = newPassword; 
    }

    if (newRoleName) {
      const newRoleId = await getRoleIdByName(newRoleName);
      user.roleId = newRoleId;
    }

    user.updatedAt = Date.now();

    await user.save();

    // Maj de l'historique
    await History.create({
      userId: user._id,
      action: 'account_update'
    });

    res.json({ 
      success: true,
      message: 'Compte mis à jour',
      user: { 
        id: user._id, 
        email: user.getDecryptedEmail(), 
        username: user.getDecryptedUsername() 
      }
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