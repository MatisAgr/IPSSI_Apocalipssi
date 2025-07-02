const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchemaWithHash = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true
  },
  username: { 
    type: String, 
    required: true, 
    unique: true
  },
  emailHash: { // Hash de l'email pour recherche
    type: String,
    required: true,
    unique: true
  },
  usernameHash: { // Hash du username pour recherche
    type: String,
    required: true,
    unique: true
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
    type: Date 
  }
});

// Fonction pour créer un hash avec JWT_SECRET
const hashWithJWTSecret = async (data) => {
  const combined = data + process.env.JWT_SECRET;
  return bcrypt.hash(combined, 12);
};

userSchemaWithHash.pre('save', async function(next) {
  try {
    // Hasher l'email s'il a été modifié
    if (this.isModified('email')) {
      this.emailHash = await hashWithJWTSecret(this.email.toLowerCase().trim());
    }
    
    // Hasher le username s'il a été modifié
    if (this.isModified('username')) {
      this.usernameHash = await hashWithJWTSecret(this.username.trim());
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

// Méthode statique pour trouver par email
userSchemaWithHash.statics.findByEmail = async function(email) {
  const emailHash = await hashWithJWTSecret(email.toLowerCase().trim());
  return this.findOne({ emailHash });
};

// Méthode statique pour trouver par username
userSchemaWithHash.statics.findByUsername = async function(username) {
  const usernameHash = await hashWithJWTSecret(username.trim());
  return this.findOne({ usernameHash });
};

userSchemaWithHash.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('UserWithHash', userSchemaWithHash);
