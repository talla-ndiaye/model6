import { BookOpen, Calendar, FileText, Users } from 'lucide-react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { classes, eleves, emploisDuTemps, matieres } from '../../data/donneesTemporaires';

const TableauDeBordEnseignant = () => {
  const { user } = useAuth();

  const mesClasses = classes.filter(classe => classe.enseignantPrincipal === user.id);
  const mesEleves = eleves.filter(eleve => mesClasses.some(classe => classe.id === eleve.classeId));
  const aujourdhui = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
  const coursAujourdhui = emploisDuTemps.filter(cours =>
    cours.jour === aujourdhui && cours.enseignantId === user.id
  );

  const stats = [
    { title: 'Classes', value: mesClasses.length, icon: BookOpen, color: 'bg-blue-500' },
    { title: 'Élèves', value: mesEleves.length, icon: Users, color: 'bg-green-500' },
    { title: 'Cours', value: coursAujourdhui.length, icon: Calendar, color: 'bg-orange-500' },
    { title: 'Matières', value: user.matieres?.length || 0, icon: FileText, color: 'bg-purple-500' }
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 py-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Bonjour {user.prenom} !</h1>
        <p className="text-gray-500 text-sm">Résumé de vos activités</p>
      </div>

      {/* Statistiques - mobile (slider) */}
      <div className="block lg:hidden">
        <Slider {...sliderSettings}>
          {stats.map((stat, index) => (
            <div key={index} className="px-2">
              <Card className="p-4 rounded-2xl shadow bg-white">
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </Slider>
      </div>

      {/* Statistiques - desktop */}
      <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 rounded-2xl bg-white shadow">
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
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mes classes */}
        <Card className="rounded-2xl p-6 bg-white shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes classes</h2>
          <div className="space-y-3">
            {mesClasses.map((classe) => (
              <div key={classe.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{classe.nom}</h3>
                  <p className="text-sm text-gray-600">{classe.nombreEleves} élèves</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Salle {classe.salle}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Cours du jour */}
        <Card className="rounded-2xl p-6 bg-white shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cours du jour</h2>
          <div className="space-y-3">
            {coursAujourdhui.length > 0 ? (
              coursAujourdhui.map((cours) => {
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
              <p className="text-center text-gray-500 py-4">Aucun cours aujourd'hui</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TableauDeBordEnseignant;
