import {
  BookOpen,
  Calendar, Clock, MapPin,
  Users
} from 'lucide-react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { classes, emploisDuTemps, matieres } from '../../data/donneesTemporaires';

const EmploiDuTempsEnseignant = () => {
  const { user } = useAuth();

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const heures = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'];

  const totalHours = emploisDuTemps.filter(c => c.enseignantId === user.id).length;
  const classesTaught = new Set(emploisDuTemps.filter(c => c.enseignantId === user.id).map(c => c.classeId)).size;
  const roomsUsed = new Set(emploisDuTemps.filter(c => c.enseignantId === user.id).map(c => c.salle)).size;

  const stats = [
    {
      icon: Clock,
      value: `${totalHours}h`,
      label: 'Total heures/semaine',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      iconColor: 'text-blue-600'
    },
    {
      icon: BookOpen,
      value: classesTaught,
      label: 'Classes enseignées',
      bg: 'bg-green-50',
      text: 'text-green-800',
      iconColor: 'text-green-600'
    },
    {
      icon: MapPin,
      value: roomsUsed,
      label: 'Salles utilisées',
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      iconColor: 'text-orange-600'
    }
  ];

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false
  };

  const mesCoursParJourHeure = (jour, heure) => {
    const cours = emploisDuTemps.find(
      e => e.jour === jour && e.heure === heure && e.enseignantId === user.id
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

  return (
    <div className="space-y-6 px-2 sm:px-4 py-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Mon emploi du temps</h1>
        <p className="text-gray-600 text-sm">Votre planning de la semaine</p>
      </div>

      {/* Stats slider (mobile) */}
      <div className="block md:hidden">
        <Slider {...sliderSettings}>
          {stats.map((stat, idx) => (
            <div key={idx} className="px-2">
              <Card className={`p-4 text-center ${stat.bg} rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor} mx-auto mb-2`} />
                <p className={`text-xl font-bold ${stat.text}`}>{stat.value}</p>
                <p className={`text-sm ${stat.iconColor}`}>{stat.label}</p>
              </Card>
            </div>
          ))}
        </Slider>
      </div>

      {/* Stats grid (desktop) */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className={`p-6 text-center ${stat.bg} rounded-xl`}>
            <stat.icon className={`w-6 h-6 ${stat.iconColor} mx-auto mb-2`} />
            <p className={`text-2xl font-bold ${stat.text}`}>{stat.value}</p>
            <p className={`text-sm ${stat.iconColor}`}>{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Tableau de l'emploi du temps */}
      <Card className="p-0 overflow-x-auto">
        <div className="p-6 mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Semaine en cours
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
  );
};

export default EmploiDuTempsEnseignant;
