import { useState, useEffect } from 'react';
import { getUserProfile, getUserHistory, UserProfile, HistoryItem } from '../callApi/profileApi';
import { FadeIn } from '../components/animations/FadeIn';

const Profile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [profileData, historyData] = await Promise.all([
                    getUserProfile(),
                    getUserHistory()
                ]);
                setProfile(profileData);
                setHistory(historyData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionLabel = (action: string) => {
        const labels: { [key: string]: string } = {
            'pdf_summary': 'Résumé PDF',
            'text_summary': 'Résumé Texte'
        };
        return labels[action] || action;
    };

    const getActionIcon = (action: string) => {
        const icons: { [key: string]: string } = {
            'pdf_summary': '📄',
            'text_summary': '📝'
        };
        return icons[action] || '📋';
    };

    const summaryHistory = history.filter(item => item.resume);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Erreur</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <FadeIn>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                        <div className="px-6 py-8">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">
                                        {profile?.username?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{profile?.username}</h1>
                                    <p className="text-gray-600">{profile?.email}</p>
                                </div>
                            </div>
                            <div className="mt-6 text-sm text-gray-500">
                                Membre depuis le {profile && formatDate(profile.createdAt)}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8 px-6">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Informations du profil
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Historique des résumés ({summaryHistory.length})
                                </button>
                            </nav>
                        </div>

                        <div className="p-6">
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nom d'utilisateur
                                            </label>
                                            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                                                {profile?.username}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                                                {profile?.email}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Statistiques */}
                                    <div className="mt-8">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques</h3>
                                        <div className="bg-blue-50 p-4 rounded-lg inline-block">
                                            <div className="text-2xl font-bold text-blue-600">{summaryHistory.length}</div>
                                            <div className="text-sm text-blue-800">Résumés créés</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Historique des résumés
                                    </h3>

                                    {summaryHistory.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="text-6xl mb-4">📝</div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                Aucun résumé créé
                                            </h3>
                                            <p className="text-gray-600">
                                                Vous n'avez pas encore créé de résumé. Commencez par télécharger un PDF ou saisir du texte.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {summaryHistory.map((item) => (
                                                <div
                                                    key={item._id}
                                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-2xl">{getActionIcon(item.action)}</span>
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">
                                                                    {item.metadata.filename}
                                                                </h4>
                                                                <p className="text-sm text-gray-500">
                                                                    {formatDate(item.createdAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {item.resume && (
                                                        <div className="bg-gray-50 rounded-md p-3 mt-3">
                                                            <h5 className="font-medium text-gray-700 mb-2">Résumé :</h5>
                                                            <div 
                                                                className="text-gray-600 text-sm leading-relaxed"
                                                                dangerouslySetInnerHTML={{ 
                                                                    __html: item.resume.replace(/\n/g, '<br>') 
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                    {item.metadata && (
                                                        <div className="mt-3 text-xs text-gray-500">
                                                            {item.metadata.filename && (
                                                                <span>Fichier: {item.metadata.filename}</span>
                                                            )}
                                                            {item.metadata.fileSize && (
                                                                <span className="ml-3">
                                                                    Taille: {Math.round(item.metadata.fileSize / 1024)} KB
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </FadeIn>
    );
};

export default Profile;
