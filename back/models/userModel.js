const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    type: Date 
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.pre('save', async function(next) {
  if (!this.isNew || this.roleId) return next();
  
  try {
    const { getRoleIdByName } = require('../utils/roleUtils');
    this.roleId = await getRoleIdByName('user');
    next();
  } catch (err) {
    next(new Error('Impossible de définir le rôle par défaut'));
  }
});

module.exports = mongoose.model('User', userSchema);