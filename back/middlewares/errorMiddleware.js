exports.handleErrors = (err, req, res, next) => {
  console.error(err);

  if (err.message.includes('PDF')) {
    return res.status(400).json({
      error: 'Erreur PDF',
      message: err.message
    });
  }

  if (err.message.includes('Authorization')) {
    return res.status(401).json({
      error: 'Erreur d\'authentification',
      message: 'Clé API invalide'
    });
  }

  res.status(500).json({
    error: 'Erreur interne',
    message: 'Une erreur est survenue'
  });
};