import { Award, FileText, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { eleves, matieres, notes } from '../../data/donneesTemporaires';

const NotesEleve = () => {
  const { user } = useAuth();
  const [matiereFiltre, setMatiereFiltre] = useState('all'); 

  const eleve = user?.role === 'eleve'
    ? eleves.find(e => e.email === user.email)
    : null;

  if (!eleve) return null;

  const toutesLesNotesDeLEleve = notes.filter(note => note.eleveId === eleve.id); 

  const notesParMatiere = useMemo(() => {
    return toutesLesNotesDeLEleve.reduce((acc, note) => {
      const matiere = matieres.find(m => m.id === note.matiereId);
      if (!matiere) return acc;

      if (!acc[matiere.id]) {
        acc[matiere.id] = {
          matiere,
          notes: [],
          moyenne: 0
        };
      }

      acc[matiere.id].notes.push(note);

      const sommeNotes = acc[matiere.id].notes.reduce((sum, n) => sum + (n.note * n.coefficient), 0); 
      const sommeCoefficients = acc[matiere.id].notes.reduce((sum, n) => sum + n.coefficient, 0);
      acc[matiere.id].moyenne = sommeCoefficients ? sommeNotes / sommeCoefficients : 0;

      return acc;
    }, {});
  }, [toutesLesNotesDeLEleve, matieres]);


  const toutesLesMatieresAvecNotes = Object.values(notesParMatiere);

  const matieresFiltrees = matiereFiltre === 'all'
    ? toutesLesMatieresAvecNotes
    : toutesLesMatieresAvecNotes.filter(({ matiere }) => matiere.id.toString() === matiereFiltre); 


  // Calcul de la moyenne générale
  const moyenneGenerale = useMemo(() => {
    if (toutesLesMatieresAvecNotes.length === 0) return 'N/A';

    const moyennesValides = toutesLesMatieresAvecNotes.filter(item => item.moyenne !== 0); 
    if (moyennesValides.length === 0) return 'N/A';

    const totalPointsPonderes = moyennesValides.reduce((sum, item) => sum + (item.moyenne * item.matiere.coefficient), 0);
    const totalCoefficients = moyennesValides.reduce((sum, item) => sum + item.matiere.coefficient, 0);

    return totalCoefficients ? (totalPointsPonderes / totalCoefficients).toFixed(2) : 'N/A';
  }, [toutesLesMatieresAvecNotes]);


  const getAppreciation = (moyenne) => {
    const valMoyenne = parseFloat(moyenne);
    if (isNaN(valMoyenne)) return { text: 'N/A', color: 'text-gray-500' };
    if (valMoyenne >= 16) return { text: 'Très bien', color: 'text-green-600' };
    if (valMoyenne >= 14) return { text: 'Bien', color: 'text-blue-600' };
    if (valMoyenne >= 12) return { text: 'Assez bien', color: 'text-yellow-600' };
    if (valMoyenne >= 10) return { text: 'Passable', color: 'text-orange-600' };
    return { text: 'Insuffisant', color: 'text-red-600' };
  };

  const appreciationGenerale = getAppreciation(moyenneGenerale);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes notes</h1>
          <p className="text-gray-600">Consultez vos résultats scolaires</p>
        </div>
      </div>

      {/* Moyenne générale et Appréciations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-100 shadow-sm">
          <div className="flex items-center">
            <div className="bg-blue-600 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-blue-800">Moyenne générale</p>
              <p className="text-2xl font-semibold text-blue-900">
                {moyenneGenerale}/20
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-green-50 border-green-100 shadow-sm">
          <div className="flex items-center">
            <div className="bg-green-600 p-3 rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-green-800">Appréciation</p>
              <p className={`text-lg font-semibold ${appreciationGenerale.color}`}>
                {appreciationGenerale.text}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-orange-50 border-orange-100 shadow-sm">
          <div className="flex items-center">
            <div className="bg-orange-600 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-orange-800">Notes saisies</p>
              <p className="text-2xl font-semibold text-orange-900">{toutesLesNotesDeLEleve.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtre par matière */}
      <div className="card p-6">
        <div className="flex items-center gap-2">
          <label htmlFor="matiere-select" className="text-sm font-medium text-gray-700">
            Filtrer par matière :
          </label>
          <select
            id="matiere-select"
            value={matiereFiltre}
            onChange={(e) => setMatiereFiltre(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">Toutes les matières</option>
            {toutesLesMatieresAvecNotes.map(({ matiere }) => (
              <option key={matiere.id} value={matiere.id}> 
                {matiere.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes par matière */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matieresFiltrees.length > 0 ? (
          matieresFiltrees.map(({ matiere, notes: notesMatiereSpecifique, moyenne }) => ( 
            <Card key={matiere.id} className="p-0 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" /> 
                    <h3 className="font-medium text-gray-900">{matiere.nom}</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    moyenne >= 14 ? 'bg-green-100 text-green-700' : 
                    moyenne >= 10 ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700' 
                  }`}>
                    Moyenne: {moyenne.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-3">
                  {notesMatiereSpecifique.length > 0 ? (
                    notesMatiereSpecifique.map((note, index) => (
                      <div key={note.id} className="flex items-center justify-between p-2 bg-gray-50 rounded"> 
                        <div>
                          <p className="text-sm font-medium">
                            {note.type} 
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(note.date).toLocaleDateString('fr-FR')} • Coef. {note.coefficient}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          note.note >= 14 ? 'bg-green-100 text-green-700' :
                          note.note >= 10 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {note.note}/20
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">Aucune note enregistrée pour cette matière.</p>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucune matière disponible ou filtrée.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotesEleve;