const crypto = require('crypto');

class EncryptionUtils {
  constructor() {
    this.algorithm = 'aes-256-cbc';
    this.secretKey = crypto.scryptSync(process.env.JWT_SECRET, 'salt', 32);
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedData) {
    try {
      const parts = encryptedData.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];
      
      const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv);
      
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Erreur de décryptage:', error);
      throw new Error('Impossible de décrypter les données');
    }
  }

  // Fonction pour hasher avec bcrypt + JWT_SECRET (si vraiment nécessaire)
  hashWithJWTSecret(data) {
    const bcrypt = require('bcryptjs');
    const combined = data + process.env.JWT_SECRET;
    return bcrypt.hashSync(combined, 12);
  }

  // Fonction pour comparer le hash avec JWT_SECRET
  compareWithJWTSecret(data, hash) {
    const bcrypt = require('bcryptjs');
    const combined = data + process.env.JWT_SECRET;
    return bcrypt.compareSync(combined, hash);
  }
}

module.exports = new EncryptionUtils();
