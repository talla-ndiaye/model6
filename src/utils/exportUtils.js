/**
 * Utilitaires d'export de données
 */

export const exportToCSV = (data, filename = 'export.csv', columns = null) => {
  if (!data || data.length === 0) {
    console.warn('Aucune donnée à exporter');
    return;
  }

  // Si aucune colonne spécifiée, utiliser toutes les clés du premier objet
  const headers = columns || Object.keys(data[0]);
  
  // Créer l'en-tête CSV
  const csvHeaders = headers.join(',');
  
  // Créer les lignes CSV
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Échapper les guillemets et encapsuler les valeurs contenant des virgules
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',');
  });
  
  // Combiner en-tête et lignes
  const csvContent = [csvHeaders, ...csvRows].join('\n');
  
  // Créer et télécharger le fichier
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

export const exportToJSON = (data, filename = 'export.json') => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
};

export const exportToPDF = (htmlContent, filename = 'export.pdf') => {
  // Simulation d'export PDF (nécessiterait une vraie bibliothèque comme jsPDF)
  console.log('Export PDF simulé:', filename);
  console.log('Contenu HTML:', htmlContent);
  
  // Dans un vrai projet, on utiliserait quelque chose comme :
  // const pdf = new jsPDF();
  // pdf.html(htmlContent);
  // pdf.save(filename);
};

export const generateReceiptPDF = (payment, student) => {
  const receiptHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <header style="text-align: center; margin-bottom: 30px;">
        <h1>EcoleManager</h1>
        <p>Établissement scolaire</p>
        <p>123 Rue de l'École, 75001 Paris</p>
      </header>
      
      <div style="border: 1px solid #ccc; padding: 20px; margin-bottom: 20px;">
        <h2>Reçu de paiement</h2>
        <p><strong>N° Reçu:</strong> REC-${payment.id.toString().padStart(4, '0')}</p>
        <p><strong>Date:</strong> ${new Date(payment.date).toLocaleDateString('fr-FR')}</p>
        <p><strong>Élève:</strong> ${student.prenom} ${student.nom}</p>
        <p><strong>Type:</strong> ${payment.type}</p>
        <p><strong>Montant:</strong> ${payment.montant.toFixed(2)}€</p>
        <p><strong>Méthode:</strong> ${payment.methode}</p>
        <p><strong>Statut:</strong> ${payment.statut}</p>
      </div>
      
      <footer style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
        <p>Ce reçu fait foi de paiement</p>
      </footer>
    </div>
  `;
  
  exportToPDF(receiptHTML, `recu_${payment.id}.pdf`);
};

export const generateBulletinPDF = (bulletin, student, grades) => {
  const bulletinHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <header style="text-align: center; margin-bottom: 30px;">
        <h1>EcoleManager</h1>
        <h2>Bulletin scolaire</h2>
        <p>Trimestre ${bulletin.trimestre} - Année ${bulletin.anneScolaire}</p>
      </header>
      
      <div style="margin-bottom: 20px;">
        <h3>Informations élève</h3>
        <p><strong>Nom:</strong> ${student.prenom} ${student.nom}</p>
        <p><strong>Classe:</strong> ${student.classe}</p>
        <p><strong>Moyenne générale:</strong> ${bulletin.moyenneGenerale}/20</p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="border: 1px solid #ddd; padding: 8px;">Matière</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Moyenne</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Coefficient</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Appréciation</th>
          </tr>
        </thead>
        <tbody>
          ${grades.map(grade => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${grade.matiere}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${grade.moyenne}/20</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${grade.coefficient}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${grade.appreciation}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="margin-top: 30px;">
        <p><strong>Appréciation générale:</strong></p>
        <p>${bulletin.appreciationGenerale}</p>
      </div>
    </div>
  `;
  
  exportToPDF(bulletinHTML, `bulletin_${student.nom}_T${bulletin.trimestre}.pdf`);
};

export const exportStudentList = (students, className) => {
  const exportData = students.map(student => ({
    'Nom': student.nom,
    'Prénom': student.prenom,
    'Date de naissance': new Date(student.dateNaissance).toLocaleDateString('fr-FR'),
    'Email': student.email,
    'Téléphone': student.telephone,
    'Adresse': student.adresse,
    'Classe': className
  }));
  
  exportToCSV(exportData, `liste_eleves_${className.replace(/\s+/g, '_')}.csv`);
};

export const exportGrades = (grades, period) => {
  const exportData = grades.map(grade => ({
    'Élève': `${grade.eleve.prenom} ${grade.eleve.nom}`,
    'Matière': grade.matiere.nom,
    'Note': grade.note,
    'Coefficient': grade.coefficient,
    'Type': grade.type,
    'Date': new Date(grade.date).toLocaleDateString('fr-FR'),
    'Commentaire': grade.commentaire
  }));
  
  exportToCSV(exportData, `notes_${period}.csv`);
};

export const exportPayments = (payments, period) => {
  const exportData = payments.map(payment => ({
    'Élève': `${payment.eleve.prenom} ${payment.eleve.nom}`,
    'Type': payment.type,
    'Montant': payment.montant,
    'Statut': payment.statut,
    'Date échéance': new Date(payment.dateEcheance).toLocaleDateString('fr-FR'),
    'Date paiement': payment.datePaiement ? new Date(payment.datePaiement).toLocaleDateString('fr-FR') : '',
    'Méthode': payment.methodePaiement
  }));
  
  exportToCSV(exportData, `paiements_${period}.csv`);
};

// Fonction utilitaire pour télécharger un fichier
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};