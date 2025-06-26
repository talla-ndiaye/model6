import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  User,
  UserX,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import Slider from 'react-slick'; // Retained Slider for stats display
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { presences as allPresencesData, classes, eleves, enseignants } from '../../data/donneesTemporaires';
// Ensure slick-carousel styles are correctly imported in your project's main CSS or here
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';

const MesPresencesEleve = () => {
  const { user } = useAuth();

  // Find the logged-in student's details
  // Note: For a real app, ensure user.id or user.email consistently identifies the student.
  const eleveConnecte = eleves.find(e => e.id === user?.id || e.email === user?.email);

  // Get all presence records for the connected student
  const mesPresences = eleveConnecte ? allPresencesData.filter(p => p.eleveId === eleveConnecte.id) : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPresenceDetails, setSelectedPresenceDetails] = useState(null);

  // --- Helper Functions for UI elements and data display ---
  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'present': return <CheckCircle className="w-4 h-4 text-green-500" />; // Slightly larger icon for better visibility
      case 'absent':  return <XCircle className="w-4 h-4 text-red-500" />;
      case 'retard':  return <Clock className="w-4 h-4 text-orange-500" />;
      case 'renvoye': return <UserX className="w-4 h-4 text-purple-500" />;
      default:        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'present': return 'Présent';
      case 'absent':  return 'Absent';
      case 'retard':  return 'En retard';
      case 'renvoye': return 'Renvoyé';
      default:        return 'Non défini';
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent':  return 'bg-red-100 text-red-800';
      case 'retard':  return 'bg-orange-100 text-orange-800';
      case 'renvoye': return 'bg-purple-100 text-purple-800';
      default:        return 'bg-gray-100 text-gray-800';
    }
  };

  const getClassName = (classeId) => {
    const classe = classes.find((c) => c.id === classeId);
    return classe ? classe.nom : 'Classe inconnue';
  };

  const getEnseignantName = (enseignantId) => {
    const enseignant = enseignants.find(e => e.id === enseignantId);
    return enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Non défini';
  };

  // --- Modal Functions ---
  const openDetailsModal = (presence) => {
    setSelectedPresenceDetails(presence);
    setIsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsModalOpen(false);
    setSelectedPresenceDetails(null);
  };

  // --- Statistics Calculation for the logged-in student ---
  const stats = (() => { // Immediately invoked function to calculate stats
    const total = mesPresences.length;
    const presents = mesPresences.filter((p) => p.statut === 'present').length;
    const absents = mesPresences.filter((p) => p.statut === 'absent').length;
    const retards = mesPresences.filter((p) => p.statut === 'retard').length;
    const renvoyes = mesPresences.filter((p) => p.statut === 'renvoye').length;
    const justifies = mesPresences.filter(
      (p) => p.justifie && (p.statut === 'absent' || p.statut === 'retard' || p.statut === 'renvoye')
    ).length;
    const tauxPresence = total > 0 ? ((presents / total) * 100).toFixed(1) : 0;

    return { total, presents, absents, retards, renvoyes, justifies, tauxPresence };
  })();

  // --- Data for Statistics Display (Slider) ---
  const statItems = [
    { icon: Calendar, value: stats.total, label: 'Jours Enr.', color: 'text-blue-700', bg: 'bg-blue-100', borderColor: 'border-blue-500' },
    { icon: CheckCircle, value: stats.presents, label: 'Présences', color: 'text-green-700', bg: 'bg-green-100', borderColor: 'border-green-500' },
    { icon: XCircle, value: stats.absents, label: 'Absences', color: 'text-red-700', bg: 'bg-red-100', borderColor: 'border-red-500' },
    { icon: Clock, value: stats.retards, label: 'Retards', color: 'text-orange-700', bg: 'bg-orange-100', borderColor: 'border-orange-500' },
    { icon: UserX, value: stats.renvoyes, label: 'Renvoyés', color: 'text-purple-700', bg: 'bg-purple-100', borderColor: 'border-purple-500' },
    { icon: AlertCircle, value: `${stats.tauxPresence}%`, label: "Taux d'Assid.", color: 'text-indigo-700', bg: 'bg-indigo-100', borderColor: 'border-indigo-500' },
    { icon: CheckCircle, value: stats.justifies, label: 'Justifiés', color: 'text-teal-700', bg: 'bg-teal-100', borderColor: 'border-teal-500' },
    { icon: XCircle, value: stats.absents + stats.retards + stats.renvoyes - stats.justifies, label: 'Non Justif.', color: 'text-rose-700', bg: 'bg-rose-100', borderColor: 'border-rose-500' },
  ];

  // --- Slider Settings (adjusted for better appearance) ---
  const sliderSettings = {
    dots: true, // Re-enabled dots for navigation feedback
    infinite: false,
    speed: 500,
    slidesToShow: 3, // Display 3 items by default
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false } }, // Remove arrows on smaller tablets
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false } }, // Remove arrows on mobile
    ],
  };

  // --- Render Logic: Handles student not found scenario ---
  if (!eleveConnecte) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Card className="p-10 text-center shadow-lg rounded-xl border border-gray-200 bg-white">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Profil élève non trouvé</h3>
            <p className="text-base text-gray-600">
              Impossible de récupérer vos informations. Veuillez vérifier que votre profil est correctement lié à votre compte.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // --- Main Render: Displaying student's presence info ---
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen py-8"> {/* Increased overall padding */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8"> {/* Increased overall spacing */}

        {/* --- Page Header --- */}
        <header className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
            Mon Assiduité
          </h1>
          <p className="text-lg text-gray-700 max-w-xl mx-auto">
            Statistiques et historique de vos présences en classe, {eleveConnecte.prenom} {eleveConnecte.nom} (Classe {getClassName(eleveConnecte.classeId)}).
          </p>
        </header>

        {/* --- Global Statistics Display (Slider) --- */}
        <h2 className="text-xl font-bold text-gray-800 pt-4 pb-3">Vue d'ensemble de mon assiduité</h2>
        <div className="relative -mx-2"> {/* Adjust for slider's internal padding */}
          <Slider {...sliderSettings}>
            {statItems.map((item, idx) => (
              <div key={idx} className="px-2"> {/* Inner padding for spacing between slides */}
                <Card className={`p-5 text-center shadow-lg rounded-xl border-b-4 ${item.borderColor} bg-white h-full flex flex-col justify-center`}> {/* Slightly increased padding */}
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${item.bg}`}>
                    <item.icon className={`w-7 h-7 ${item.color}`} /> {/* Slightly larger icons */}
                  </div>
                  <p className={`text-3xl font-extrabold ${item.color} mb-1`}>{item.value}</p> {/* Larger, bolder value */}
                  <p className="text-sm text-gray-600">{item.label}</p>
                </Card>
              </div>
            ))}
          </Slider>
        </div>

        {/* --- My Information Card --- */}
        <h2 className="text-xl font-bold text-gray-800 pt-4 pb-3">Mes Informations Détaillées</h2>
        <Card className="shadow-lg rounded-xl border border-blue-200 bg-white p-6"> {/* Increased padding */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-gray-700"> {/* Increased gap */}
            <div>
              <p className="text-sm font-medium text-gray-600">Nom Complet</p>
              <p className="text-base font-semibold text-gray-900">{eleveConnecte.prenom} {eleveConnecte.nom}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Classe Actuelle</p>
              <p className="text-base font-semibold text-gray-900">
                {getClassName(eleveConnecte.classeId)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Justifiées (Total)</p>
              <p className="text-base font-semibold text-green-600">{stats.justifies}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Non Justifiées (Total)</p>
              <p className="text-base font-semibold text-red-600">
                {stats.absents + stats.retards + stats.renvoyes - stats.justifies}
              </p>
            </div>
          </div>
        </Card>

        {/* --- My Presence History Cards --- */}
        <h2 className="text-xl font-bold text-gray-800 pt-4 pb-3">Mon Historique Complet des Présences</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mesPresences.length > 0 ? (
            mesPresences
              .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date descending
              .map((presence) => (
                <Card
                  key={presence.id}
                  className="p-5 flex flex-col justify-between shadow-lg rounded-xl border border-gray-100 bg-white hover:shadow-xl transform hover:-translate-y-1 transition duration-200"
                > {/* More prominent hover effect */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3"> {/* Increased spacing */}
                      {getStatusIcon(presence.statut)}
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(presence.statut)}`}>
                        {getStatusLabel(presence.statut)}
                      </span>
                    </div>
                    <p className="text-lg text-gray-900 font-bold mb-1"> {/* Larger date text */}
                      {new Date(presence.date).toLocaleDateString('fr-FR', {
                        weekday: 'long', // Full weekday name
                        day: 'numeric',
                        month: 'long', // Full month name
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      De: {presence.heureDebut || 'N/A'} - À: {presence.heureFin || 'N/A'}
                    </p>
                    {(presence.statut === 'absent' || presence.statut === 'retard' || presence.statut === 'renvoye') && (
                      <span className={`inline-block mt-1 px-2.5 py-1 text-xs font-medium rounded-full ${presence.justifie ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {presence.justifie ? 'Justifié' : 'Non Justifié'}
                      </span>
                    )}
                  </div>
                  <div className="mt-4"> {/* Increased margin */}
                    <Button onClick={() => openDetailsModal(presence)} className="w-full text-sm font-medium">
                      Voir les Détails
                    </Button>
                  </div>
                </Card>
              ))
          ) : (
            <Card className="p-10 text-center col-span-full shadow-lg rounded-xl border border-gray-200 bg-white">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 font-medium">Aucune présence enregistrée pour vous.</p>
            </Card>
          )}
        </div>

        {/* --- Details Modal --- */}
        <Modal isOpen={isModalOpen} onClose={closeDetailsModal} title={`Détails du ${new Date(selectedPresenceDetails?.date || '').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`} size="md">
          {selectedPresenceDetails && (
            <div className="space-y-4 text-gray-700 p-3"> {/* Slightly more padding */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-50 p-4 rounded-lg border border-blue-200"> {/* Increased padding, subtle border */}
                <div>
                  <p className="text-base font-semibold text-gray-800 mb-1">Date :</p>
                  <p className="text-lg font-bold text-blue-800">
                    {new Date(selectedPresenceDetails.date).toLocaleDateString('fr-FR', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', // Full date in modal
                    })}
                  </p>
                </div>
                <span className={`mt-2 sm:mt-0 px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(selectedPresenceDetails.statut)}`}>
                  {getStatusLabel(selectedPresenceDetails.statut)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {/* Increased gap */}
                <div>
                  <p className="font-semibold text-base text-gray-800">Période :</p>
                  <p className="text-sm text-gray-700">{selectedPresenceDetails.heureDebut || 'N/A'} - {selectedPresenceDetails.heureFin || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-base text-gray-800">Enseignant :</p>
                  <p className="text-sm text-gray-700">{getEnseignantName(selectedPresenceDetails.enseignantId)}</p>
                </div>
              </div>

              {['absent', 'retard', 'renvoye'].includes(selectedPresenceDetails.statut) && (
                <div className="bg-gray-100 p-4 rounded-lg border border-gray-200"> {/* Increased padding */}
                  <p className="font-semibold text-base text-gray-800 mb-2">Justification :</p>
                  <p className="text-base">
                    {selectedPresenceDetails.justifie ? (
                      <span className="text-green-600 flex items-center"><CheckCircle className="w-4 h-4 mr-1" />Oui</span>
                    ) : (
                      <span className="text-red-600 flex items-center"><XCircle className="w-4 h-4 mr-1" />Non</span>
                    )}
                  </p>
                  {selectedPresenceDetails.justifie && selectedPresenceDetails.motifJustification && (
                    <div className="mt-2">
                      <p className="font-semibold text-sm text-gray-800">Motif :</p>
                      <p className="text-sm italic text-gray-700">{selectedPresenceDetails.motifJustification}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedPresenceDetails.commentaire && (
                <div>
                  <p className="font-semibold text-base text-gray-800">Commentaire :</p>
                  <p className="bg-gray-50 p-3 rounded-md text-sm border border-gray-200">
                    {selectedPresenceDetails.commentaire}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={closeDetailsModal} variant="outline" className="px-5 py-2 text-base">Fermer</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MesPresencesEleve;