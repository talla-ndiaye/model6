import { BookOpen, Calendar, Eye, MapPin, Phone, Users } from 'lucide-react'; // Added more icons
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { classes, eleves } from '../../data/donneesTemporaires';

// Helper component for uniform detail rows in modals (reused from other components)
const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
    {Icon && <Icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />}
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

const MesClasses = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);

  // Filter classes where the current user is the principal teacher
  const mesClasses = classes.filter(classe =>
    classe.enseignantPrincipal === user.id
  );

  const getStudentsForClass = (classeId) => {
    return eleves.filter(eleve => eleve.classeId === classeId);
  };

  const handleViewStudents = (classe) => {
    setSelectedClass(classe);
    setShowStudentsModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes classes</h1>
        <p className="text-gray-600">Gérer vos classes et consulter la liste des élèves</p>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mesClasses.length > 0 ? (
          mesClasses.map((classe) => {
            const studentsCount = getStudentsForClass(classe.id).length;
            return (
              <Card key={classe.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  {/* Class Name and Level with Icon/Initial Circle */}
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {classe.nom.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{classe.nom}</h3>
                      <p className="text-sm text-gray-600">{classe.niveau}</p>
                    </div>
                  </div>
                  {/* Room */}
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Salle</p>
                    <p className="font-medium text-gray-900">{classe.salle}</p>
                  </div>
                </div>

                {/* Students Count */}
                <div className="flex items-center mb-4 text-gray-700">
                  <Users className="w-5 h-5 text-blue-600 mr-2" /> {/* Consistent blue icon */}
                  <span className="font-medium">{studentsCount} élèves</span>
                </div>

                {/* View Students Button */}
                <Button
                  onClick={() => handleViewStudents(classe)}
                  variant="outline"
                  className="w-full mt-auto" // Pushes button to bottom
                  icon={Eye}
                >
                  Voir les élèves
                </Button>
              </Card>
            );
          })
        ) : (
          // Empty State Message - Improved Styling
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

      {/* Modal liste des élèves - Enhanced */}
      <Modal
        isOpen={showStudentsModal}
        onClose={() => setShowStudentsModal(false)}
        title={`Élèves de ${selectedClass?.nom}`}
        size="lg" // Larger size for student list
      >
        {selectedClass && (
          <div className="space-y-6"> {/* Increased spacing */}
            {/* Class Info Section */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-inner">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Informations de la classe</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <DetailRow icon={BookOpen} label="Niveau" value={selectedClass.niveau} />
                <DetailRow icon={MapPin} label="Salle" value={selectedClass.salle} />
                <DetailRow icon={Users} label="Total élèves" value={getStudentsForClass(selectedClass.id).length} />
              </div>
            </div>

            {/* Student List */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Liste des élèves</h3>
              {getStudentsForClass(selectedClass.id).length > 0 ? (
                getStudentsForClass(selectedClass.id).map((eleve) => (
                  <div key={eleve.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                    {/* Student Avatar/Initials */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-medium">
                        {eleve.prenom.charAt(0)}{eleve.nom.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {eleve.prenom} {eleve.nom}
                        </h4>
                        <p className="text-sm text-gray-600">{eleve.email}</p>
                      </div>
                    </div>
                    {/* Student Contact/DOB Info */}
                    <div className="text-right space-y-1">
                      <div className="flex items-center justify-end text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                        <span>{new Date(eleve.dateNaissance).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center justify-end text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-1 text-blue-500" />
                        <span>{eleve.telephone}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucun élève inscrit dans cette classe.
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MesClasses;