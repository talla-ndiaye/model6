import { BookOpen, Calendar, FileText, Users } from 'lucide-react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { classes, eleves, emploisDuTemps, enseignants, matieres } from '../../data/donneesTemporaires';

const TableauDeBordProfesseur = () => {
  const { user } = useAuth();

  const enseignant = user?.role === 'enseignant' 
        ? enseignants.find(e => e.id === user.id)
        : null;
  
    // Filtre les classes où l'utilisateur actuel est l'enseignant principal
    const mesClassesAssignees = enseignant ? classes.filter(classe => enseignant.classes.includes(classe.id)): []
    
  const mesElevesAssignes = eleves.filter(eleve => mesClassesAssignees.some(classe => classe.id === eleve.classeId));

  const aujourdhui = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
  const coursDuJour = emploisDuTemps.filter(cours =>
    cours.jour === aujourdhui && cours.enseignantId === user.id
  );

  const statistiques = [
    { title: 'Classes', value: mesClassesAssignees.length, icon: BookOpen, color: 'bg-blue-500' },
    { title: 'Élèves', value: mesElevesAssignes.length, icon: Users, color: 'bg-green-500' },
    { title: 'Cours du jour', value: coursDuJour.length, icon: Calendar, color: 'bg-orange-500' },
    { title: 'Matières', value: user.matieres?.length || 0, icon: FileText, color: 'bg-purple-500' }
  ];

  const reglagesSlider = {
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1 } }
    ]
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 py-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Bonjour {user.prenom} !</h1>
        <p className="text-gray-500 text-sm">Résumé de vos activités</p>
      </div>

      <div className="relative -mx-3 mb-8">
        <Slider {...reglagesSlider}>
          {statistiques.map((stat, index) => (
            <div key={index} className="px-3">
              <Card className="p-6 rounded-2xl bg-white shadow">
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </Slider>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl p-6 bg-white shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes classes</h2>
          <div className="space-y-3">
            {mesClassesAssignees.length > 0 ? (
              mesClassesAssignees.map((classe) => (
                <div key={classe.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{classe.nom}</h3>
                    <p className="text-sm text-gray-600">{classe.nombreEleves} élèves</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Salle {classe.salle}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">Aucune classe assignée pour le moment.</p>
            )}
          </div>
        </Card>

        <Card className="rounded-2xl p-6 bg-white shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cours du jour ({aujourdhui})</h2>
          <div className="space-y-3">
            {coursDuJour.length > 0 ? (
              coursDuJour.map((cours) => {
                const matiere = matieres.find(m => m.id === cours.matiereId);
                const classe = classes.find(c => c.id === cours.classeId);
                return (
                  <div key={cours.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: matiere?.couleur || '#ccc' }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{matiere?.nom}</h3>
                      <p className="text-sm text-gray-600">{classe?.nom} - Salle {cours.salle}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{cours.heure}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 py-4">Aucun cours prévu pour aujourd'hui.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TableauDeBordProfesseur;