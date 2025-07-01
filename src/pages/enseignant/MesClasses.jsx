import { Eye, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

import { useAuth } from '../../context/AuthContext';
import { classes, eleves, enseignants } from '../../data/donneesTemporaires';



const MesClasses = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); 

  const enseignant = user?.role === 'enseignant' 
      ? enseignants.find(e => e.id === user.id)
      : null;

  
  const mesClassesAssignees = enseignant ? classes.filter(classe => enseignant.classes.includes(classe.id)): []
  

  const getElevesPourClasse = (classeId) => { 
    return eleves.filter(eleve => eleve.classeId === classeId);
  };

  const gererVoirClasse = (classeId) => { 
    navigate(`./details/${classeId}`); 
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes classes</h1>
        <p className="text-gray-600">Gérer vos classes et consulter la liste des élèves</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mesClassesAssignees.length > 0 ? (
          mesClassesAssignees.map((classe) => {
            const nombreEleves = getElevesPourClasse(classe.id).length; 
            return (
              <Card key={classe.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {classe.nom.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{classe.nom}</h3>
                      <p className="text-sm text-gray-600">{classe.niveau}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Salle</p>
                    <p className="font-medium text-gray-900">{classe.salle}</p>
                  </div>
                </div>

                <div className="flex items-center mb-4 text-gray-700">
                  <Users className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium">{nombreEleves} élèves</span>
                </div>

                <Button
                  onClick={() => gererVoirClasse(classe.id)} 
                  variant="outline"
                  className="w-full mt-auto"
                  icon={Eye}
                >
                  Details
                </Button>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-full p-12 text-center bg-gray-50 border border-gray-200 shadow-sm">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune classe assignée</h3>
            <p className="text-gray-600">
              Vous n'êtes actuellement responsable d'aucune classe.
              Contactez l'administration pour plus d'informations.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MesClasses;