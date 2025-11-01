import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleFavorite } from '../../store/slices/publicationsSlice';

const PublicationCard = ({ publication }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (user) {
      dispatch(toggleFavorite(publication._id));
    }
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (publication.images && publication.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === publication.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (publication.images && publication.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? publication.images.length - 1 : prev - 1
      );
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryLabel = (category) => {
    const categories = {
      electronics: 'Electrónicos',
      clothing: 'Ropa',
      books: 'Libros',
      home: 'Hogar',
      sports: 'Deportes',
      toys: 'Juguetes',
      other: 'Otros'
    };
    return categories[category] || category;
  };

  const getConditionLabel = (condition) => {
    const conditions = {
      new: 'Nuevo',
      'like-new': 'Como nuevo',
      good: 'Bueno',
      fair: 'Regular'
    };
    return conditions[condition] || condition;
  };

  const getConditionColor = (condition) => {
    const colors = {
      new: 'bg-green-100 text-green-800',
      'like-new': 'bg-blue-100 text-blue-800',
      good: 'bg-yellow-100 text-yellow-800',
      fair: 'bg-orange-100 text-orange-800'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Link 
      to={`/publications/${publication._id}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      {/* Imagen */}
      <div className="relative h-48 bg-gray-200">
        {publication.images && publication.images.length > 0 ? (
          <>
            <img
              src={publication.images[currentImageIndex]}
              alt={publication.title}
              className="w-full h-full object-cover"
            />
            
            {/* Navegación de imágenes */}
            {publication.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-opacity"
                >
                  <i className="fas fa-chevron-left text-sm"></i>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-opacity"
                >
                  <i className="fas fa-chevron-right text-sm"></i>
                </button>
                
                {/* Indicadores */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {publication.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="fas fa-image text-4xl text-gray-400"></i>
          </div>
        )}

        {/* Botón de favorito */}
        {user && (
          <button
            onClick={handleFavoriteToggle}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              publication.isFavorite
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white bg-opacity-80 text-gray-600 hover:bg-opacity-100'
            }`}
          >
            <i className={`fas fa-heart text-sm ${publication.isFavorite ? '' : 'far'}`}></i>
          </button>
        )}

        {/* Badge de condición */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(publication.condition)}`}>
            {getConditionLabel(publication.condition)}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Título */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {publication.title}
        </h3>

        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {publication.description}
        </p>

        {/* Categoría y ubicación */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span className="flex items-center">
            <i className="fas fa-tag mr-1"></i>
            {getCategoryLabel(publication.category)}
          </span>
          <span className="flex items-center">
            <i className="fas fa-map-marker-alt mr-1"></i>
            {publication.location}
          </span>
        </div>

        {/* Usuario y fecha */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {publication.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {publication.user?.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(publication.createdAt)}
              </p>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span className="flex items-center">
              <i className="fas fa-eye mr-1"></i>
              {publication.views || 0}
            </span>
            <span className="flex items-center">
              <i className="fas fa-heart mr-1"></i>
              {publication.favoritesCount || 0}
            </span>
          </div>
        </div>

        {/* Estado */}
        {publication.status && publication.status !== 'active' && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              publication.status === 'completed' 
                ? 'bg-green-100 text-green-800'
                : publication.status === 'paused'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {publication.status === 'completed' && 'Intercambiado'}
              {publication.status === 'paused' && 'Pausado'}
              {publication.status === 'inactive' && 'Inactivo'}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default PublicationCard;