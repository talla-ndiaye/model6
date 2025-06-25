
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  loading = false,
  fullWidth = false
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-fleuve-500 hover:bg-fleuve-600 text-white focus:ring-fleuve-500 shadow-md hover:shadow-lg',
    secondary: 'bg-soleil-500 hover:bg-soleil-600 text-white focus:ring-soleil-500 shadow-md hover:shadow-lg',
    success: 'bg-acacia-500 hover:bg-acacia-600 text-white focus:ring-acacia-500 shadow-md hover:shadow-lg',
    danger: 'bg-red-600 hover:bg-red-600 text-white focus:ring-red-500 shadow-md hover:shadow-lg',
    warning: 'bg-soleil-400 hover:bg-soleil-500 text-white focus:ring-soleil-400 shadow-md hover:shadow-lg',
    outline: 'border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-fleuve-500 hover:border-gray-400',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-fleuve-500',
    link: 'bg-transparent hover:bg-transparent text-fleuve-500 hover:text-fleuve-600 focus:ring-fleuve-500 underline-offset-4 hover:underline'
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type={type}
      className={`
        ${baseClasses} 
        ${variants[variant]} 
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? disabledClasses : ''}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
      ) : Icon ? (
        <Icon className={`${size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} ${children ? 'mr-2' : ''}`} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;