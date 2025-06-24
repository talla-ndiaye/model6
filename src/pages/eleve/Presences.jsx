import { AlertCircle, Calendar, CheckCircle, Clock, UserX, XCircle } from 'lucide-react';
import { useState } from 'react';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { classes, eleves, presences } from '../../data/donneesTemporaires';

const PresencesEleve = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Récupérer l'élève
  const eleve = eleves.find(e => e.email === user.email);
  
  // Récupérer les présences de l'élève
  const mesPresences = presences.filter(presence => presence.eleveId === eleve?.id);

  // Filtrer par mois sélectionné
  const presencesDuMois = mesPresences.filter(presence => 
    presence.date.startsWith(selectedMonth)
  );

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'retard':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'renvoye':
        return <UserX className="w-5 h-5 text-purple-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'present':
        return 'Présent';
      case 'absent':
        return 'Absent';
      case 'retard':
        return 'En retard';
      case 'renvoye':
        return 'Renvoyé';
      default:
        return 'Non défini';
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'retard':
        return 'bg-orange-100 text-orange-800';
      case 'renvoye':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getClassName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : 'Classe inconnue';
  };

  const getStats = () => {
    const total = mesPresences.length;
    const presents = mesPresences.filter(p => p.statut === 'present').length;
    const absents = mesPresences.filter(p => p.statut === 'absent').length;
    const retards = mesPresences.filter(p => p.statut === 'retard').length;
    const renvoyes = mesPresences.filter(p => p.statut === 'renvoye').length;
    const justifies = mesPresences.filter(p => p.justifie && p.statut !== 'present').length;

    const tauxPresence = total > 0 ? ((presents / total) * 100).toFixed(1) : 0;

    return { total, presents, absents, retards, renvoyes, justifies, tauxPresence };
  };

  const stats = getStats();

  if (!eleve) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profil non trouvé</h3>
          <p className="text-gray-600">
            Impossible de récupérer vos informations d'élève.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes présences</h1>
          <p className="text-gray-600">Consultez votre historique de présences</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mois
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 text-center">
          <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Jours total</p>
        </Card>

        <Card className="p-4 text-center">
          <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">{stats.presents}</p>
          <p className="text-sm text-gray-600">Présent</p>
        </Card>

        <Card className="p-4 text-center">
          <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-600">{stats.absents}</p>
          <p className="text-sm text-gray-600">Absent</p>
        </Card>

        <Card className="p-4 text-center">
          <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-orange-600">{stats.retards}</p>
          <p className="text-sm text-gray-600">Retards</p>
        </Card>

        <Card className="p-4 text-center">
          <UserX className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-600">{stats.renvoyes}</p>
          <p className="text-sm text-gray-600">Renvoyé</p>
        </Card>

        <Card className="p-4 text-center">
          <AlertCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">{stats.tauxPresence}%</p>
          <p className="text-sm text-gray-600">Taux présence</p>
        </Card>
      </div>

      {/* Informations de classe */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Classe</p>
            <p className="font-medium text-gray-900">{getClassName(eleve.classeId)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Justifications acceptées</p>
            <p className="font-medium text-green-600">{stats.justifies}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Non justifiées</p>
            <p className="font-medium text-red-600">
              {stats.absents + stats.retards + stats.renvoyes - stats.justifies}
            </p>
          </div>
        </div>
      </Card>

      {/* Historique des présences */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Historique - {new Date(selectedMonth + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </h2>

          <div className="space-y-4">
            {presencesDuMois.length > 0 ? (
              presencesDuMois
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(presence => (
                  <div key={presence.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(presence.statut)}
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(presence.date).toLocaleDateString('fr-FR', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long' 
                            })}
                          </p>
                          <p className="text-sm text-gray-600">
                            {presence.heureDebut} - {presence.heureFin}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Statut */}
                      <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(presence.statut)}`}>
                        {getStatusLabel(presence.statut)}
                      </span>

                      {/* Justification */}
                      {presence.statut !== 'present' && (
                        <div className="text-right">
                          {presence.justifie ? (
                            <div>
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                Justifié
                              </span>
                              {presence.motifJustification && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {presence.motifJustification}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                              Non justifié
                            </span>
                          )}
                        </div>
                      )}

                      {/* Commentaire */}
                      {presence.commentaire && (
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-600" title={presence.commentaire}>
                            💬 {presence.commentaire}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune présence enregistrée pour ce mois</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PresencesEleve;