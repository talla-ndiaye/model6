import React, { useState } from 'react';
import { Users, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { classes, eleves } from '../../data/donneesTemporaires';

const MesClasses = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);

  // Récupérer les classes de l'enseignant
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes classes</h1>
        <p className="text-gray-600">Gérer vos classes et consulter la liste des élèves</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mesClasses.map((classe) => {
          const studentsCount = getStudentsForClass(classe.id).length;
          return (
            <Card key={classe.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{classe.nom}</h3>
                  <p className="text-sm text-gray-600">{classe.niveau}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Salle</p>
                  <p className="font-medium text-gray-900">{classe.salle}</p>
                </div>
              </div>

              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-700">{studentsCount} élèves</span>
              </div>

              <Button
                onClick={() => handleViewStudents(classe)}
                variant="outline"
                className="w-full"
                icon={Eye}
              >
                Voir les élèves
              </Button>
            </Card>
          );
        })}
      </div>

      {mesClasses.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune classe assignée</h3>
          <p className="text-gray-600">
            Vous n'êtes actuellement responsable d'aucune classe. 
            Contactez l'administration pour plus d'informations.
          </p>
        </Card>
      )}

      {/* Modal liste des élèves */}
      <Modal
        isOpen={showStudentsModal}
        onClose={() => setShowStudentsModal(false)}
        title={`Élèves de ${selectedClass?.nom}`}
        size="lg"
      >
        {selectedClass && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Classe</p>
                  <p className="font-medium text-gray-900">{selectedClass.nom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Niveau</p>
                  <p className="font-medium text-gray-900">{selectedClass.niveau}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Salle</p>
                  <p className="font-medium text-gray-900">{selectedClass.salle}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nombre d'élèves</p>
                  <p className="font-medium text-gray-900">{getStudentsForClass(selectedClass.id).length}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {getStudentsForClass(selectedClass.id).map((eleve) => (
                <div key={eleve.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {eleve.prenom} {eleve.nom}
                    </h4>
                    <p className="text-sm text-gray-600">{eleve.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(eleve.dateNaissance).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm text-gray-500">{eleve.telephone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MesClasses;