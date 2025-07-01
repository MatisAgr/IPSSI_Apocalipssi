const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const History = require('../models/historyModel');

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { email,username, password } = req.body;
    const user = new User({ email,username, password });
    await user.save();

    // Création de l'historique
    await History.create({
      userId: user._id,
      action: 'register'
    });

    // Cookie JWT
    const token = createToken(user._id);
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });

    res.status(201).json({ success: true, user: { id: user._id, email } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("Identifiants invalides");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error("Identifiants invalides");

    // Mise à jour dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // Historique
    await History.create({
      userId: user._id,
      action: 'login'
    });

    // Cookie JWT
    const token = createToken(user._id);
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, user: { id: user._id, email } });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.json({ success: true, message: "Déconnecté avec succès" });
};