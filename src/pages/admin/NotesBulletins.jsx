import React, { useState } from 'react';
import { FileText, BarChart3, Award } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { notes, eleves, matieres, classes } from '../../data/donneesTemporaires';

const NotesBulletins = () => {
  const [activeTab, setActiveTab] = useState('notes');

  const tabs = [
    { id: 'notes', label: 'Gestion des notes', icon: FileText },
    { id: 'bulletins', label: 'Bulletins', icon: Award },
    { id: 'statistiques', label: 'Statistiques', icon: BarChart3 }
  ];

  const getEleveName = (eleveId) => {
    const eleve = eleves.find(e => e.id === eleveId);
    return eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève inconnu';
  };

  const getMatiereName = (matiereId) => {
    const matiere = matieres.find(m => m.id === matiereId);
    return matiere ? matiere.nom : 'Matière inconnue';
  };

  const getClassName = (eleveId) => {
    const eleve = eleves.find(e => e.id === eleveId);
    if (!eleve) return 'Classe inconnue';
    const classe = classes.find(c => c.id === eleve.classeId);
    return classe ? classe.nom : 'Classe inconnue';
  };

  const calculateMoyenne = (eleveId, matiereId) => {
    const notesEleve = notes.filter(n => n.eleveId === eleveId && n.matiereId === matiereId);
    if (notesEleve.length === 0) return null;
    
    const totalPoints = notesEleve.reduce((sum, note) => sum + (note.note * note.coefficient), 0);
    const totalCoeff = notesEleve.reduce((sum, note) => sum + note.coefficient, 0);
    
    return (totalPoints / totalCoeff).toFixed(2);
  };

  const notesColumns = [
    {
      header: 'Élève',
      accessor: 'eleveId',
      render: (note) => getEleveName(note.eleveId)
    },
    {
      header: 'Classe',
      accessor: 'eleveId',
      render: (note) => getClassName(note.eleveId)
    },
    {
      header: 'Matière',
      accessor: 'matiereId',
      render: (note) => getMatiereName(note.matiereId)
    },
    { 
      header: 'Note', 
      accessor: 'note',
      render: (note) => `${note.note}/20`
    },
    { header: 'Coefficient', accessor: 'coefficient' },
    { header: 'Type', accessor: 'type' },
    {
      header: 'Date',
      accessor: 'date',
      render: (note) => new Date(note.date).toLocaleDateString('fr-FR')
    },
    { header: 'Commentaire', accessor: 'commentaire' }
  ];

  const renderNotes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Gestion des notes</h2>
        <Button>Ajouter une note</Button>
      </div>
      
      <Card>
        <Table columns={notesColumns} data={notes} />
      </Card>
    </div>
  );

  const renderBulletins = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Bulletins scolaires</h2>
        <Button>Générer bulletins</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {eleves.map(eleve => (
          <Card key={eleve.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {eleve.prenom} {eleve.nom}
                </h3>
                <p className="text-sm text-gray-600">{getClassName(eleve.id)}</p>
              </div>
              <Button size="sm" variant="outline">
                Voir bulletin
              </Button>
            </div>

            <div className="space-y-3">
              {matieres.map(matiere => {
                const moyenne = calculateMoyenne(eleve.id, matiere.id);
                return (
                  <div key={matiere.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{matiere.nom}</span>
                    <span className={`text-sm font-medium ${
                      moyenne ? (
                        parseFloat(moyenne) >= 10 ? 'text-green-600' : 'text-red-600'
                      ) : 'text-gray-400'
                    }`}>
                      {moyenne ? `${moyenne}/20` : 'Pas de note'}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStatistiques = () => {
    const moyennesParMatiere = matieres.map(matiere => {
      const notesMatiere = notes.filter(n => n.matiereId === matiere.id);
      if (notesMatiere.length === 0) return { matiere: matiere.nom, moyenne: 0 };
      
      const moyenne = notesMatiere.reduce((sum, note) => sum + note.note, 0) / notesMatiere.length;
      return { matiere: matiere.nom, moyenne: moyenne.toFixed(2) };
    });

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Statistiques</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nombre total de notes</h3>
            <p className="text-3xl font-bold text-blue-600">{notes.length}</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Moyenne générale</h3>
            <p className="text-3xl font-bold text-green-600">
              {(notes.reduce((sum, note) => sum + note.note, 0) / notes.length).toFixed(2)}/20
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Élèves évalués</h3>
            <p className="text-3xl font-bold text-orange-600">
              {new Set(notes.map(n => n.eleveId)).size}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Moyennes par matière</h3>
          <div className="space-y-3">
            {moyennesParMatiere.map((stat, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-700">{stat.matiere}</span>
                <span className={`font-semibold ${
                  parseFloat(stat.moyenne) >= 10 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.moyenne}/20
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notes & Bulletins</h1>
        <p className="text-gray-600">Gestion des évaluations et bulletins scolaires</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'notes' && renderNotes()}
        {activeTab === 'bulletins' && renderBulletins()}
        {activeTab === 'statistiques' && renderStatistiques()}
      </div>
    </div>
  );
};

export default NotesBulletins;