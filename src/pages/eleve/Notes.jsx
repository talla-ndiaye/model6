import React, { useState } from 'react';
import { FileText, TrendingUp, Award } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { notes, matieres, eleves } from '../../data/donneesTemporaires';

const NotesEleve = () => {
  const { user } = useAuth();
  const [selectedTrimestre, setSelectedTrimestre] = useState('1');

  // Récupérer l'élève
  const eleve = eleves.find(e => e.email === user.email);
  
  // Récupérer les notes de l'élève
  const mesNotes = notes.filter(note => note.eleveId === eleve?.id);

  const calculateMoyenne = (matiereId) => {
    const notesMatiere = mesNotes.filter(n => n.matiereId === matiereId);
    if (notesMatiere.length === 0) return null;
    
    const totalPoints = notesMatiere.reduce((sum, note) => sum + (note.note * note.coefficient), 0);
    const totalCoeff = notesMatiere.reduce((sum, note) => sum + note.coefficient, 0);
    
    return (totalPoints / totalCoeff).toFixed(2);
  };

  const calculateMoyenneGenerale = () => {
    if (mesNotes.length === 0) return 0;
    
    const moyennesParMatiere = matieres.map(matiere => {
      const moyenne = calculateMoyenne(matiere.id);
      return moyenne ? { moyenne: parseFloat(moyenne), coefficient: matiere.coefficient } : null;
    }).filter(Boolean);

    if (moyennesParMatiere.length === 0) return 0;

    const totalPoints = moyennesParMatiere.reduce((sum, m) => sum + (m.moyenne * m.coefficient), 0);
    const totalCoeff = moyennesParMatiere.reduce((sum, m) => sum + m.coefficient, 0);

    return (totalPoints / totalCoeff).toFixed(2);
  };

  const getAppreciation = (moyenne) => {
    if (moyenne >= 16) return { text: 'Très bien', color: 'text-green-600' };
    if (moyenne >= 14) return { text: 'Bien', color: 'text-blue-600' };
    if (moyenne >= 12) return { text: 'Assez bien', color: 'text-yellow-600' };
    if (moyenne >= 10) return { text: 'Passable', color: 'text-orange-600' };
    return { text: 'Insuffisant', color: 'text-red-600' };
  };

  if (!eleve) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profil non trouvé</h3>
          <p className="text-gray-600">
            Impossible de récupérer vos informations d'élève.
          </p>
        </Card>
      </div>
    );
  }

  const moyenneGenerale = calculateMoyenneGenerale();
  const appreciation = getAppreciation(parseFloat(moyenneGenerale));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes notes</h1>
          <p className="text-gray-600">Consultez vos résultats scolaires</p>
        </div>
        
        <select
          value={selectedTrimestre}
          onChange={(e) => setSelectedTrimestre(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1">1er Trimestre</option>
          <option value="2">2ème Trimestre</option>
          <option value="3">3ème Trimestre</option>
        </select>
      </div>

      {/* Résumé général */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Moyenne générale</p>
              <p className="text-2xl font-semibold text-gray-900">{moyenneGenerale}/20</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Appréciation</p>
              <p className={`text-lg font-semibold ${appreciation.color}`}>
                {appreciation.text}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-orange-500 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Notes saisies</p>
              <p className="text-2xl font-semibold text-gray-900">{mesNotes.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Détail par matière */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Détail par matière</h2>
          
          <div className="space-y-6">
            {matieres.map(matiere => {
              const notesMatiere = mesNotes.filter(n => n.matiereId === matiere.id);
              const moyenne = calculateMoyenne(matiere.id);
              
              return (
                <div key={matiere.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: matiere.couleur }}
                      />
                      <h3 className="text-lg font-semibold text-gray-900">{matiere.nom}</h3>
                      <span className="text-sm text-gray-500">Coeff. {matiere.coefficient}</span>
                    </div>
                    <div className="text-right">
                      {moyenne ? (
                        <div>
                          <p className={`text-xl font-bold ${
                            parseFloat(moyenne) >= 10 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {moyenne}/20
                          </p>
                          <p className={`text-sm ${getAppreciation(parseFloat(moyenne)).color}`}>
                            {getAppreciation(parseFloat(moyenne)).text}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-400">Pas de note</p>
                      )}
                    </div>
                  </div>

                  {notesMatiere.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Date
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Type
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Note
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Coeff.
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Commentaire
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {notesMatiere.map(note => (
                            <tr key={note.id}>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {new Date(note.date).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">{note.type}</td>
                              <td className="px-4 py-2">
                                <span className={`text-sm font-medium ${
                                  note.note >= 10 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {note.note}/20
                                </span>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">{note.coefficient}</td>
                              <td className="px-4 py-2 text-sm text-gray-600">{note.commentaire}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Aucune note pour cette matière</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotesEleve;