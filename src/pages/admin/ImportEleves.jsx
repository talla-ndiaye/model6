import React, { useState } from 'react';
import { Upload, Download, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const ImportEleves = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [importResults, setImportResults] = useState(null);

  const steps = [
    { id: 1, name: 'Télécharger le modèle', icon: Download },
    { id: 2, name: 'Préparer le fichier', icon: FileText },
    { id: 3, name: 'Importer le CSV', icon: Upload },
    { id: 4, name: 'Vérification', icon: CheckCircle }
  ];

  const csvExample = `Nom,Prénom,Date de naissance,Email,Téléphone,Adresse,Classe
Dupont,Jean,2008-03-15,jean.dupont@exemple.fr,0123456789,"123 Rue de la Paix Paris",3ème A
Martin,Sophie,2009-07-22,sophie.martin@exemple.fr,0123456788,"456 Avenue des Champs Lyon",4ème B`;

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split('\n').map(row => row.split(','));
        setCsvData(rows);
        setCurrentStep(4);
        console.log('Fichier CSV chargé:', rows);
      };
      reader.readAsText(file);
    }
  };

  const processImport = () => {
    // Simulation du traitement d'import
    const results = {
      total: csvData.length - 1, // -1 pour exclure l'en-tête
      success: csvData.length - 2, // Simuler 1 erreur
      errors: 1,
      warnings: 0
    };
    
    setImportResults(results);
    console.log('Import traité:', results);
  };

  const downloadTemplate = () => {
    const blob = new Blob([csvExample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modele_import_eleves.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    console.log('Téléchargement du modèle CSV');
  };

  const renderStep1 = () => (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <Download className="w-12 h-12 text-blue-600" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Télécharger le modèle CSV</h3>
        <p className="text-gray-600 mt-2">
          Commencez par télécharger notre modèle CSV pour vous assurer que vos données sont au bon format.
        </p>
      </div>

      <Button onClick={downloadTemplate} icon={Download}>
        Télécharger le modèle
      </Button>

      <div className="text-left bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Le modèle contient les colonnes suivantes :</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Nom (obligatoire)</li>
          <li>• Prénom (obligatoire)</li>
          <li>• Date de naissance (format: AAAA-MM-JJ)</li>
          <li>• Email (obligatoire)</li>
          <li>• Téléphone</li>
          <li>• Adresse</li>
          <li>• Classe (nom de la classe existante)</li>
        </ul>
      </div>

      <Button onClick={() => setCurrentStep(2)} variant="outline">
        Étape suivante
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
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
              <li>• Respectez exactement les noms des colonnes</li>
              <li>• Les dates doivent être au format AAAA-MM-JJ</li>
              <li>• Les emails doivent être valides et uniques</li>
              <li>• Les classes mentionnées doivent exister dans le système</li>
              <li>• N'utilisez pas d'accents dans les noms de fichiers</li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          Étape précédente
        </Button>
        <Button onClick={() => setCurrentStep(3)}>
          Fichier prêt
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center space-y-6">
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
          onChange={handleFileUpload}
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

      {csvFile && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-green-800">Fichier sélectionné :</p>
              <p className="text-green-700">{csvFile.name}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(2)}>
          Étape précédente
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Vérification des données</h3>
        <p className="text-gray-600 mt-2">
          Vérifiez les données avant de finaliser l'import.
        </p>
      </div>

      <Card className="p-6">
        <h4 className="font-medium text-gray-900 mb-4">Aperçu des données :</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {csvData[0]?.map((header, index) => (
                  <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {csvData.slice(1, 4).map((row, index) => (
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
        </div>
        {csvData.length > 4 && (
          <p className="text-sm text-gray-500 mt-2">
            ... et {csvData.length - 4} autres lignes
          </p>
        )}
      </Card>

      {!importResults ? (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(3)}>
            Modifier le fichier
          </Button>
          <Button onClick={processImport}>
            Lancer l'import
          </Button>
        </div>
      ) : (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <h4 className="font-medium text-green-800">Import terminé !</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{importResults.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{importResults.success}</p>
              <p className="text-sm text-gray-600">Succès</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{importResults.errors}</p>
              <p className="text-sm text-gray-600">Erreurs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{importResults.warnings}</p>
              <p className="text-sm text-gray-600">Avertissements</p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button onClick={() => {
              setCurrentStep(1);
              setCsvFile(null);
              setCsvData([]);
              setImportResults(null);
            }}>
              Nouvel import
            </Button>
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import d'élèves</h1>
        <p className="text-gray-600">Importer des élèves en masse via fichier CSV</p>
      </div>

      {/* Indicateur d'étapes */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                <step.icon className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  Étape {step.id}
                </p>
                <p className="text-xs text-gray-500">{step.name}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 ml-6 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Contenu de l'étape */}
      <Card className="p-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </Card>
    </div>
  );
};

export default ImportEleves;