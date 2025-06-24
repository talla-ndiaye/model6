/**
 * Utilitaires de formatage
 */

export const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatNumber = (number, decimals = 0) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

export const formatPercentage = (value, decimals = 1) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
};

export const formatName = (firstName, lastName) => {
  if (!firstName && !lastName) return '';
  if (!firstName) return lastName;
  if (!lastName) return firstName;
  return `${firstName} ${lastName}`;
};

export const formatInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${first}${last}`;
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Supprimer tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  
  // Format français standard
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  return phone;
};

export const formatStudentNumber = (year, sequence) => {
  return `${year}-${String(sequence).padStart(4, '0')}`;
};

export const formatGrade = (grade, maxGrade = 20) => {
  if (grade === null || grade === undefined) return '-';
  return `${formatNumber(grade, 2)}/${maxGrade}`;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text) => {
  if (!text) return '';
  return text.split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

export const formatAddress = (address) => {
  if (!address) return '';
  
  // Si c'est un objet avec des propriétés séparées
  if (typeof address === 'object') {
    const parts = [
      address.street,
      address.city,
      address.postalCode,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  }
  
  return address;
};

export const formatTimeSlot = (startTime, endTime) => {
  return `${startTime} - ${endTime}`;
};

export const formatClassLevel = (level) => {
  const levels = {
    '6': '6ème',
    '5': '5ème',
    '4': '4ème',
    '3': '3ème',
    '2': '2nde',
    '1': '1ère',
    'T': 'Terminale'
  };
  
  return levels[level] || level;
};

export const formatSubjectCode = (name) => {
  if (!name) return '';
  
  // Extraire les premières lettres des mots principaux
  const words = name.split(' ');
  if (words.length === 1) {
    return words[0].substring(0, 4).toUpperCase();
  }
  
  return words
    .filter(word => word.length > 2) // Ignorer les mots courts comme "et", "de"
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 4);
};

export const formatPaymentStatus = (status) => {
  const statuses = {
    'en_attente': 'En attente',
    'paye': 'Payé',
    'en_retard': 'En retard',
    'annule': 'Annulé'
  };
  
  return statuses[status] || status;
};

export const formatUserRole = (role) => {
  const roles = {
    'admin': 'Administrateur',
    'enseignant': 'Enseignant',
    'parent': 'Parent',
    'eleve': 'Élève',
    'comptable': 'Comptable'
  };
  
  return roles[role] || role;
};

export const formatAbsenceType = (type) => {
  const types = {
    'maladie': 'Maladie',
    'familiale': 'Raison familiale',
    'autre': 'Autre',
    'non_justifiee': 'Non justifiée'
  };
  
  return types[type] || type;
};