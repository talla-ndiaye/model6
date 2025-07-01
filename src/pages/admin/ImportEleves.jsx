import { AlertCircle, BookOpen, CheckCircle, Download, FileText, Upload } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { classes, eleves } from '../../data/donneesTemporaires';

const ImportEleves = () => {
  const { classeId } = useParams();
  const navigate = useNavigate();

  const classeSelectionnee = useMemo(() => {
    return classes.find(c => c.id === parseInt(classeId));
  }, [classes, classeId]);

  const [etapeActuelle, setEtapeActuelle] = useState(1);
  const [fichierCsv, setFichierCsv] = useState(null);
  const [donneesCsv, setDonneesCsv] = useState([]);
  const [resultatsImportation, setResultatsImportation] = useState(null);

  const etapes = [
    { id: 1, name: 'Télécharger le modèle', icon: Download },
    { id: 2, name: 'Préparer le fichier', icon: FileText },
    { id: 3, name: 'Importer le CSV', icon: Upload },
    { id: 4, name: 'Vérification & Import', icon: CheckCircle }
  ];

  const modeleCsv = useMemo(() => {
    const idClasseValeur = classeSelectionnee ? classeSelectionnee.id : '';
    const nomClasseValeur = classeSelectionnee ? classeSelectionnee.nom : '';

    return `Nom,Prénom,Date de naissance,Email,Téléphone,Adresse,Sexe,ID_Parent(s),ClasseID,ClasseNom
Dupont,Jean,2008-03-15,jean.dupont@exemple.fr,771234567,123 Rue de la Paix,M,"3,7",${idClasseValeur},"${nomClasseValeur}"
Martin,Sophie,2009-07-22,sophie.martin@exemple.fr,789876543,456 Avenue des Champs,F,"",${idClasseValeur},"${nomClasseValeur}"`;
  }, [classeSelectionnee]);

  const gererTelechargementFichier = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setFichierCsv(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
        setDonneesCsv(rows);
        setEtapeActuelle(4);
        console.log('Fichier CSV chargé:', rows);
      };
      reader.readAsText(file);
    } else {
      alert("Veuillez sélectionner un fichier CSV valide.");
      setFichierCsv(null);
      setDonneesCsv([]);
    }
  };

  const traiterImportation = () => {
    const nouveauxElevesAAjouter = [];
    let compteSucces = 0;
    let compteErreurs = 0;
    const listeErreurs = [];

    const entetes = donneesCsv[0];
    const lignesEleves = donneesCsv.slice(1).filter(row => row.length === entetes.length);

    lignesEleves.forEach((row, rowIndex) => {
      const objetEleve = {};
      entetes.forEach((header, colIndex) => {
        objetEleve[header.trim()] = row[colIndex];
      });

      const nom = objetEleve['Nom'];
      const prenom = objetEleve['Prénom'];
      const dateNaissance = objetEleve['Date de naissance'];
      const email = objetEleve['Email'];
      const sexe = objetEleve['Sexe'];
      const idClasseImportee = parseInt(objetEleve['ClasseID']);

      let estValide = true;
      let erreursLigne = [];

      if (!nom || !prenom || !dateNaissance || !email || !sexe) {
        erreursLigne.push("Champs obligatoires (Nom, Prénom, Date de naissance, Email, Sexe) manquants.");
        estValide = false;
      }
      if (isNaN(idClasseImportee) || idClasseImportee !== classeSelectionnee.id) {
          erreursLigne.push(`ID de classe incorrect ou ne correspond pas à la classe sélectionnée (${classeSelectionnee.id}).`);
          estValide = false;
      }

      if (estValide) {
        nouveauxElevesAAjouter.push({
          id: Math.max(...eleves.map(s => s.id), ...nouveauxElevesAAjouter.map(s => s.id), 0) + 1,
          nom: nom,
          prenom: prenom,
          dateNaissance: dateNaissance,
          email: email,
          telephone: objetEleve['Téléphone'] || null,
          adresse: objetEleve['Adresse'] || null,
          sexe: sexe,
          parentIds: objetEleve['ID_Parent(s)'] ? objetEleve['ID_Parent(s)'].split(';').map(id => parseInt(id.trim())).filter(Number.isFinite) : [],
          classeId: idClasseImportee,
        });
        compteSucces++;
      } else {
        compteErreurs++;
        listeErreurs.push(`Ligne ${rowIndex + 2}: ${erreursLigne.join(' ')}`);
      }
    });

    setResultatsImportation({
      total: lignesEleves.length,
      success: compteSucces,
      errors: compteErreurs,
      warnings: 0,
      errorDetails: listeErreurs
    });
    console.log('Import traité. Nouveaux élèves (simulés) :', nouveauxElevesAAjouter);
    console.log('Résultats détaillés:', {success: compteSucces, errors: compteErreurs, details: listeErreurs});
  };

  const telechargerModele = () => {
    const blob = new Blob([modeleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modele_import_eleves_classe_${classeSelectionnee?.nom || 'generique'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    console.log('Téléchargement du modèle CSV');
  };

  const afficherEtape1 = () => (
    <div className="text-center space-y-6 p-4">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <Download className="w-12 h-12 text-blue-600" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900">Télécharger le modèle CSV</h3>
        <p className="text-gray-600 mt-2">
          Commencez par télécharger notre modèle CSV pré-rempli pour la classe <span className="font-bold">{classeSelectionnee?.nom || 'sélectionnée'}.</span>
        </p>
      </div>

      <Button onClick={telechargerModele} icon={Download}>
        Télécharger le modèle
      </Button>

      <div className="text-left bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Le modèle contient les colonnes suivantes :</h4>
        <pre className="text-sm text-gray-700 whitespace-pre-wrap break-all">{modeleCsv.split('\n')[0]}</pre>
        <p className="text-sm text-gray-600 mt-2">
            **Les colonnes 'ClasseID' et 'ClasseNom' sont déjà renseignées pour cette importation.**
        </p>
      </div>

      <Button onClick={() => setEtapeActuelle(2)} variant="outline">
        Étape suivante
      </Button>
    </div>
  );

  const afficherEtape2 = () => (
    <div className="space-y-6 p-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-12 h-12 text-orange-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Préparer votre fichier</h3>
        <p className="text-gray-600 mt-2">
          Remplissez le modèle avec les données de vos élèves en respectant le format.
        </p>
      </div>

      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Points importants :</h4>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
              <li>• Respectez exactement les noms des colonnes de l'en-tête.</li>
              <li>• Les dates doivent être au format **AAAA-MM-JJ** (ex: 2008-03-15).</li>
              <li>• Les emails doivent être valides et uniques (si applicable).</li>
              <li>• Les **IDs de parents** doivent être séparés par un point-virgule (ex: "3;7").</li>
              <li>• **Ne modifiez pas** les colonnes 'ClasseID' et 'ClasseNom' si elles sont pré-remplies.</li>
              <li>• N'utilisez pas d'accents ou caractères spéciaux non-ASCII dans le nom du fichier.</li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setEtapeActuelle(1)}>
          Étape précédente
        </Button>
        <Button onClick={() => setEtapeActuelle(3)}>
          Fichier prêt
        </Button>
      </div>
    </div>
  );

  const afficherEtape3 = () => (
    <div className="text-center space-y-6 p-4">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Upload className="w-12 h-12 text-green-600" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900">Importer votre fichier CSV</h3>
        <p className="text-gray-600 mt-2">
          Sélectionnez le fichier CSV contenant les données des élèves.
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <input
          type="file"
          accept=".csv"
          onChange={gererTelechargementFichier}
          className="hidden"
          id="csvFile"
        />
        <label htmlFor="csvFile" className="cursor-pointer">
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">
              Cliquez pour sélectionner votre fichier CSV
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Ou glissez-déposez votre fichier ici
            </p>
          </div>
        </label>
      </div>

      {fichierCsv && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-green-800">Fichier sélectionné :</p>
              <p className="text-green-700">{fichierCsv.name}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setEtapeActuelle(2)}>
          Étape précédente
        </Button>
      </div>
    </div>
  );

  const afficherEtape4 = () => (
    <div className="space-y-6 p-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Vérification des données & Import</h3>
        <p className="text-gray-600 mt-2">
          Vérifiez l'aperçu de vos données avant de lancer l'importation finale.
        </p>
      </div>

      <Card className="p-6">
        <h4 className="font-medium text-gray-900 mb-4">Aperçu des données :</h4>
        {donneesCsv.length > 1 ? (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {donneesCsv[0]?.map((header, index) => (
                                <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {donneesCsv.slice(1, Math.min(donneesCsv.length, 6)).map((row, index) => (
                            <tr key={index}>
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {donneesCsv.length > 6 && (
                    <p className="text-sm text-gray-500 mt-2 text-center p-2">
                        ... et {donneesCsv.length - 6} autres lignes
                    </p>
                )}
            </div>
        ) : (
            <p className="text-center text-gray-500 p-4">Aucune donnée à prévisualiser ou fichier vide.</p>
        )}
      </Card>

      {!resultatsImportation ? (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setEtapeActuelle(3)}>
            Modifier le fichier
          </Button>
          <Button onClick={traiterImportation} disabled={!donneesCsv.length || donneesCsv.length < 2}>
            Lancer l'import
          </Button>
        </div>
      ) : (
        <Card className={`p-6 ${resultatsImportation.errors > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center mb-4">
            {resultatsImportation.errors > 0 ? (
                <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
            ) : (
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            )}
            <h4 className="font-medium text-gray-900">Import terminé !</h4>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{resultatsImportation.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{resultatsImportation.success}</p>
              <p className="text-sm text-gray-600">Succès</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{resultatsImportation.errors}</p>
              <p className="text-sm text-gray-600">Erreurs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{resultatsImportation.warnings}</p>
              <p className="text-sm text-gray-600">Avertissements</p>
            </div>
          </div>

          {resultatsImportation.errors > 0 && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg text-sm text-red-800 text-left">
              <h5 className="font-semibold mb-2">Détails des erreurs :</h5>
              <ul className="list-disc pl-5 space-y-1">
                {resultatsImportation.errorDetails.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Button onClick={() => {
              setEtapeActuelle(1);
              setFichierCsv(null);
              setDonneesCsv([]);
              setResultatsImportation(null);
            }}>
              Nouvel import
            </Button>
          </div>
        </Card>
      )}
    </div>
  );

  if (!classeSelectionnee) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Importation d'élèves</h1>
        <p className="text-gray-600">Erreur lors de la sélection de la classe pour l'importation.</p>
        <Card className="p-8 text-center bg-red-50 border-red-200 text-red-800">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">Classe introuvable</h3>
          <p className="text-sm mt-2">L'ID de la classe ({classeId}) n'est pas valide ou n'existe pas. Veuillez revenir à la page de gestion des classes et réessayer.</p>
          <Button onClick={() => navigate('/admin/classes')} className="mt-4">Retour à la gestion des classes</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import d'élèves pour la classe {classeSelectionnee.nom}</h1>
        <p className="text-gray-600">Importer des élèves en masse via fichier CSV pour la classe sélectionnée.</p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <p className="text-blue-800 font-medium">
            Vous importez des élèves dans la classe : <span className="font-bold">{classeSelectionnee.nom} (ID: {classeSelectionnee.id})</span>
          </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          {etapes.map((etape, index) => (
            <React.Fragment key={etape.id}>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  etapeActuelle >= etape.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <etape.icon className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    etapeActuelle >= etape.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    Étape {etape.id}
                  </p>
                  <p className="text-xs text-gray-500">{etape.name}</p>
                </div>
              </div>
              {index < etapes.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  etapeActuelle > etape.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      <Card className="p-0">
        {etapeActuelle === 1 && afficherEtape1()}
        {etapeActuelle === 2 && afficherEtape2()}
        {etapeActuelle === 3 && afficherEtape3()}
        {etapeActuelle === 4 && afficherEtape4()}
      </Card>
    </div>
  );
};

export default ImportEleves;