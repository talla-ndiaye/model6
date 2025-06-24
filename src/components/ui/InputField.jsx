import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const InputField = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  showPasswordToggle = false,
  icon: Icon,
  name
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password') 
    : type;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-terre-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm
            placeholder-gray-400 text-gray-900
            focus:outline-none focus:ring-2 focus:ring-fleuve-500 focus:border-fleuve-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-all duration-200
            ${error ? 'border-terre-300 focus:border-terre-500 focus:ring-terre-500' : ''}
            ${Icon ? 'pl-10' : ''}
            ${showPasswordToggle ? 'pr-10' : ''}
          `}
        />
        
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-terre-600 animate-slide-down">{error}</p>
      )}
    </div>
  );
};

export default InputField;