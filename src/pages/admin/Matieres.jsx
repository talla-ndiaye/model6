import { BookOpen, Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import Modal from '../../components/ui/Modal';
import { matieres } from '../../data/donneesTemporaires';

const Matieres = () => {
  const [matieresData, setMatieresData] = useState(matieres);
  const [afficherModal, setAfficherModal] = useState(false);
  const [afficherModalDetail, setAfficherModalDetail] = useState(false);
  const [matiereEnEdition, setMatiereEnEdition] = useState(null);
  const [matiereSelectionnee, setMatiereSelectionnee] = useState(null);
  const [texteRecherche, setTexteRecherche] = useState('');

  const [donneesFormulaire, setDonneesFormulaire] = useState({
    nom: '',
    code: '',
    coefficient: '',
    couleur: '#3b82f6'
  });

  const matieresFiltrees = matieresData.filter(matiere => {
    const correspondRecherche = matiere.nom.toLowerCase().includes(texteRecherche.toLowerCase()) ||
      matiere.code.toLowerCase().includes(texteRecherche.toLowerCase());
    return correspondRecherche;
  });

  const gererSoumission = (e) => {
    e.preventDefault();

    const donneesMatiere = {
      ...donneesFormulaire,
      coefficient: parseInt(donneesFormulaire.coefficient)
    };

    if (matiereEnEdition) {
      console.log('Modification matière:', { ...donneesMatiere, id: matiereEnEdition.id });
      setMatieresData(matieresData.map(matiere =>
        matiere.id === matiereEnEdition.id ? { ...donneesMatiere, id: matiere.id } : matiere
      ));
    } else {
      const nouvelleMatiere = {
        ...donneesMatiere,
        id: Math.max(...matieresData.map(s => s.id)) + 1
      };
      console.log('Ajout matière:', nouvelleMatiere);
      setMatieresData([...matieresData, nouvelleMatiere]);
    }

    reinitialiserFormulaire();
  };

  const gererEdition = (matiere) => {
    setMatiereEnEdition(matiere);
    setDonneesFormulaire({
      nom: matiere.nom,
      code: matiere.code,
      coefficient: matiere.coefficient.toString(),
      couleur: matiere.couleur
    });
    setAfficherModalDetail(false);
    setAfficherModal(true);
  };

  const gererDetail = (matiere) => {
    setMatiereSelectionnee(matiere);
    setAfficherModalDetail(true);
  };

  const gererSuppression = (matiere) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la matière ${matiere.nom} ?`)) {
      console.log('Suppression matière:', matiere);
      setMatieresData(matieresData.filter(s => s.id !== matiere.id));
      setAfficherModalDetail(false);
    }
  };

  const reinitialiserFormulaire = () => {
    setDonneesFormulaire({
      nom: '',
      code: '',
      coefficient: '',
      couleur: '#3b82f6'
    });
    setMatiereEnEdition(null);
    setAfficherModal(false);
  };

  const LigneDetail = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-sm text-gray-800 font-semibold">{value}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des matières</h1>
          <p className="text-gray-600">Gérez les matières enseignées</p>
        </div>
        <Button onClick={() => setAfficherModal(true)} icon={Plus}>
          Nouvelle Matière
        </Button>
      </div>

      <div className="mb-6">
        <InputField
          placeholder="Rechercher une matière par nom ou code..."
          value={texteRecherche}
          onChange={(e) => setTexteRecherche(e.target.value)}
          icon={Search}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matieresFiltrees.map((matiere) => (
          <Card key={matiere.id} className="p-6 relative flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-blue-600 border border-blue-200"
                  style={{ backgroundColor: matiere.couleur + '1A', borderColor: matiere.couleur + '40' }}
                >
                  <BookOpen className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{matiere.nom}</h3>
                  <p className="text-sm text-gray-600 uppercase">{matiere.code}</p>
                </div>
              </div>

              <div className="flex space-x-1 mt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => gererEdition(matiere)}
                  icon={Edit}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => gererSuppression(matiere)}
                  icon={Trash2}
                />
              </div>
            </div>

            <div className="w-full mt-auto">
              <Button
                variant="outline"
                onClick={() => gererDetail(matiere)}
                className="w-full"
              >
                Voir les détails
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={afficherModal}
        onClose={reinitialiserFormulaire}
        title={matiereEnEdition ? 'Modifier la matière' : 'Nouvelle matière'}
        size="md"
      >
        <form onSubmit={gererSoumission} className="space-y-4">
          <InputField
            label="Nom de la matière"
            value={donneesFormulaire.nom}
            onChange={(e) => setDonneesFormulaire({...donneesFormulaire, nom: e.target.value})}
            placeholder="ex: Mathématiques"
            required
          />

          <InputField
            label="Code de la matière"
            value={donneesFormulaire.code}
            onChange={(e) => setDonneesFormulaire({...donneesFormulaire, code: e.target.value.toUpperCase()})}
            placeholder="ex: MATH"
            required
          />

          <InputField
            label="Coefficient"
            type="number"
            value={donneesFormulaire.coefficient}
            onChange={(e) => setDonneesFormulaire({...donneesFormulaire, coefficient: e.target.value})}
            min="1"
            max="10"
            required
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={reinitialiserFormulaire}>
              Annuler
            </Button>
            <Button type="submit">
              {matiereEnEdition ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={afficherModalDetail}
        onClose={() => setAfficherModalDetail(false)}
        title="Détails de la matière"
        size="sm"
      >
        {matiereSelectionnee && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: matiereSelectionnee.couleur + '1A', color: matiereSelectionnee.couleur }}
              >
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{matiereSelectionnee.nom}</h3>
                <p className="text-sm text-gray-500 uppercase">{matiereSelectionnee.code}</p>
              </div>
            </div>

            <LigneDetail label="Nom complet" value={matiereSelectionnee.nom} />
            <LigneDetail label="Code" value={matiereSelectionnee.code} />
            <LigneDetail label="Coefficient" value={matiereSelectionnee.coefficient} />
            <LigneDetail label="Couleur (Hex)" value={matiereSelectionnee.couleur} />

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setAfficherModalDetail(false)}>
                Fermer
              </Button>
              <Button variant="secondary" onClick={() => gererEdition(matiereSelectionnee)} icon={Edit}>
                Modifier
              </Button>
              <Button variant="danger" onClick={() => gererSuppression(matiereSelectionnee)} icon={Trash2}>
                Supprimer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Matieres;