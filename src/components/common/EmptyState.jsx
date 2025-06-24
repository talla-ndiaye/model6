import React from 'react';
import { FileX } from 'lucide-react';
import Button from '../ui/Button';

const EmptyState = ({ 
  icon: Icon = FileX,
  title = "Aucune donnée",
  description = "Il n'y a rien à afficher pour le moment.",
  action,
  actionLabel = "Ajouter",
  className = '' 
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <Button onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;