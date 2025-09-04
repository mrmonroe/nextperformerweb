import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'

const DropdownMenu = ({ 
  children, 
  trigger = <MoreVertical className="h-5 w-5" />,
  className = '',
  triggerClassName = 'p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors',
  align = 'right' // 'left', 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0'
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={triggerClassName}
        aria-label="More options"
      >
        {trigger}
      </button>
      
      {isOpen && (
        <div className={`absolute z-50 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 ${alignmentClasses[align]}`}>
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export const DropdownItem = ({ 
  children, 
  onClick, 
  icon: Icon,
  className = 'flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer',
  disabled = false
}) => {
  return (
    <button
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon className="h-4 w-4 mr-3" />}
      {children}
    </button>
  )
}

export default DropdownMenu
