const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
  }
};

const limits = {
  fileSize: parseInt(process.env.PDF_MAX_SIZE_MB) * 1024 * 1024
};

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;