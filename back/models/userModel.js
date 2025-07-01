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
  // Hasher le mot de passe s'il a été modifié
  if (this.isModified('password')) {
    try {
      this.password = await bcrypt.hash(this.password, 12);
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);