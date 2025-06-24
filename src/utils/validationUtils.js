/**
 * Utilitaires de validation
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateNote = (note, max = 20) => {
  const numNote = parseFloat(note);
  
  if (isNaN(numNote)) {
    return { isValid: false, error: 'La note doit être un nombre' };
  }
  
  if (numNote < 0) {
    return { isValid: false, error: 'La note ne peut pas être négative' };
  }
  
  if (numNote > max) {
    return { isValid: false, error: `La note ne peut pas dépasser ${max}` };
  }
  
  return { isValid: true };
};

export const validateAge = (birthDate, minAge = 3, maxAge = 25) => {
  const today = new Date();
  const birth = new Date(birthDate);
  
  if (birth > today) {
    return { isValid: false, error: 'La date de naissance ne peut pas être dans le futur' };
  }
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  if (age < minAge) {
    return { isValid: false, error: `L'âge minimum est de ${minAge} ans` };
  }
  
  if (age > maxAge) {
    return { isValid: false, error: `L'âge maximum est de ${maxAge} ans` };
  }
  
  return { isValid: true, age };
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, error: `${fieldName} est obligatoire` };
  }
  return { isValid: true };
};

export const validateLength = (value, min, max, fieldName) => {
  if (value.length < min) {
    return { isValid: false, error: `${fieldName} doit contenir au moins ${min} caractères` };
  }
  
  if (value.length > max) {
    return { isValid: false, error: `${fieldName} ne peut pas dépasser ${max} caractères` };
  }
  
  return { isValid: true };
};

export const validateNumeric = (value, fieldName) => {
  if (isNaN(value) || value === '') {
    return { isValid: false, error: `${fieldName} doit être un nombre` };
  }
  return { isValid: true };
};

export const validateRange = (value, min, max, fieldName) => {
  const numValue = parseFloat(value);
  
  if (numValue < min) {
    return { isValid: false, error: `${fieldName} doit être supérieur ou égal à ${min}` };
  }
  
  if (numValue > max) {
    return { isValid: false, error: `${fieldName} doit être inférieur ou égal à ${max}` };
  }
  
  return { isValid: true };
};

export const validateForm = (data, rules) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const value = data[field];
    
    fieldRules.forEach(rule => {
      if (errors[field]) return; // Skip if already has error
      
      const result = rule(value);
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
      }
    });
  });
  
  return { isValid, errors };
};

// Règles de validation prédéfinies
export const validationRules = {
  required: (fieldName) => (value) => validateRequired(value, fieldName),
  email: () => (value) => {
    if (!value) return { isValid: true }; // Optional field
    return validateEmail(value) 
      ? { isValid: true } 
      : { isValid: false, error: 'Format d\'email invalide' };
  },
  phone: () => (value) => {
    if (!value) return { isValid: true }; // Optional field
    return validatePhone(value) 
      ? { isValid: true } 
      : { isValid: false, error: 'Format de téléphone invalide' };
  },
  password: () => (value) => validatePassword(value),
  note: (max = 20) => (value) => validateNote(value, max),
  age: (min = 3, max = 25) => (value) => validateAge(value, min, max),
  length: (min, max, fieldName) => (value) => validateLength(value, min, max, fieldName),
  numeric: (fieldName) => (value) => validateNumeric(value, fieldName),
  range: (min, max, fieldName) => (value) => validateRange(value, min, max, fieldName)
};