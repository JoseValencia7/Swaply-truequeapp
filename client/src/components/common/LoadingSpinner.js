import React from 'react';

/**
 * Componente LoadingSpinner para mostrar estados de carga
 * Soporta diferentes tamaños y puede usarse como overlay
 */
const LoadingSpinner = ({ 
  size = 'md', 
  overlay = false, 
  text = 'Cargando...', 
  showText = true,
  className = '' 
}) => {
  const getSizeClasses = (size) => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-8 w-8';
      case 'xl':
        return 'h-12 w-12';
      case 'md':
      default:
        return 'h-6 w-6';
    }
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`spinner ${getSizeClasses(size)}`} />
      {showText && text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

/**
 * Componente de skeleton loading para contenido
 */
export const SkeletonLoader = ({ 
  lines = 3, 
  className = '',
  avatar = false,
  title = false 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {avatar && (
        <div className="flex items-center space-x-3 mb-4">
          <div className="skeleton h-10 w-10 rounded-full" />
          <div className="flex-1">
            <div className="skeleton h-4 w-24 mb-2" />
            <div className="skeleton h-3 w-16" />
          </div>
        </div>
      )}
      
      {title && (
        <div className="skeleton h-6 w-3/4 mb-4" />
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`skeleton h-4 ${
              index === lines - 1 ? 'w-2/3' : 'w-full'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Componente de loading para cards
 */
export const CardSkeleton = ({ count = 1 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card">
          <div className="animate-pulse">
            <div className="skeleton h-48 w-full mb-4" />
            <div className="card-body">
              <div className="skeleton h-6 w-3/4 mb-2" />
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-4 w-2/3 mb-4" />
              <div className="flex justify-between items-center">
                <div className="skeleton h-8 w-20" />
                <div className="skeleton h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Componente de loading para listas
 */
export const ListSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
          <div className="skeleton h-12 w-12 rounded-full" />
          <div className="flex-1">
            <div className="skeleton h-4 w-1/4 mb-2" />
            <div className="skeleton h-3 w-3/4" />
          </div>
          <div className="skeleton h-8 w-16" />
        </div>
      ))}
    </div>
  );
};

/**
 * Componente de loading para tablas
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-6 py-3">
                <div className="skeleton h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div className="skeleton h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoadingSpinner;