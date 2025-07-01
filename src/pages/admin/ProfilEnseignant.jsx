import {
    ArrowLeft,
    BookOpen,
    Calendar,
    Clock,
    Mail,
    MapPin,
    Phone,
    School,
    User as UserIcon,
    Users
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
    classes,
    emploisDuTemps,
    enseignants,
    matieres,
} from "../../data/donneesTemporaires";

const ProfilEnseignant = () => {
  const { enseignantId } = useParams();
  const navigate = useNavigate();

  const profilEnseignant = useMemo(() => {
    return enseignants.find((e) => e.id === parseInt(enseignantId));
  }, [enseignants, enseignantId]);

  const emploiDuTempsEnseignant = useMemo(() => {
    return emploisDuTemps.filter(
      (edt) => edt.enseignantId === parseInt(enseignantId)
    );
  }, [emploisDuTemps, enseignantId]);

  const getNomMatiere = (matiereId) => {
    const matiere = matieres.find((m) => m.id === matiereId);
    return matiere ? matiere.nom : "Matière inconnue";
  };

  const getNomClasse = (classeId) => {
    const classe = classes.find((c) => c.id === classeId);
    return classe ? classe.nom : "Classe inconnue";
  };

  const LigneDetail = ({ icon: Icon, label, value }) => (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
      {Icon && <Icon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />}
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800 break-words">
          {value}
        </p>
      </div>
    </div>
  );

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const heures = [
    '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00','16:00-18:00'
  ];

  const mesCoursParJourHeure = (jour, heure) => {
    const cours = emploiDuTempsEnseignant.find(
      e => e.jour === jour && e.heure === heure
    );

    if (!cours) return null;

    const matiere = matieres.find(m => m.id === cours.matiereId);
    const classe = classes.find(c => c.id === cours.classeId);

    return {
      matiereNom: matiere?.nom || 'Matière inconnue',
      matiereCode: matiere?.code || 'XX',
      matiereCouleur: matiere?.couleur || '#60A5FA',
      classeNom: classe?.nom || 'Classe inconnue',
      salle: cours.salle || 'N/A'
    };
  };

  if (!profilEnseignant) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Card className="p-10 text-center shadow-lg rounded-xl border border-gray-200 bg-white">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Enseignant non trouvé
            </h3>
            <p className="text-sm text-gray-600">
              L'ID de l'enseignant spécifié dans l'URL ne correspond à aucun enseignant.
              Veuillez vérifier l'adresse ou la disponibilité des données.
            </p>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              icon={ArrowLeft}
              className="mt-6"
            >
              Retour
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              icon={ArrowLeft}
              className="mb-2"
            >
              Retour
            </Button>
            <h2 className="text-xl font-bold text-gray-900">Profil de: {profilEnseignant.prenom} {profilEnseignant.nom}</h2>
            <p className="text-gray-600">Informations détaillées sur {profilEnseignant.prenom} {profilEnseignant.nom}.</p>
          </div>
        </div>

        {/* Infos enseignant */}
        <Card className="p-6 shadow-xl border border-gray-200 rounded-2xl bg-white">
          <div className="flex items-center space-x-5 pb-4 mb-4 border-b border-gray-200">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold uppercase flex-shrink-0">
              {profilEnseignant.prenom.charAt(0)}
              {profilEnseignant.nom.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {profilEnseignant.prenom} {profilEnseignant.nom}
              </h3>
              <p className="text-md text-gray-600">Enseignant</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <LigneDetail icon={Mail} label="Email" value={profilEnseignant.email} />
            <LigneDetail icon={Phone} label="Téléphone" value={profilEnseignant.telephone || "N/A"} />
            <LigneDetail
              icon={BookOpen}
              label="Matière(s) enseignée(s)"
              value={profilEnseignant.matieres
                .map((id) => getNomMatiere(id))
                .join(", ") || "Aucune"}
            />
            <LigneDetail
              icon={School}
              label="Classe(s) assignée(s)"
              value={profilEnseignant.classes
                .map((id) => getNomClasse(id))
                .join(", ") || "Aucune"}
            />
          </div>
        </Card>

        {/* Emploi du temps de l'enseignant */}
        <Card className="p-0 overflow-x-auto shadow-xl border border-gray-200 rounded-2xl bg-white">
          <div className="p-6 mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              Emploi du temps
            </h2>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 border-b border-gray-200">
                  Heures
                </th>
                {jours.map(jour => (
                  <th key={jour} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    {jour}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {heures.map(heure => (
                <tr key={heure}>
                  <td className="px-6 py-4 bg-gray-50 border-r border-gray-200 text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                      {heure}
                    </div>
                  </td>
                  {jours.map(jour => {
                    const cours = mesCoursParJourHeure(jour, heure);
                    return (
                      <td key={`${jour}-${heure}`} className="px-2 py-3 border border-gray-200 h-28 align-top">
                        {cours ? (
                          <div
                            className="h-full rounded-lg p-2 text-xs cursor-pointer hover:opacity-90 transition-opacity flex flex-col justify-between items-center text-center"
                            style={{ backgroundColor: 'rgb(220 238 255)', color: '#2563eb' }}
                          >
                            <div className="font-bold text-sm mb-1">{cours.matiereNom}</div>
                            <div className="text-xs opacity-90 mb-1">{cours.matiereCode}</div>
                            <div className="flex items-center text-xs opacity-90 mb-1">
                              <Users className="w-3 h-3 mr-1 text-blue-600" />
                              <span>{cours.classeNom}</span>
                            </div>
                            <div className="flex items-center text-xs opacity-90">
                              <MapPin className="w-3 h-3 mr-1 text-blue-600" />
                              <span>{cours.salle}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-400 text-xs">Libre</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

export default ProfilEnseignant;