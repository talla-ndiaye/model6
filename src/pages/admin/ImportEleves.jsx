import { AlertCircle, BookOpen, CheckCircle, Download, FileText, Upload } from 'lucide-react'; // Added BookOpen for class info
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
// InputField is not strictly needed for this file anymore if direct import is not done manually
// import InputField from '../../components/ui/InputField';
import { classes, eleves } from '../../data/donneesTemporaires'; // Assuming eleves is needed to update the list, and classes for class name

const ImportEleves = () => {
  const { classeId } = useParams(); // Get classeId from URL parameters
  const navigate = useNavigate();

  // Find the class details based on the URL ID
  const selectedClass = useMemo(() => {
    return classes.find(c => c.id === parseInt(classeId));
  }, [classes, classeId]);

  // States for the multi-step import process
  const [currentStep, setCurrentStep] = useState(1);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]); // Raw parsed CSV data
  const [importResults, setImportResults] = useState(null); // Results of the import simulation

  const steps = [
    { id: 1, name: 'Télécharger le modèle', icon: Download },
    { id: 2, name: 'Préparer le fichier', icon: FileText },
    { id: 3, name: 'Importer le CSV', icon: Upload },
    { id: 4, name: 'Vérification & Import', icon: CheckCircle } // Renamed for clarity
  ];

  // --- Dynamic CSV Template based on selectedClass ---
  const csvTemplate = useMemo(() => {
    // If a class is selected, include its ID and Name. Otherwise, leave them blank or provide placeholders.
    const classeIdValue = selectedClass ? selectedClass.id : '';
    const classNameValue = selectedClass ? selectedClass.nom : '';

    return `Nom,Prénom,Date de naissance,Email,Téléphone,Adresse,Sexe,ID_Parent(s),ClasseID,ClasseNom
Dupont,Jean,2008-03-15,jean.dupont@exemple.fr,771234567,123 Rue de la Paix,M,"3,7",${classeIdValue},"${classNameValue}"
Martin,Sophie,2009-07-22,sophie.martin@exemple.fr,789876543,456 Avenue des Champs,F,"",${classeIdValue},"${classNameValue}"`;
  }, [selectedClass]); // Regenerate template if selectedClass changes

  // --- File Handling ---
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        // Basic CSV parsing
        const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim())); // Trim whitespace
        setCsvData(rows);
        setCurrentStep(4); // Move to verification step
        console.log('Fichier CSV chargé:', rows);
      };
      reader.readAsText(file);
    } else {
        alert("Veuillez sélectionner un fichier CSV valide.");
        setCsvFile(null);
        setCsvData([]);
    }
  };

  // --- Import Simulation Logic ---
  const processImport = () => {
    // In a real application:
    // 1. Send csvData to a backend API endpoint (e.g., /api/import-eleves)
    // 2. Backend validates data, adds students to DB, updates class counts
    // 3. Backend returns detailed results (success, errors, warnings)

    // For this simulation:
    // - Assume header is first row: `Nom,Prénom,Date de naissance,Email,Téléphone,Adresse,Sexe,ID_Parent(s),ClasseID,ClasseNom`
    // - Validate basic fields and class ID match
    // - Simulate adding to 'eleves' temporary data
    const newStudentsToAdd = [];
    let successCount = 0;
    let errorCount = 0;
    const errorsList = [];

    const headers = csvData[0]; // Get headers from first row
    const studentRows = csvData.slice(1).filter(row => row.length === headers.length); // Get data rows, ensuring consistent length

    studentRows.forEach((row, rowIndex) => {
      const studentObj = {};
      headers.forEach((header, colIndex) => {
        studentObj[header.trim()] = row[colIndex]; // Map column data to object property
      });

      // Basic validation (can be much more robust)
      const nom = studentObj['Nom'];
      const prenom = studentObj['Prénom'];
      const dateNaissance = studentObj['Date de naissance'];
      const email = studentObj['Email'];
      const sexe = studentObj['Sexe'];
      const importedClasseId = parseInt(studentObj['ClasseID']); // Class ID from CSV
      
      let isValid = true;
      let rowErrors = [];

      if (!nom || !prenom || !dateNaissance || !email || !sexe) {
        rowErrors.push("Champs obligatoires (Nom, Prénom, Date de naissance, Email, Sexe) manquants.");
        isValid = false;
      }
      if (isNaN(importedClasseId) || importedClasseId !== selectedClass.id) {
          rowErrors.push(`ID de classe incorrect ou ne correspond pas à la classe sélectionnée (${selectedClass.id}).`);
          isValid = false;
      }
      // Add more validation rules as needed (e.g., date format, email format, phone format)

      if (isValid) {
        newStudentsToAdd.push({
          id: Math.max(...eleves.map(s => s.id), ...newStudentsToAdd.map(s => s.id), 0) + 1, // Generate unique ID
          nom: nom,
          prenom: prenom,
          dateNaissance: dateNaissance,
          email: email,
          telephone: studentObj['Téléphone'] || null,
          adresse: studentObj['Adresse'] || null,
          sexe: sexe,
          parentIds: studentObj['ID_Parent(s)'] ? studentObj['ID_Parent(s)'].split(';').map(id => parseInt(id.trim())).filter(Number.isFinite) : [], // Parse parent IDs
          classeId: importedClasseId,
        });
        successCount++;
      } else {
        errorCount++;
        errorsList.push(`Ligne ${rowIndex + 2}: ${rowErrors.join(' ')}`); // Row + 2 because of header and 0-indexing
      }
    });

    // Simulate updating global eleves data (in a real app, this would be done by backend)
    // For demo, we just log and show results.
    // In a real app, you'd add this to your eleves array state if eleves was managed at a higher level.
    // setEleves(prevEleves => [...prevEleves, ...newStudentsToAdd]); // Uncomment if eleves is state in this component

    setImportResults({
      total: studentRows.length,
      success: successCount,
      errors: errorCount,
      warnings: 0, // Not simulating warnings for now
      errorDetails: errorsList
    });
    console.log('Import traité. Nouveaux élèves (simulés) :', newStudentsToAdd);
    console.log('Résultats détaillés:', {success: successCount, errors: errorCount, details: errorsList});
  };

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modele_import_eleves_classe_${selectedClass?.nom || 'generique'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    console.log('Téléchargement du modèle CSV');
  };

  // --- Render Functions for Steps ---
  const renderStep1 = () => (
    <div className="text-center space-y-6 p-4">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <Download className="w-12 h-12 text-blue-600" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900">Télécharger le modèle CSV</h3>
        <p className="text-gray-600 mt-2">
          Commencez par télécharger notre modèle CSV pré-rempli pour la classe <span className="font-bold">{selectedClass?.nom || 'sélectionnée'}.</span>
        </p>
      </div>

      <Button onClick={downloadTemplate} icon={Download}>
        Télécharger le modèle
      </Button>

      <div className="text-left bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Le modèle contient les colonnes suivantes :</h4>
        <pre className="text-sm text-gray-700 whitespace-pre-wrap break-all">{csvTemplate.split('\n')[0]}</pre>
        <p className="text-sm text-gray-600 mt-2">
            **Les colonnes 'ClasseID' et 'ClasseNom' sont déjà renseignées pour cette importation.**
        </p>
      </div>

      <Button onClick={() => setCurrentStep(2)} variant="outline">
        Étape suivante
      </Button>
    </div>
  );

  const renderStep2 = () => (
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
        {csvData.length > 1 ? ( // Check if there's header + at least one data row
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
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
                        {csvData.slice(1, Math.min(csvData.length, 6)).map((row, index) => ( // Show max 5 data rows
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
                {csvData.length > 6 && ( // If more than 5 data rows (+1 header)
                    <p className="text-sm text-gray-500 mt-2 text-center p-2">
                        ... et {csvData.length - 6} autres lignes
                    </p>
                )}
            </div>
        ) : (
            <p className="text-center text-gray-500 p-4">Aucune donnée à prévisualiser ou fichier vide.</p>
        )}
      </Card>

      {!importResults ? (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(3)}>
            Modifier le fichier
          </Button>
          <Button onClick={processImport} disabled={!csvData.length || csvData.length < 2}> {/* Disable if no data or only header */}
            Lancer l'import
          </Button>
        </div>
      ) : (
        <Card className={`p-6 ${importResults.errors > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center mb-4">
            {importResults.errors > 0 ? (
                <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
            ) : (
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            )}
            <h4 className="font-medium text-gray-900">Import terminé !</h4>
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

          {importResults.errors > 0 && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg text-sm text-red-800 text-left">
              <h5 className="font-semibold mb-2">Détails des erreurs :</h5>
              <ul className="list-disc pl-5 space-y-1">
                {importResults.errorDetails.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

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

  // --- Main Render Logic ---
  // Display error if class is not found (e.g., direct URL access with invalid ID)
  if (!selectedClass) {
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
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import d'élèves pour la classe {selectedClass.nom}</h1>
        <p className="text-gray-600">Importer des élèves en masse via fichier CSV pour la classe sélectionnée.</p>
      </div>

      {/* Class context banner */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <p className="text-blue-800 font-medium">
            Vous importez des élèves dans la classe : <span className="font-bold">{selectedClass.nom} (ID: {selectedClass.id})</span>
          </p>
      </div>


      {/* Step Indicator */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
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
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${ // Use flex-1 for dynamic line width
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Step Content */}
      <Card className="p-0"> {/* p-0 for full width content inside */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </Card>
    </div>
  );
};

export default ImportEleves;