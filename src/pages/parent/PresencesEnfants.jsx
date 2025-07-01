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
import Slider from 'react-slick'; // Réintroduit Slider
import 'slick-carousel/slick/slick-theme.css'; // S'assurer que les styles sont présents
import 'slick-carousel/slick/slick.css'; // S'assurer que les styles sont présents
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { classes, eleves, presences } from '../../data/donneesTemporaires';

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

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'present':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'absent':
        return <XCircle className="w-3 h-3 text-red-500" />;
      case 'retard':
        return <Clock className="w-3 h-3 text-orange-500" />;
      case 'renvoye':
        return <UserX className="w-3 h-3 text-purple-500" />;
      default:
        return <AlertCircle className="w-3 h-3 text-gray-400" />;
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

  const openDetailsModal = (presence) => {
    setSelectedPresenceDetails(presence);
    setIsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsModalOpen(false);
    setSelectedPresenceDetails(null);
  };

  const getStats = () => {
    const total = presencesEnfant.length;
    const absents = presencesEnfant.filter((p) => p.statut === 'absent').length;
    const retards = presencesEnfant.filter((p) => p.statut === 'retard').length;
    const renvoyes = presencesEnfant.filter((p) => p.statut === 'renvoi').length; // Correction pour 'renvoyes'
    const justifies = presencesEnfant.filter(
      (p) => p.justifie && (p.statut === 'absent' || p.statut === 'retard' || p.statut === 'renvoi') // Correction pour 'renvoyes'
    ).length;

    return { total, absents, retards, renvoyes, justifies,  };
  };

  const stats = getStats();

  const statItems = [
    {
      icon: Calendar,
      value: stats.total,
      label: 'Total',
      color: 'text-blue-700',
      bg: 'bg-blue-100',
      borderColor: 'border-blue-500',
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
      label: 'Non Justif.',
      color: 'text-rose-700',
      bg: 'bg-rose-100',
      borderColor: 'border-rose-500',
    },
  ];

  const sliderSettings = {
    dots: false,
    infinite: true,
    autoplay:true,
    autoplaySpeed:3000,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 4 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1, arrows: false } },
    ],
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen py-4">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 space-y-6">

        <header className="text-center mb-4">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1 leading-tight">
            Suivi des Présences Enfants
          </h1>
          <p className="text-sm text-gray-700 max-w-xl mx-auto">
            Historique et statistiques d'assiduité scolaire.
          </p>
        </header>

        {mesEnfants.length > 0 ? (
          <>
            <Card className="shadow-lg rounded-xl border border-blue-200 bg-white p-5">
              <label htmlFor="child-select" className="block text-sm font-semibold text-gray-800 mb-2">
                Sélectionner un enfant :
              </label>
              <div className="relative">
                <select
                  id="child-select"
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-gray-800 text-sm appearance-none transition duration-200 ease-in-out bg-white pr-9"
                >
                  <option value="">-- Choisir un enfant --</option>
                  {mesEnfants.map((enfant) => (
                    <option key={enfant.id} value={enfant.id}>
                      {enfant.prenom} {enfant.nom} - {getClassName(enfant.classeId)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </Card>

            {selectedChild ? (
              <>
                {/* --- Global Statistics Slider --- */}
                <h2 className="text-lg font-bold text-gray-800 pt-3 pb-2">Statistiques Clés</h2>
                <div className="relative -mx-3">
                  <Slider {...sliderSettings}>
                    {statItems.map((item, idx) => (
                      <div key={idx} className="px-2">
                        <Card className={`p-4 text-center shadow-md rounded-lg border-b-4 ${item.borderColor} bg-white h-full flex flex-col justify-center`}>
                          <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${item.bg}`}>
                            <item.icon className={`w-6 h-6 ${item.color}`} />
                          </div>
                          <p className={`text-2xl font-extrabold ${item.color} mb-0.5`}>{item.value}</p>
                          <p className="text-xs text-gray-600">{item.label}</p>
                        </Card>
                      </div>
                    ))}
                  </Slider>
                </div>

                <h2 className="text-lg font-bold text-gray-800 pt-3 pb-2">Informations Détaillées</h2>
                <Card className="shadow-lg rounded-xl border border-blue-200 bg-white p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-700">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Nom Complet</p>
                      <p className="text-base font-semibold text-gray-900">{getChildName(selectedChild)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Classe Actuelle</p>
                      <p className="text-base font-semibold text-gray-900">
                        {getClassName(mesEnfants.find((e) => e.id === parseInt(selectedChild))?.classeId)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Justifiées (Total)</p>
                      <p className="text-base font-semibold text-green-600">{stats.justifies}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Non Justifiées (Total)</p>
                      <p className="text-base font-semibold text-red-600">
                        {stats.absents + stats.retards + stats.renvoyes - stats.justifies}
                      </p>
                    </div>
                  </div>
                </Card>

                <h2 className="text-lg font-bold text-gray-800 pt-3 pb-2">Historique Complet des Présences</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {presencesEnfant.length > 0 ? (
                    presencesEnfant
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((presence) => (
                        <Card
                          key={presence.id}
                          className="p-4 flex flex-col justify-between shadow-md rounded-lg border border-gray-100 bg-white hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
                        >
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              {getStatusIcon(presence.statut)}
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(presence.statut)}`}>
                                {getStatusLabel(presence.statut)}
                              </span>
                            </div>
                            <p className="text-base text-gray-900 font-bold mb-1">
                              {new Date(presence.date).toLocaleDateString('fr-FR', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-gray-600 mb-1">
                              De: {presence.heureDebut || 'N/A'} - À: {presence.heureFin || 'N/A'}
                            </p>
                            {(presence.statut === 'absent' || presence.statut === 'retard' || presence.statut === 'renvoyes') && ( // Correction pour 'renvoyes'
                              <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${presence.justifie ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {presence.justifie ? 'Justifié' : 'Non Justifié'}
                              </span>
                            )}
                          </div>
                          <div className="mt-3">
                            <Button size="sm" onClick={() => openDetailsModal(presence)} className="w-full text-xs font-medium">
                              Détails
                            </Button>
                          </div>
                        </Card>
                      ))
                  ) : (
                    <Card className="p-8 text-center col-span-full shadow-lg rounded-xl border border-gray-200 bg-white">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-base text-gray-600 font-medium">Aucune présence enregistrée pour cet enfant.</p>
                    </Card>
                  )}
                </div>

                <Modal isOpen={isModalOpen} onClose={closeDetailsModal} title={`Détails présence ${getChildName(selectedChild).split(' ')[0]}`} size="sm">
                  {selectedPresenceDetails && (
                    <div className="space-y-3 text-gray-700 p-2">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-50 p-3 rounded-md">
                        <div>
                          <p className="text-sm font-semibold text-gray-800 mb-0.5">Date:</p>
                          <p className="text-base font-bold text-blue-800">
                            {new Date(selectedPresenceDetails.date).toLocaleDateString('fr-FR', {
                              weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </p>
                        </div>
                        <span className={`mt-1 sm:mt-0 px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPresenceDetails.statut)}`}>
                          {getStatusLabel(selectedPresenceDetails.statut)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">Période:</p>
                          <p className="text-gray-700 text-xs">{selectedPresenceDetails.heureDebut || 'N/A'} - {selectedPresenceDetails.heureFin || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="font-semibold text-gray-800 text-sm">Enseignant:</p>
                           {/* Note: The 'enseignantId' in 'presences' data is just an ID. You'd need to fetch the teacher's name from 'enseignants' data */}
                           <p className="text-gray-700 text-xs">{selectedPresenceDetails.enseignantId ? `ID: ${selectedPresenceDetails.enseignantId}` : 'Non défini'}</p>
                        </div>
                      </div>

                      {(selectedPresenceDetails.statut === 'absent' || selectedPresenceDetails.statut === 'retard' || selectedPresenceDetails.statut === 'renvoyes') && ( // Correction pour 'renvoyes'
                        <div className="bg-gray-100 p-3 rounded-lg border border-gray-200">
                          <p className="font-semibold text-gray-800 text-sm mb-1">Justification:</p>
                          <p className="text-sm">
                            {selectedPresenceDetails.justifie ? (
                              <span className="text-green-600 flex items-center"><CheckCircle className="w-3 h-3 mr-1" />Oui</span>
                            ) : (
                              <span className="text-red-600 flex items-center"><XCircle className="w-3 h-3 mr-1" />Non</span>
                            )}
                          </p>
                          {selectedPresenceDetails.justifie && selectedPresenceDetails.motifJustification && (
                            <div className="mt-1">
                              <p className="font-semibold text-gray-800 text-xs">Motif:</p>
                              <p className="text-gray-700 italic text-xs">{selectedPresenceDetails.motifJustification}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedPresenceDetails.commentaire && (
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">Commentaire (Admin):</p>
                          <p className="text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-200 text-xs">
                            {selectedPresenceDetails.commentaire}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-end pt-3">
                        <Button onClick={closeDetailsModal} variant="outline" className="px-4 py-1 text-sm">Fermer</Button>
                      </div>
                    </div>
                  )}
                </Modal>
              </>
            ) : (
              // --- Prompt to select a child ---
              <Card className="p-8 text-center shadow-lg rounded-xl border border-gray-200 bg-white">
                <User className="w-14 h-14 text-indigo-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Sélectionnez un enfant</h3>
                <p className="text-sm text-gray-600">
                  Choisissez un élève pour voir son historique.
                </p>
              </Card>
            )}
          </>
        ) : (
          // --- No children found message ---
          <Card className="p-8 text-center shadow-lg rounded-xl border border-gray-200 bg-white">
            <User className="w-14 h-14 text-gray-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun enfant trouvé</h3>
            <p className="text-sm text-gray-600">
              Contactez l'administration pour associer des élèves.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PresencesEnfants;