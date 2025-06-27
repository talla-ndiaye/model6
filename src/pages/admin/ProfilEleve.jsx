import {
    AlertCircle,
    BookOpen,
    CalendarDays, // For presence status
    Clock,
    CreditCard,
    Home,
    Mail,
    Phone,
    User as UserIcon, // For presence status
    UserX // For presence status
    , // For presence status
    XCircle
} from 'lucide-react';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
// Removed Recharts imports as graphs are removed
// Removed useAuth as this page views any student by ID

import {
    presences as allPresencesData,
    classes,
    eleves,
    enseignants,
    matieres,
    notes,
    paiements, // Import presence data
    utilisateurs // Import utilisateurs to get parent info
} from '../../data/donneesTemporaires';

const ProfilEleve = () => {
  const { eleveId } = useParams(); // Get eleveId from URL parameters

  // Find the student's details based on the URL ID
  const eleveProfile = useMemo(() => {
    return eleves.find(e => e.id === parseInt(eleveId));
  }, [eleves, eleveId]);

  // Get filtered data for this specific student
  const studentPayments = useMemo(() => { // Renamed from mesPaiements
    return eleveProfile ? paiements.filter(p => p.eleveId === eleveProfile.id) : [];
  }, [eleveProfile, paiements]);

  const studentNotes = useMemo(() => { // Renamed from mesNotes
    return eleveProfile ? notes.filter(n => n.eleveId === eleveProfile.id) : [];
  }, [eleveProfile, notes]);

  const studentPresences = useMemo(() => { // New: Get student's presence data
    return eleveProfile ? allPresencesData.filter(p => p.eleveId === eleveProfile.id && p.statut !== 'present') : []; // Filter out 'present' status
  }, [eleveProfile, allPresencesData]);


  // --- Helper Functions ---
  const getClassName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nom : 'Non assigné';
  };

  const getMatiereName = (matiereId) => {
    const matiere = matieres.find(m => m.id === matiereId);
    return matiere ? matiere.nom : 'Matière inconnue';
  };

  const getSexeLabel = (sexeCode) => {
    return sexeCode === 'M' ? 'Masculin' : sexeCode === 'F' ? 'Féminin' : 'Non spécifié';
  };

  const getEnseignantName = (enseignantId) => {
    const enseignant = enseignants.find(e => e.id === enseignantId);
    return enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Non défini';
  };

  const getPresenceStatusIcon = (statut) => { // New: Helper for presence status icons
    switch (statut) {
      case 'absent':  return <XCircle className="w-4 h-4 text-red-500" />;
      case 'retard':  return <Clock className="w-4 h-4 text-orange-500" />;
      case 'renvoye': return <UserX className="w-4 h-4 text-purple-500" />;
      default:        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPresenceStatusLabel = (statut) => { // New: Helper for presence status labels
    switch (statut) {
      case 'absent':  return 'Absent';
      case 'retard':  return 'En retard';
      case 'renvoye': return 'Renvoyé';
      default:        return 'Statut inconnu';
    }
  };

  const getPresenceStatusColor = (statut) => { // New: Helper for presence status colors
    switch (statut) {
      case 'absent':  return 'bg-red-100 text-red-800';
      case 'retard':  return 'bg-orange-100 text-orange-800';
      case 'renvoye': return 'bg-purple-100 text-purple-800';
      default:        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper to get parent info
  const getParentInfo = (parentId) => {
    return utilisateurs.find(user => user.id === parentId && user.role === 'parent');
  };


  // --- Helper Component for Detail Rows ---
  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
      {Icon && <Icon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />}
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
      </div>
    </div>
  );

  // --- Error Handling: Student Not Found ---
  if (!eleveProfile) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Card className="p-10 text-center shadow-lg rounded-xl border border-gray-200 bg-white">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Élève non trouvé</h3>
            <p className="text-sm text-gray-600">
              L'ID de l'élève spécifié dans l'URL ne correspond à aucun élève.
              Veuillez vérifier l'adresse ou la disponibilité des données.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header Section */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Profil de {eleveProfile.prenom} {eleveProfile.nom}
          </h1>
          <p className="text-lg text-gray-600">
            Informations complètes, paiements, notes et assiduité.
          </p>
        </header>

        {/* Student Personal Info Card */}
        <Card className="p-6 shadow-xl border border-gray-200 rounded-2xl bg-white">
          <div className="flex items-center space-x-5 pb-4 mb-4 border-b border-gray-200">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold uppercase flex-shrink-0">
              {eleveProfile.prenom.charAt(0)}{eleveProfile.nom.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {eleveProfile.prenom} {eleveProfile.nom}
              </h3>
              <p className="text-md text-gray-600">{getClassName(eleveProfile.classeId)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailRow
              icon={CalendarDays}
              label="Date de naissance"
              value={new Date(eleveProfile.dateNaissance).toLocaleDateString('fr-FR')}
            />
            <DetailRow
              icon={BookOpen}
              label="Classe"
              value={getClassName(eleveProfile.classeId)}
            />
            <DetailRow
              icon={UserIcon}
              label="Sexe"
              value={getSexeLabel(eleveProfile.sexe)}
            />
            <DetailRow
              icon={Mail}
              label="Email"
              value={eleveProfile.email}
            />
            <DetailRow
              icon={Phone}
              label="Téléphone"
              value={eleveProfile.telephone || 'N/A'}
            />
            <DetailRow
              icon={Home}
              label="Adresse"
              value={eleveProfile.adresse || 'N/A'}
            />
          </div>
        </Card>

        {/* Parents Information Card (NEW SECTION) */}
        <Card className="p-6 shadow-xl border border-gray-200 rounded-2xl bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <UserIcon className="w-6 h-6 mr-2 text-indigo-600" /> Informations des Parents
          </h2>
          {eleveProfile.parentIds && eleveProfile.parentIds.length > 0 ? (
            <div className="space-y-4">
              {eleveProfile.parentIds.map(parentId => {
                const parent = getParentInfo(parentId);
                return parent ? (
                  <div key={parentId} className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <DetailRow icon={UserIcon} label="Nom Complet" value={`${parent.prenom} ${parent.nom}`} />
                    <DetailRow icon={Phone} label="Téléphone" value={parent.telephone || 'N/A'} />
                    <DetailRow icon={Mail} label="Email" value={parent.email || 'N/A'} />
                  </div>
                ) : null;
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center p-4">Aucun parent associé à cet élève.</p>
          )}
        </Card>


        {/* Payments History Card */}
        <Card className="p-6 shadow-xl border border-gray-200 rounded-2xl bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-6 h-6 mr-2 text-purple-600" /> Historique des Paiements
          </h2>
          {studentPayments.length > 0 ? (
            <div className="space-y-3">
              {studentPayments.sort((a, b) => new Date(b.date) - new Date(a.date)).map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                  <div>
                    <p className="font-semibold text-gray-800">{p.type} - {p.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
                    <p className="text-xs text-gray-600">Date: {new Date(p.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    p.statut === 'Payé' ? 'bg-green-100 text-green-800' :
                    p.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {p.statut}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center p-4">Aucun historique de paiement disponible pour cet élève.</p>
          )}
        </Card>

        {/* Notes History Card (Removed evolution graph) */}
        <Card className="p-6 shadow-xl border border-gray-200 rounded-2xl bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-orange-600" /> Historique des Notes
          </h2>
          {studentNotes.length > 0 ? (
            <div className="space-y-3">
              {studentNotes.sort((a,b) => new Date(b.date) - new Date(a.date)).map(note => (
                <div key={note.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                  <div>
                    <p className="font-semibold text-gray-800">{getMatiereName(note.matiereId)} - {note.type}</p>
                    <p className="text-xs text-gray-600">Date: {new Date(note.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className={`font-bold text-lg ${note.note >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                    {note.note}/20
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center p-4">Aucune note enregistrée pour cet élève.</p>
          )}
        </Card>

        {/* Absences & Retards History Card */}
        <Card className="p-6 shadow-xl border border-gray-200 rounded-2xl bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <UserX className="w-6 h-6 mr-2 text-red-600" /> Absences & Retards
          </h2>
          {studentPresences.length > 0 ? (
            <div className="space-y-3">
              {studentPresences.sort((a,b) => new Date(b.date) - new Date(a.date)).map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                  <div className="flex items-center space-x-2">
                    {getPresenceStatusIcon(p.statut)}
                    <div>
                      <p className="font-semibold text-gray-800">{getPresenceStatusLabel(p.statut)} - {new Date(p.date).toLocaleDateString('fr-FR')}</p>
                      <p className="text-xs text-gray-600">{p.heureDebut || 'N/A'} - {p.heureFin || 'N/A'} {p.heureArrivee ? `(Arrivée: ${p.heureArrivee})` : ''}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${p.justifie ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {p.justifie ? 'Justifié' : 'Non justifié'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center p-4">Aucune absence ou retard enregistré pour cet élève.</p>
          )}
        </Card>

      </div>
    </div>
  );
};

export default ProfilEleve;