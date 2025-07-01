import {
  ArrowLeft,
  BookOpen,
  Mail,
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
import { classes, eleves, enseignants, matieres } from '../../data/donneesTemporaires';


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

  const classe = useMemo(() => {
    return classes.find(c => c.id === parseInt(id));
  }, [id]);

  const elevesDansClasse = useMemo(() => {
    return eleves.filter(eleve => eleve.classeId === parseInt(id));
  }, [id]);

  const getNomEnseignant = (enseignantId) => {
    const enseignant = enseignants.find(e => e.id === enseignantId);
    return enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Non assigné';
  };

  const getNomMatieresParIds = (matiereIds) => {
    if (!matiereIds || matiereIds.length === 0) return 'Aucune';
    return matiereIds.map(id => matieres.find(m => m.id === id)?.nom).filter(Boolean).join(', ');
  };

  if (!classe) {
    return (
      <div className="text-center py-12 text-gray-500">
        <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold">Classe introuvable</h3>
        <p className="text-gray-400 text-sm mt-2">L'identifiant de la classe spécifié n'existe pas.</p>
        <Button onClick={() => navigate('/admin/classes')} className="mt-6" icon={ArrowLeft}>
          Retour à la liste des classes
        </Button>
      </div>
    );
  }

  const colonnesEleves = [
    {
      header: 'Élève',
      accessor: 'nomComplet',
      render: (eleve) => (
        <div className="flex items-center">
          <NavLink to={`/admin/eleves/profil/${eleve.id}`}>
            <User className="h-8 w-8 rounded-full object-cover shadow-sm mr-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {eleve.prenom} {eleve.nom}
              </div>
              <div className="text-xs text-gray-500">Matricule: {eleve.matricule}</div>
            </div>
          </NavLink>

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