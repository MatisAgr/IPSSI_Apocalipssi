import { useState } from 'react';
import axios from 'axios';
import APP_NAME from '../constants/AppName';
import { FaFilePdf, FaUpload, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaClock, FaPercentage } from 'react-icons/fa';

interface SummaryResponse {
  success: boolean;
  filename: string;
  file_size: number;
  extracted_text_length: number;
  summary_length: number;
  summary: string;
  model_used: string;
}

interface ErrorResponse {
  error: string;
  message: string;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour calculer le temps gagné
  const calculateTimeSaved = (originalLength: number, summaryLength: number) => {
    const avgReadingSpeed = 200; // mots par minute
    const avgCharsPerWord = 5; // caractères par mot en moyenne
    
    const originalWords = originalLength / avgCharsPerWord;
    const summaryWords = summaryLength / avgCharsPerWord;
    
    const originalReadingTime = originalWords / avgReadingSpeed; // en minutes
    const summaryReadingTime = summaryWords / avgReadingSpeed; // en minutes
    
    const timeSaved = originalReadingTime - summaryReadingTime; // en minutes
    const compressionRatio = ((originalLength - summaryLength) / originalLength) * 100;
    
    return {
      originalTime: originalReadingTime,
      summaryTime: summaryReadingTime,
      timeSaved: timeSaved,
      compressionRatio: compressionRatio
    };
  };

  // Fonction pour formater le temps en minutes/heures
  const formatTime = (minutes: number) => {
    if (minutes < 1) {
      return `${Math.round(minutes * 60)} secondes`;
    } else if (minutes < 60) {
      return `${Math.round(minutes)} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return `${hours}h ${remainingMinutes}min`;
    }
  };

  // Gestion du drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setSelectedFile(files[0]);
      setError(null);
    } else {
      setError('Veuillez sélectionner un fichier PDF valide');
    }
  };

  // Gestion de la sélection de fichier
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files[0].type === 'application/pdf') {
        setSelectedFile(files[0]);
        setError(null);
      } else {
        setError('Veuillez sélectionner un fichier PDF valide');
      }
    }
  };

  // Upload et résumé du PDF
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setSummary(null);

    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
      const response = await axios.post<SummaryResponse>(
        'http://localhost:3001/api/summarize-pdf',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      setSummary(response.data);
    } catch (err: any) {
      if (err.response?.data) {
        const errorData: ErrorResponse = err.response.data;
        setError(`${errorData.error}: ${errorData.message}`);
      } else {
        setError('Une erreur est survenue lors de l\'upload du fichier');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset de l'interface
  const handleReset = () => {
    setSelectedFile(null);
    setSummary(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <FaFilePdf className="text-red-500" />
            {APP_NAME}
          </h1>
          <p className="text-lg text-gray-600">
            Résumé automatique de documents PDF avec IA
          </p>
        </div>

        {/* Zone d'upload PDF */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FaFilePdf className="text-red-500" />
            Upload de PDF
          </h2>

          {/* Zone de drag & drop */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              isDragging
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-lg text-gray-600 mb-2">
              Glissez-déposez votre fichier PDF ici
            </p>
            <p className="text-sm text-gray-500 mb-4">ou</p>
            
            <label className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors duration-200">
              <FaFilePdf className="inline mr-2" />
              Choisir un fichier PDF
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            
            <p className="text-xs text-gray-400 mt-4">
              Taille maximale : 5MB
            </p>
          </div>

          {/* Fichier sélectionné */}
          {selectedFile && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaFilePdf className="text-red-500 text-xl" />
                  <div>
                    <p className="font-medium text-gray-800">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpload}
                    disabled={isLoading}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <FaUpload />
                        Résumer
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <FaExclamationTriangle />
              <span className="font-medium">Erreur</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Résultats */}
        {summary && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-2 text-green-600 mb-6">
              <FaCheckCircle />
              <h2 className="text-2xl font-semibold">Résumé généré avec succès</h2>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {summary.filename && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Fichier</p>
                  <p className="font-semibold text-blue-700">{summary.filename}</p>
                </div>
              )}
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Texte original</p>
                <p className="font-semibold text-green-700">
                  {summary.extracted_text_length.toLocaleString()} caractères
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Résumé</p>
                <p className="font-semibold text-purple-700">
                  {summary.summary_length} caractères
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FaClock className="text-orange-600" />
                  <p className="text-sm text-gray-600">Temps gagné</p>
                </div>
                <p className="font-semibold text-orange-700">
                  {formatTime(calculateTimeSaved(
                    summary.extracted_text_length, 
                    summary.summary_length
                  ).timeSaved)}
                </p>
              </div>
            </div>

            {/* Statistiques détaillées */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaPercentage className="text-blue-600" />
                Analyse de compression
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatTime(calculateTimeSaved(
                      summary.extracted_text_length, 
                      summary.summary_length
                    ).originalTime)}
                  </p>
                  <p className="text-sm text-gray-600">Temps de lecture original</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {formatTime(calculateTimeSaved(
                      summary.extracted_text_length, 
                      summary.summary_length
                    ).summaryTime)}
                  </p>
                  <p className="text-sm text-gray-600">Temps de lecture du résumé</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {calculateTimeSaved(
                      summary.extracted_text_length, 
                      summary.summary_length
                    ).compressionRatio.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Taux de compression</p>
                </div>
              </div>
            </div>

            {/* Résumé */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Résumé du document</h3>
              <p className="text-gray-700 leading-relaxed">{summary.summary}</p>
            </div>

            {/* Informations techniques */}
            <div className="mt-6 text-sm text-gray-500">
              <p>Modèle utilisé : {summary.model_used}</p>
              {summary.file_size && (
                <p>Taille du fichier : {(summary.file_size / (1024 * 1024)).toFixed(2)} MB</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}