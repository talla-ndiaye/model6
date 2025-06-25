import { Award, BookOpen, FileText, TrendingUp, User } from 'lucide-react'; // Added Calendar, BookOpen, User for consistent icons
import { useState } from 'react';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { eleves, matieres, notes } from '../../data/donneesTemporaires';

const NotesEleve = () => {
  const { user } = useAuth();
  const [selectedTrimestre, setSelectedTrimestre] = useState('1');

  // Récupérer l'élève
  const eleve = eleves.find(e => e.email === user.email);

  // Filter notes by selected trimestre (assuming notes have a 'trimestre' property, if not, this part needs data adjustment)
  // For now, I'll mock a 'trimestre' filter based on date. In a real app, 'notes' would have a trimestre field.
  const mesNotes = notes.filter(note => {
    if (!eleve) return false;
    const noteDate = new Date(note.date);
    // Simple date-based trimestre simulation (adjust as per actual trimestre logic)
    const trimester =
      noteDate.getMonth() < 3 ? '1' : // Jan-Mar
      noteDate.getMonth() < 6 ? '2' : // Apr-Jun
      noteDate.getMonth() < 9 ? '3' : '1'; // Jul-Sep, Oct-Dec (default to 1 for simplicity)
    
    return note.eleveId === eleve.id && String(trimester) === selectedTrimestre;
  });

  const calculateMoyenne = (matiereId) => {
    const notesMatiere = mesNotes.filter(n => n.matiereId === matiereId);
    if (notesMatiere.length === 0) return null;

    const totalPoints = notesMatiere.reduce((sum, note) => sum + (note.note * note.coefficient), 0);
    const totalCoeff = notesMatiere.reduce((sum, note) => sum + note.coefficient, 0);

    return (totalPoints / totalCoeff).toFixed(2);
  };

  const calculateMoyenneGenerale = () => {
    // Calculate general average only from subjects that have notes for the selected trimester
    const moyennesParMatiere = matieres.map(matiere => {
      const moyenne = calculateMoyenne(matiere.id);
      return moyenne ? { moyenne: parseFloat(moyenne), coefficient: matiere.coefficient } : null;
    }).filter(Boolean); // Filter out subjects with no notes in the current trimester

    if (moyennesParMatiere.length === 0) return null; // Changed to null for clear "Pas de notes"

    const totalPoints = moyennesParMatiere.reduce((sum, m) => sum + (m.moyenne * m.coefficient), 0);
    const totalCoeff = moyennesParMatiere.reduce((sum, m) => sum + m.coefficient, 0);

    return (totalPoints / totalCoeff).toFixed(2);
  };

  const getAppreciation = (moyenne) => {
    if (moyenne === null) return { text: 'N/A', color: 'text-gray-500' }; // Handle null moyenne
    if (moyenne >= 16) return { text: 'Très bien', color: 'text-green-600' };
    if (moyenne >= 14) return { text: 'Bien', color: 'text-blue-600' };
    if (moyenne >= 12) return { text: 'Assez bien', color: 'text-yellow-600' };
    if (moyenne >= 10) return { text: 'Passable', color: 'text-orange-600' };
    return { text: 'Insuffisant', color: 'text-red-600' };
  };

  if (!eleve) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center bg-gray-50 border border-gray-200 shadow-sm">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Profil élève non trouvé</h3>
          <p className="text-gray-600">
            Impossible de récupérer vos informations d'élève. Veuillez vous assurer que votre compte est correctement configuré.
          </p>
        </Card>
      </div>
    );
  }

  const moyenneGenerale = calculateMoyenneGenerale();
  const appreciation = getAppreciation(parseFloat(moyenneGenerale));

  return (
    <div className="space-y-6">
      {/* Page Header and Trimestre Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes notes</h1>
          <p className="text-gray-600">Consultez vos résultats scolaires</p>
        </div>

        <select
          value={selectedTrimestre}
          onChange={(e) => setSelectedTrimestre(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 shadow-sm" // Added text-gray-700 and shadow
        >
          <option value="1">1er Trimestre</option>
          <option value="2">2ème Trimestre</option>
          <option value="3">3ème Trimestre</option>
        </select>
      </div>

      {/* General Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-100 shadow-sm"> {/* Consistent card styling */}
          <div className="flex items-center">
            <div className="bg-blue-600 p-3 rounded-lg"> {/* Deeper blue background */}
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-blue-800">Moyenne générale</p> {/* Deeper blue text */}
              <p className="text-2xl font-semibold text-blue-900">
                {moyenneGenerale !== null ? `${moyenneGenerale}/20` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-green-50 border-green-100 shadow-sm"> {/* Consistent card styling */}
          <div className="flex items-center">
            <div className="bg-green-600 p-3 rounded-lg"> {/* Deeper green background */}
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-green-800">Appréciation</p> {/* Deeper green text */}
              <p className={`text-lg font-semibold ${appreciation.color}`}>
                {appreciation.text}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-orange-50 border-orange-100 shadow-sm"> {/* Consistent card styling */}
          <div className="flex items-center">
            <div className="bg-orange-600 p-3 rounded-lg"> {/* Deeper orange background */}
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-orange-800">Notes saisies</p> {/* Deeper orange text */}
              <p className="text-2xl font-semibold text-orange-900">{mesNotes.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detail by Subject Section */}
      <Card className="p-6 shadow-sm"> {/* Wrapped in a Card */}
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" /> {/* Consistent blue icon */}
            Détail par matière
        </h2>

        <div className="space-y-6">
          {matieres.length > 0 ? (
            matieres.map(matiere => {
              const notesMatiere = mesNotes.filter(n => n.matiereId === matiere.id);
              const moyenne = calculateMoyenne(matiere.id);

              return (
                <div key={matiere.id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"> {/* Added shadow and hover */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100"> {/* Added border-b */}
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: matiere.couleur }}
                      />
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" /> {/* Consistent blue icon */}
                        {matiere.nom}
                      </h3>
                      <span className="text-sm text-gray-500">Coeff. {matiere.coefficient}</span>
                    </div>
                    <div className="text-right">
                      {moyenne !== null ? ( // Handle null moyenne
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
                        <p className="text-gray-400 text-lg">N/A</p> // Clear N/A for no notes
                      )}
                    </div>
                  </div>

                  {notesMatiere.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
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
                            <tr key={note.id} className="hover:bg-gray-50 transition-colors">
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
                              <td className="px-4 py-2 text-sm text-gray-600">{note.commentaire || 'Aucun'}</td> {/* Handle null comment */}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Aucune note enregistrée pour ce trimestre.</p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Aucune note disponible pour ce trimestre.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NotesEleve;