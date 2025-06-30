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
Informations sur le modèle utilisé et configuration PDF.

**Réponse :**
```json
{
  "model": "facebook/bart-large-cnn",
  "description": "Modèle BART optimisé pour la summarisation de texte",
  "max_input_length": 1024,
  "recommended_min_length": 50,
  "max_summary_length": 150,
  "min_summary_length": 30,
  "pdf_support": {
    "enabled": true,
    "max_file_size": 10485760,
    "max_file_size_mb": 10,
    "allowed_types": ["application/pdf"]
  }
}
```

### POST `/api/summarize-pdf`
Résume le contenu d'un fichier PDF uploadé.

**Multipart Form Data :**
- `pdf`: Fichier PDF à analyser

**Réponse :**
```json
{
  "success": true,
  "filename": "document.pdf",
  "file_size": 245760,
  "extracted_text_length": 1250,
  "summary_length": 89,
  "summary": "Résumé du contenu du PDF...",
  "model_used": "facebook/bart-large-cnn"
}
```

**Limitations :**
- Taille maximum : 10MB (configurable via `PDF_MAX_SIZE`)
- Formats acceptés : PDF uniquement
- Le PDF ne doit pas être protégé par mot de passe

## 🧪 Test

Testez l'API avec le script fourni :
```bash
node test_pdf.js
```

## 🔧 Configuration

Configurez le serveur via le fichier `.env` :

- **`HUGGINGFACE_API_KEY`** : Votre clé API Hugging Face (obligatoire)
- **`PORT`** : Port du serveur (défaut: 3001)
- **`HUGGINGFACE_MODEL`** : Modèle à utiliser (défaut: facebook/bart-large-cnn)
- **`SUMMARY_MAX_LENGTH`** : Longueur maximale du résumé (défaut: 150)
- **`SUMMARY_MIN_LENGTH`** : Longueur minimale du résumé (défaut: 30)
- **`PDF_MAX_SIZE`** : Taille maximale des PDFs en bytes (défaut: 10485760 = 10MB)
- **`JSON_BODY_LIMIT`** : Limite de taille pour les requêtes JSON (défaut: 10mb)

## 📝 Exemples d'utilisation avec curl

**Résumer du texte :**
```bash
curl -X POST http://localhost:3001/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "Votre long texte à résumer ici..."}'
```

**Résumer un PDF :**
```bash
curl -X POST http://localhost:3001/api/summarize-pdf \
  -F "pdf=@chemin/vers/votre/document.pdf"
```

**Obtenir les informations du modèle :**
```bash
curl http://localhost:3001/api/model-info
```

## ⚠️ Notes

- Nécessite une clé API Hugging Face (Read Token)
- Le texte doit faire au moins 50 caractères
- Limite de taille JSON : 10MB par requête
- Limite de taille PDF : 10MB par défaut (configurable)
- Les PDFs protégés par mot de passe ne sont pas supportés
- Seuls les fichiers PDF sont acceptés pour l'upload
