const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Connexion MongoDB
mongoose.connect("mongodb://localhost:27017/apocalipssi", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schéma utilisateur
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);

// Middleware pour upload PDF
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /summarize
 * Reçoit un PDF, extrait le texte, envoie à Hugging Face, retourne le résumé
 */
app.post('/summarize', upload.single('pdf'), async (req, res) => {
  try {
    const pdfBuffer = req.file.buffer;
    const data = await pdfParse(pdfBuffer);
    const extractedText = data.text.slice(0, 1500); // on limite le texte

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      { inputs: extractedText },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
        },
      }
    );

    const summary = response.data[0]?.summary_text || "Aucun résumé généré.";
    res.json({ summary });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Erreur côté résumé Hugging Face' });
  }
});

/**
 * POST /register
 * Reçoit un email et un mot de passe, crée un utilisateur, retourne un token
 */
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Utilisateur déjà existant" });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer et enregistrer l'utilisateur
    const user = new User({ email, password: hashedPassword });
    await user.save();

    // Créer un token JWT
    const token = jwt.sign({ id: user._id }, "SECRET123", { expiresIn: "2h" });

    // Retourner le token
    res.status(201).json({ token });

  } catch (error) {
    console.error("Erreur inscription :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.listen(3001, () => console.log('✅ Serveur Node.js lancé sur http://localhost:3001'));
