import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = true,
  onClick,
  padding = 'p-6',
  shadow = 'md',
  border = true
}) => {
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  return (
    <div 
      className={`
        bg-white rounded-xl border-gray-100
        ${border ? 'border' : ''}
        ${shadowClasses[shadow]}
        ${hover ? 'hover:shadow-lg transition-all duration-200' : ''}
        ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}
        ${padding}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;