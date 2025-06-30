# Serveur de Résumé de Texte - API Hugging Face

Un serveur Express simple qui utilise l'API Hugging Face pour résumer du texte avec un modèle LLM.

## 🚀 Installation et Démarrage Rapide

1. **Installer les dépendances :**
   ```bash
   cd back
   npm install
   ```

2. **Configurer la clé API :**
   ```bash
   cp .env.example .env
   ```
   Puis éditez le fichier `.env` et remplacez `your_hugging_face_api_key_here` par votre vraie clé API Hugging Face.

3. **Démarrer le serveur :**
   ```bash
   npm start
   ```
   
   Ou en mode développement :
   ```bash
   npm run dev
   ```

## 📡 Endpoints API

### POST `/api/summarize`
Résume un texte donné.

**Body (JSON) :**
```json
{
  "text": "Votre texte à résumer ici..."
}
```

**Réponse :**
```json
{
  "success": true,
  "original_length": 150,
  "summary_length": 45,
  "summary": "Résumé du texte...",
  "model_used": "facebook/bart-large-cnn"
}
```

### GET `/api/model-info`
Informations sur le modèle utilisé.

## 🧪 Test

Testez l'API avec le script fourni :
```bash
node test_pdf.js
```

## 🔧 Configuration

- **Port :** 3001 (par défaut)
- **Modèle :** facebook/bart-large-cnn
- **Longueur minimale :** 50 caractères
- **Longueur maximale du résumé :** 150 tokens

## 📝 Exemple d'utilisation avec curl

```bash
curl -X POST http://localhost:3001/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "Votre long texte à résumer ici..."}'
```

## ⚠️ Notes

- Nécessite une clé API Hugging Face (Read Token)
- Le texte doit faire au moins 50 caractères
- Limite de taille : 10MB par requête
