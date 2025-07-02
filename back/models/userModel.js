const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const encryptionUtils = require('../utils/encryption');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  roleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Role', 
    required: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLogin: { 
    type: Date 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

userSchema.pre('save', async function(next) {
  try {
    // Chiffrer l'email s'il a été modifié
    if (this.isModified('email')) {
      this.email = encryptionUtils.encrypt(this.email.toLowerCase().trim());
    }
    
    // Chiffrer le username s'il a été modifié
    if (this.isModified('username')) {
      this.username = encryptionUtils.encrypt(this.username.trim());
    }
    
    // Hasher le mot de passe s'il a été modifié
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    
    next();
  } catch (err) {
    next(err);
  }
});

// Méthode pour décrypter l'email
userSchema.methods.getDecryptedEmail = function() {
  return encryptionUtils.decrypt(this.email);
};

// Méthode pour décrypter le username
userSchema.methods.getDecryptedUsername = function() {
  return encryptionUtils.decrypt(this.username);
};

// Méthode pour comparer l'email
userSchema.methods.compareEmail = function(candidateEmail) {
  const decryptedEmail = this.getDecryptedEmail();
  return decryptedEmail === candidateEmail.toLowerCase().trim();
};

// Méthode pour comparer le username
userSchema.methods.compareUsername = function(candidateUsername) {
  const decryptedUsername = this.getDecryptedUsername();
  return decryptedUsername === candidateUsername.trim();
};

// Méthodes statiques pour rechercher par email/username décryptés
userSchema.statics.findByEmail = async function(email) {
  const users = await this.find();
  for (const user of users) {
    try {
      if (user.compareEmail(email)) {
        return user;
      }
    } catch (error) {
      console.error('Erreur lors de la décryption de l\'email:', error);
    }
  }
  return null;
};

userSchema.statics.findByUsername = async function(username) {
  const users = await this.find();
  for (const user of users) {
    try {
      if (user.compareUsername(username)) {
        return user;
      }
    } catch (error) {
      console.error('Erreur lors de la décryption du username:', error);
    }
  }
  return null;
};

userSchema.statics.findByEmailOrUsername = async function(identifier) {
  const users = await this.find();
  for (const user of users) {
    try {
      if (user.compareEmail(identifier) || user.compareUsername(identifier)) {
        return user;
      }
    } catch (error) {
      console.error('Erreur lors de la décryption:', error);
    }
  }
  return null;
};

// Méthode pour obtenir tous les utilisateurs avec données décryptées
userSchema.statics.findAllDecrypted = async function() {
  const users = await this.find();
  return users.map(user => ({
    ...user.toObject(),
    email: user.getDecryptedEmail(),
    username: user.getDecryptedUsername()
  }));
};

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);