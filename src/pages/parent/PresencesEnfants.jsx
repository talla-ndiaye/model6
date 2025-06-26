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
import Slider from 'react-slick';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { classes, eleves, presences } from '../../data/donneesTemporaires';

// Import Slick carousel styles - assuming you have these set up globally or in your CSS
// import 'slick-carousel/slick/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';

const PresencesEnfants = () => {
  const { user } = useAuth();
  const mesEnfants = eleves.filter((eleve) =>
    eleve.parentIds?.includes(user.id)
  );

  const [selectedChild, setSelectedChild] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPresenceDetails, setSelectedPresenceDetails] = useState(null);

  const presencesEnfant = selectedChild
    ? presences.filter((p) => p.eleveId === parseInt(selectedChild))
    : [];

  // --- Helper Functions ---
  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'present':
        return <CheckCircle className="w-3 h-3 text-green-500" />; // Even smaller icon
      case 'absent':
        return <XCircle className="w-3 h-3 text-red-500" />; // Even smaller icon
      case 'retard':
        return <Clock className="w-3 h-3 text-orange-500" />; // Even smaller icon
      case 'renvoye':
        return <UserX className="w-3 h-3 text-purple-500" />; // Even smaller icon
      default:
        return <AlertCircle className="w-3 h-3 text-gray-400" />; // Even smaller icon
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
    const classe = classes.find((c) => c.id === classeId);
    return classe ? classe.nom : 'Classe inconnue';
  };

  const getChildName = (childId) => {
    const child = mesEnfants.find((e) => e.id === parseInt(childId));
    return child ? `${child.prenom} ${child.nom}` : '';
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

  // --- Statistics Calculation ---
  const getStats = () => {
    const total = presencesEnfant.length;
    const presents = presencesEnfant.filter((p) => p.statut === 'present').length;
    const absents = presencesEnfant.filter((p) => p.statut === 'absent').length;
    const retards = presencesEnfant.filter((p) => p.statut === 'retard').length;
    const renvoyes = presencesEnfant.filter((p) => p.statut === 'renvoye').length;
    const justifies = presencesEnfant.filter(
      (p) => p.justifie && (p.statut === 'absent' || p.statut === 'retard' || p.statut === 'renvoye')
    ).length;
    const tauxPresence = total > 0 ? ((presents / total) * 100).toFixed(1) : 0;

    return { total, presents, absents, retards, renvoyes, justifies, tauxPresence };
  };

  const stats = getStats();

  // --- Slider Settings for React-Slick ---
  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5, // Show more items on larger screens
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 4 } }, // lg
      { breakpoint: 1024, settings: { slidesToShow: 3 } }, // md
      { breakpoint: 768, settings: { slidesToShow: 2 } }, // sm
      { breakpoint: 640, settings: { slidesToShow: 1, arrows: false } }, // xs - no arrows
    ],
  };

  // --- Data for Statistics Slider ---
  const statItems = [
    {
      icon: Calendar,
      value: stats.total,
      label: 'Jours Enr.', // Shorter label
      color: 'text-blue-700',
      bg: 'bg-blue-100',
      borderColor: 'border-blue-500',
    },
    {
      icon: CheckCircle,
      value: stats.presents,
      label: 'Présences',
      color: 'text-green-700',
      bg: 'bg-green-100',
      borderColor: 'border-green-500',
    },
    {
      icon: XCircle,
      value: stats.absents,
      label: 'Absences',
      color: 'text-red-700',
      bg: 'bg-red-100',
      borderColor: 'border-red-500',
    },
    {
      icon: Clock,
      value: stats.retards,
      label: 'Retards',
      color: 'text-orange-700',
      bg: 'bg-orange-100',
      borderColor: 'border-orange-500',
    },
    {
      icon: UserX,
      value: stats.renvoyes,
      label: 'Renvoyés',
      color: 'text-purple-700',
      bg: 'bg-purple-100',
      borderColor: 'border-purple-500',
    },
    {
      icon: AlertCircle,
      value: `${stats.tauxPresence}%`,
      label: "Taux d'Assid.", // Shorter label
      color: 'text-indigo-700',
      bg: 'bg-indigo-100',
      borderColor: 'border-indigo-500',
    },
    {
      icon: CheckCircle,
      value: stats.justifies,
      label: 'Justifiés',
      color: 'text-teal-700',
      bg: 'bg-teal-100',
      borderColor: 'border-teal-500',
    },
    {
      icon: XCircle,
      value: stats.absents + stats.retards + stats.renvoyes - stats.justifies,
      label: 'Non Justif.', // Shorter label
      color: 'text-rose-700',
      bg: 'bg-rose-100',
      borderColor: 'border-rose-500',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen py-4"> {/* Further reduced py */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 space-y-6"> {/* Reduced overall spacing, px */}

        {/* --- Page Header --- */}
        <header className="text-center mb-4"> {/* Reduced margin-bottom */}
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1 leading-tight"> {/* Smaller text */}
            Suivi des Présences Enfants
          </h1>
          <p className="text-sm text-gray-700 max-w-xl mx-auto"> {/* Smaller text */}
            Historique et statistiques d'assiduité scolaire.
          </p>
        </header>

        {/* --- Child Selection Card --- */}
        {mesEnfants.length > 0 ? (
          <>
            <Card className="shadow-lg rounded-xl border border-blue-200 bg-white p-5"> {/* Reduced padding */}
              <label htmlFor="child-select" className="block text-sm font-semibold text-gray-800 mb-2"> {/* Smaller text */}
                Sélectionner un enfant :
              </label>
              <div className="relative">
                <select
                  id="child-select"
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-gray-800 text-sm appearance-none transition duration-200 ease-in-out bg-white pr-9" // Smaller padding
                >
                  <option value="">-- Choisir un enfant --</option>
                  {mesEnfants.map((enfant) => (
                    <option key={enfant.id} value={enfant.id}>
                      {enfant.prenom} {enfant.nom} - {getClassName(enfant.classeId)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"> {/* Smaller padding */}
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </Card>

            {/* --- Content displayed after child selection --- */}
            {selectedChild ? (
              <>
                {/* --- Global Statistics Slider --- */}
                <h2 className="text-lg font-bold text-gray-800 pt-3 pb-2">Statistiques Clés</h2> {/* Smaller heading */}
                <div className="relative -mx-3">
                  <Slider {...sliderSettings}>
                    {statItems.map((item, idx) => (
                      <div key={idx} className="px-2"> {/* Padding for slide spacing */}
                        <Card className={`p-4 text-center shadow-md rounded-lg border-b-4 ${item.borderColor} bg-white h-full flex flex-col justify-center`}>
                          <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${item.bg}`}> {/* Smaller icon container, reduced mb */}
                            <item.icon className={`w-6 h-6 ${item.color}`} /> {/* Smaller icon */}
                          </div>
                          <p className={`text-2xl font-extrabold ${item.color} mb-0.5`}>{item.value}</p> {/* Smaller, bolder value */}
                          <p className="text-xs text-gray-600">{item.label}</p> {/* Smaller label */}
                        </Card>
                      </div>
                    ))}
                  </Slider>
                </div>

                {/* --- Child Information Card --- */}
                <h2 className="text-lg font-bold text-gray-800 pt-3 pb-2">Informations Détaillées</h2> {/* Smaller heading */}
                <Card className="shadow-lg rounded-xl border border-blue-200 bg-white p-5"> {/* Reduced padding */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-700"> {/* Reduced gap */}
                    <div>
                      <p className="text-xs font-medium text-gray-600">Nom Complet</p> {/* Smaller text */}
                      <p className="text-base font-semibold text-gray-900">{getChildName(selectedChild)}</p> {/* Smaller text */}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Classe Actuelle</p> {/* Smaller text */}
                      <p className="text-base font-semibold text-gray-900">
                        {getClassName(mesEnfants.find((e) => e.id === parseInt(selectedChild))?.classeId)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Justifiées (Total)</p> {/* Smaller text */}
                      <p className="text-base font-semibold text-green-600">{stats.justifies}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Non Justifiées (Total)</p> {/* Smaller text */}
                      <p className="text-base font-semibold text-red-600">
                        {stats.absents + stats.retards + stats.renvoyes - stats.justifies}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* --- Presence History Cards --- */}
                <h2 className="text-lg font-bold text-gray-800 pt-3 pb-2">Historique Complet des Présences</h2> {/* Smaller heading */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"> {/* Reduced gap */}
                  {presencesEnfant.length > 0 ? (
                    presencesEnfant
                      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date descending
                      .map((presence) => (
                        <Card
                          key={presence.id}
                          className="p-4 flex flex-col justify-between shadow-md rounded-lg border border-gray-100 bg-white hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200" // Reduced padding, rounded-lg
                        >
                          <div>
                            <div className="flex items-center space-x-2 mb-2"> {/* Reduced spacing */}
                              {getStatusIcon(presence.statut)}
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(presence.statut)}`}> {/* Smaller padding */}
                                {getStatusLabel(presence.statut)}
                              </span>
                            </div>
                            <p className="text-base text-gray-900 font-bold mb-1"> {/* Smaller text */}
                              {new Date(presence.date).toLocaleDateString('fr-FR', {
                                weekday: 'short', // Short weekday name
                                day: 'numeric',
                                month: 'short', // Short month name
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-gray-600 mb-1"> {/* Smaller text */}
                              De: {presence.heureDebut || 'N/A'} - À: {presence.heureFin || 'N/A'}
                            </p>
                            {(presence.statut === 'absent' || presence.statut === 'retard' || presence.statut === 'renvoye') && (
                              <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${presence.justifie ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}> {/* Smaller padding */}
                                {presence.justifie ? 'Justifié' : 'Non Justifié'}
                              </span>
                            )}
                          </div>
                          <div className="mt-3"> {/* Reduced top margin for button */}
                            <Button size="sm" onClick={() => openDetailsModal(presence)} className="w-full text-xs font-medium"> {/* Smaller button */}
                              Détails
                            </Button>
                          </div>
                        </Card>
                      ))
                  ) : (
                    <Card className="p-8 text-center col-span-full shadow-lg rounded-xl border border-gray-200 bg-white"> {/* Reduced padding */}
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" /> {/* Smaller icon */}
                      <p className="text-base text-gray-600 font-medium">Aucune présence enregistrée pour cet enfant.</p> {/* Smaller text */}
                    </Card>
                  )}
                </div>

                {/* --- Details Modal --- */}
                <Modal isOpen={isModalOpen} onClose={closeDetailsModal} title={`Détails présence ${getChildName(selectedChild).split(' ')[0]}`} size="sm"> {/* Smaller title, smaller modal */}
                  {selectedPresenceDetails && (
                    <div className="space-y-3 text-gray-700 p-2"> {/* Reduced spacing */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-50 p-3 rounded-md"> {/* Reduced padding */}
                        <div>
                          <p className="text-sm font-semibold text-gray-800 mb-0.5">Date:</p> {/* Smaller text */}
                          <p className="text-base font-bold text-blue-800"> {/* Smaller text */}
                            {new Date(selectedPresenceDetails.date).toLocaleDateString('fr-FR', {
                              weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', // Shorter date format
                            })}
                          </p>
                        </div>
                        <span className={`mt-1 sm:mt-0 px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPresenceDetails.statut)}`}> {/* Smaller padding */}
                          {getStatusLabel(selectedPresenceDetails.statut)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2"> {/* Reduced gap */}
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">Période:</p>
                          <p className="text-gray-700 text-xs">{selectedPresenceDetails.heureDebut || 'N/A'} - {selectedPresenceDetails.heureFin || 'N/A'}</p> {/* Smaller text */}
                        </div>
                        <div>
                           <p className="font-semibold text-gray-800 text-sm">Enseignant:</p>
                           <p className="text-gray-700 text-xs">{selectedPresenceDetails.enseignantId ? 'Nom de l\'enseignant ici' : 'Non défini'}</p> {/* Placeholder, smaller text */}
                        </div>
                      </div>

                      {(selectedPresenceDetails.statut === 'absent' || selectedPresenceDetails.statut === 'retard' || selectedPresenceDetails.statut === 'renvoye') && (
                        <div className="bg-gray-100 p-3 rounded-lg border border-gray-200"> {/* Reduced padding */}
                          <p className="font-semibold text-gray-800 text-sm mb-1">Justification:</p> {/* Smaller text */}
                          <p className="text-sm">
                            {selectedPresenceDetails.justifie ? (
                              <span className="text-green-600 flex items-center"><CheckCircle className="w-3 h-3 mr-1" />Oui</span> 
                            ) : (
                              <span className="text-red-600 flex items-center"><XCircle className="w-3 h-3 mr-1" />Non</span> 
                            )}
                          </p>
                          {selectedPresenceDetails.justifie && selectedPresenceDetails.motifJustification && (
                            <div className="mt-1"> {/* Reduced margin */}
                              <p className="font-semibold text-gray-800 text-xs">Motif:</p> {/* Smaller text */}
                              <p className="text-gray-700 italic text-xs">{selectedPresenceDetails.motifJustification}</p> {/* Smaller text */}
                            </div>
                          )}
                        </div>
                      )}

                      {selectedPresenceDetails.commentaire && (
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">Commentaire (Admin):</p> {/* Smaller text */}
                          <p className="text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-200 text-xs"> {/* Smaller text, padding */}
                            {selectedPresenceDetails.commentaire}
                          </p>
                        </div>
                      )}
                      <div className="flex justify-end pt-3"> {/* Reduced padding */}
                        <Button onClick={closeDetailsModal} variant="outline" className="px-4 py-1 text-sm">Fermer</Button> {/* Smaller button */}
                      </div>
                    </div>
                  )}
                </Modal>
              </>
            ) : (
              // --- Prompt to select a child ---
              <Card className="p-8 text-center shadow-lg rounded-xl border border-gray-200 bg-white"> {/* Reduced padding */}
                <User className="w-14 h-14 text-indigo-400 mx-auto mb-3" /> {/* Smaller icon */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">Sélectionnez un enfant</h3> {/* Smaller text */}
                <p className="text-sm text-gray-600"> {/* Smaller text */}
                  Choisissez un élève pour voir son historique.
                </p>
              </Card>
            )}
          </>
        ) : (
          // --- No children found message ---
          <Card className="p-8 text-center shadow-lg rounded-xl border border-gray-200 bg-white"> {/* Reduced padding */}
            <User className="w-14 h-14 text-gray-400 mx-auto mb-3" /> {/* Smaller icon */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun enfant trouvé</h3> {/* Smaller text */}
            <p className="text-sm text-gray-600"> {/* Smaller text */}
              Contactez l'administration pour associer des élèves.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PresencesEnfants;