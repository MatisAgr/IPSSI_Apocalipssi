const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    // Vérification depuis les cookies
    const token = req.cookies.jwt;
    if (!token) throw new Error("Accès non autorisé");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Session invalide" });
  }
};