import { useState, useMemo } from 'react';

export const useSearch = (data, searchFields = []) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return data;
    }

    const lowercaseSearchTerm = searchTerm.toLowerCase();

    return data.filter(item => {
      // Si aucun champ spécifique n'est défini, rechercher dans toutes les propriétés string
      if (searchFields.length === 0) {
        return Object.values(item).some(value => 
          typeof value === 'string' && 
          value.toLowerCase().includes(lowercaseSearchTerm)
        );
      }

      // Rechercher dans les champs spécifiés
      return searchFields.some(field => {
        const value = getNestedValue(item, field);
        return typeof value === 'string' && 
               value.toLowerCase().includes(lowercaseSearchTerm);
      });
    });
  }, [data, searchTerm, searchFields]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    clearSearch,
    hasResults: filteredData.length > 0,
    resultCount: filteredData.length
  };
};

// Fonction utilitaire pour accéder aux propriétés imbriquées
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export default useSearch;