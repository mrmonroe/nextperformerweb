import React from 'react'

const ActionButton = ({ 
  variant = 'outline', // 'primary', 'outline', 'danger'
  size = 'sm', // 'sm', 'md', 'lg'
  icon: Icon,
  onClick,
  children,
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'flex items-center space-x-1 px-3 py-2 font-medium transition-colors'
  
  const variantClasses = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    danger: 'btn-outline text-red-600 hover:text-red-700 hover:border-red-300'
  }
  
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md', 
    lg: 'btn-lg'
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
  
  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {loading ? 'Loading...' : children}
    </button>
  )
}

export default ActionButton
