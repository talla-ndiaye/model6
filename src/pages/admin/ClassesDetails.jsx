import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Mail,
  MapPin,
  Phone,
  School,
  User,
  Users
} from 'lucide-react';
import { useMemo } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import { classes, eleves, emploisDuTemps, enseignants, matieres } from '../../data/donneesTemporaires';


const LigneDetail = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
    {Icon && <Icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />}
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

const DetailsClasse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Correct: Call useAuth() inside the component

  const classe = useMemo(() => {
    return classes.find(c => c.id === parseInt(id));
  }, [id]);

  const elevesDansClasse = useMemo(() => {
    return eleves.filter(eleve => eleve.classeId === parseInt(id));
  }, [id]);

  const emploiDuTempsClasse = useMemo(() => {
    return emploisDuTemps.filter(edt => edt.classeId === parseInt(id));
  }, [emploisDuTemps, id]);

  const getNomEnseignant = (enseignantId) => {
    const enseignant = enseignants.find(e => e.id === enseignantId);
    return enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Non assigné';
  };

  const getNomMatiere = (matiereId) => {
    const matiere = matieres.find(m => m.id === matiereId);
    return matiere ? matiere.nom : 'Matière inconnue';
  };

  const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const plagesHoraires = [
    '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'
  ];

  const getCoursPourCreneau = (jour, heure) => {
    return emploiDuTempsClasse.find(
      edt => edt.jour === jour && edt.heure === heure
    );
  };

  const getNombreDeCreneaux = (heureSlot) => {
    return 1;
  };

  const creneauxDejaRendus = useMemo(() => {
    const rendus = new Set();
    emploiDuTempsClasse.forEach(cours => {
      const jourIndex = joursSemaine.indexOf(cours.jour);
      const heureIndexDebut = plagesHoraires.indexOf(cours.heure);
      if (jourIndex !== -1 && heureIndexDebut !== -1) {
        const nbCreneaux = getNombreDeCreneaux(cours.heure);
        for (let i = 0; i < nbCreneaux; i++) {
          if (i > 0) {
            rendus.add(`${jourIndex}-${heureIndexDebut + i}`);
          }
        }
      }
    });
    return rendus;
  }, [emploiDuTempsClasse, joursSemaine, plagesHoraires]);


  if (!classe) {
    return (
      <div className="text-center py-12 text-gray-500">
        <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold">Classe introuvable</h3>
        <p className="text-gray-400 text-sm mt-2">L'identifiant de la classe spécifié n'existe pas.</p>
        <Button onClick={() => navigate(-1)} className="mt-6" icon={ArrowLeft}>
          Retour
        </Button>
      </div>
    );
  }

  // Determine the base path for student profiles based on user role
  const getStudentProfilePath = (eleveId) => {
    // Only 'admin' and 'enseignant' roles are allowed to access student profiles from here.
    // 'parent' and 'eleve' roles might have their own restricted profile views or not need this navigation.
    // Adjust roles as per your application's access control logic.
    if (user?.role === 'admin' || user?.role === 'enseignant') {
      return `/admin/eleves/profil/${eleveId}`;
    }
    // For other roles, perhaps don't link or link to a generic view if it exists.
    // For now, if not admin/enseignant, it won't link.
    return '#'; // A placeholder, or you could navigate to a "permission denied" page
  };

  const colonnesEleves = [
    {
      header: 'Élève',
      accessor: 'nomComplet',
      render: (eleve) => (
        <div className="flex items-center">
          {/* Conditionally render NavLink based on user role */}
          {(user?.role === 'admin' || user?.role === 'enseignant') ? (
            <NavLink to={getStudentProfilePath(eleve.id)}>
              <User className="h-8 w-8 rounded-full object-cover shadow-sm mr-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {eleve.prenom} {eleve.nom}
                </div>
                <div className="text-xs text-gray-500">Matricule: {eleve.matricule}</div>
              </div>
            </NavLink>
          ) : (
            // If user role is not admin/enseignant, display text without link
            <>
              <User className="h-8 w-8 rounded-full object-cover shadow-sm mr-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {eleve.prenom} {eleve.nom}
                </div>
                <div className="text-xs text-gray-500">Matricule: {eleve.matricule}</div>
              </div>
            </>
          )}
        </div>
      ),
    },
    { header: 'Date de naissance', accessor: 'dateNaissance' },
    { header: 'Sexe', accessor: 'sexe' },
    {
      header: 'Contact',
      accessor: 'contact',
      render: (eleve) => (
        <>
          <div className="text-sm text-gray-900 flex items-center mb-1">
            <Phone className="h-4 w-4 mr-2 text-gray-600" />
            {eleve.telephone}
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            <Mail className="h-4 w-4 mr-2 text-gray-600" />
            {eleve.email}
          </div>
        </>
      ),
    },
  ];


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button onClick={() => navigate(-1)} variant="outline" icon={ArrowLeft} className="mb-4">
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Détails de la classe : {classe.nom}</h1>
          <p className="text-gray-600">Informations détaillées et liste des élèves pour cette classe.</p>
        </div>
      </div>

      {/* Informations sur la classe */}
      <Card className="p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Informations sur la classe</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <LigneDetail icon={School} label="Nom de la classe" value={classe.nom} />
          <LigneDetail icon={BookOpen} label="Niveau" value={classe.niveau} />
          <LigneDetail icon={User} label="Enseignant Principal" value={getNomEnseignant(classe.enseignantPrincipal)} />
          <LigneDetail icon={Users} label="Nombre d'élèves" value={classe.nombreEleves} />
          <LigneDetail icon={School} label="Salle de classe" value={classe.salle} />
        </div>
      </Card>

      {/* Emploi du temps de la classe */}
      <Card className="p-0 mt-8 overflow-x-auto shadow-sm">
        <div className="p-6 mb-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-green-600" /> Emploi du temps de la classe
          </h3>
        </div>
        
        {emploiDuTempsClasse.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 border-b border-gray-200">
                  Heures
                </th>
                {joursSemaine.map(jour => (
                  <th key={jour} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    {jour}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plagesHoraires.map((heure, heureIndex) => (
                <tr key={heure}>
                  <td className="px-6 py-4 bg-gray-50 border-r border-gray-200 text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                      {heure}
                    </div>
                  </td>
                  {joursSemaine.map((jour, jourIndex) => {
                    if (creneauxDejaRendus.has(`${jourIndex}-${heureIndex}`)) {
                      return null;
                    }

                    const cours = getCoursPourCreneau(jour, heure);
                    const nbCreneaux = cours ? getNombreDeCreneaux(cours.heure) : 1;

                    return (
                      <td 
                        key={`${jour}-${heureIndex}`}
                        rowSpan={nbCreneaux}
                        className={`px-2 py-3 border border-gray-200 h-28 align-top ${cours ? 'bg-blue-50 hover:bg-blue-100 transition-colors' : ''}`}
                      >
                        {cours ? (
                          <div
                            className="h-full rounded-lg p-2 text-xs flex flex-col justify-between items-center text-center"
                            style={{ backgroundColor: 'rgb(220 238 255)', color: '#2563eb' }}
                          >
                            <div className="font-bold text-sm mb-1">{getNomMatiere(cours.matiereId)}</div>
                            <div className="text-xs opacity-90 mb-1">{cours.heure}</div>
                            <div className="flex items-center text-xs opacity-90 mb-1">
                              <Users className="w-3 h-3 mr-1 text-blue-600" />
                              <span>{getNomEnseignant(cours.enseignantId)}</span>
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
        ) : (
          <p className="text-center text-gray-500 py-8">Aucun emploi du temps disponible pour cette classe.</p>
        )}
      </Card>


      {/* Liste des élèves de la classe */}
      <Card className="p-0 mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 px-6 pt-6">Élèves de la classe</h3>
        <Table
          columns={colonnesEleves}
          data={elevesDansClasse}
          noDataMessage={
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              Aucun élève trouvé dans cette classe pour le moment.
            </div>
          }
        />
      </Card>
    </div>
  );
};

export default DetailsClasse;