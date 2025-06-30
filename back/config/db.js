const mongoose = require('mongoose');

const DB_URL = process.env.DATABASE_URL;

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log(`✅ MongoDB Connecté: ${mongoose.connection.host}`))
.catch(err => {
  console.error('❌ Erreur MongoDB:', err.message);
  process.exit(1);
});

module.exports = mongoose;