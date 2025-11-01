import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  HeartIcon,
  EyeIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { 
  fetchPublications, 
  toggleFavorite,
  clearPublications 
} from '../../store/slices/publicationSlice';
import LoadingSpinner, { CardSkeleton } from '../common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente para mostrar la lista de publicaciones
 * Incluye filtros, búsqueda y paginación
 */
const PublicationList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    type: searchParams.get('type') || '',
    condition: searchParams.get('condition') || '',
    location: searchParams.get('location') || '',
    minValue: searchParams.get('minValue') || '',
    maxValue: searchParams.get('maxValue') || '',
    sortBy: searchParams.get('sortBy') || 'recent'
  });

  const dispatch = useDispatch();
  const { 
    publications, 
    isLoading, 
    hasMore, 
    currentPage,
    totalPages 
  } = useSelector(state => state.publications);
  const { user } = useSelector(state => state.auth);

  // Categorías disponibles
  const categories = [
    { value: '', label: 'Todas las categorías' },
    { value: 'electronics', label: 'Electrónicos' },
    { value: 'clothing', label: 'Ropa y Accesorios' },
    { value: 'books', label: 'Libros y Medios' },
    { value: 'sports', label: 'Deportes y Recreación' },
    { value: 'home', label: 'Hogar y Jardín' },
    { value: 'vehicles', label: 'Vehículos' },
    { value: 'tools', label: 'Herramientas' },
    { value: 'toys', label: 'Juguetes y Juegos' },
    { value: 'art', label: 'Arte y Manualidades' },
    { value: 'music', label: 'Instrumentos Musicales' },
    { value: 'other', label: 'Otros' }
  ];

  // Opciones de ordenamiento
  const sortOptions = [
    { value: 'recent', label: 'Más recientes' },
    { value: 'oldest', label: 'Más antiguos' },
    { value: 'popular', label: 'Más populares' },
    { value: 'value_high', label: 'Valor: Mayor a menor' },
    { value: 'value_low', label: 'Valor: Menor a mayor' }
  ];

  // Cargar publicaciones
  const loadPublications = useCallback((page = 1, reset = false) => {
    const params = {
      page,
      limit: 12,
      ...filters
    };

    dispatch(fetchPublications({ params, reset }));
  }, [dispatch, filters]);

  // Efecto para cargar publicaciones cuando cambien los filtros
  useEffect(() => {
    loadPublications(1, true);
  }, [loadPublications]);

  // Actualizar URL cuando cambien los filtros
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Manejar cambios en filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      type: '',
      condition: '',
      location: '',
      minValue: '',
      maxValue: '',
      sortBy: 'recent'
    });
  };

  // Manejar favoritos
  const handleToggleFavorite = async (publicationId) => {
    if (!user) {
      // Redireccionar a login
      return;
    }
    
    try {
      await dispatch(toggleFavorite(publicationId)).unwrap();
    } catch (error) {
      console.error('Error al cambiar favorito:', error);
    }
  };

  // Cargar más publicaciones
  const loadMore = () => {
    if (hasMore && !isLoading) {
      loadPublications(currentPage + 1, false);
    }
  };

  // Formatear valor
  const formatValue = (value) => {
    if (!value) return null;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Componente de tarjeta de publicación
  const PublicationCard = ({ publication }) => {
    const isFavorite = user && publication.favorites?.includes(user.id);
    
    return (
      <div className="card hover:shadow-lg transition-shadow duration-200">
        <div className="relative">
          <Link to={`/publications/${publication.id}`}>
            <img
              src={publication.images?.[0] || '/placeholder-image.jpg'}
              alt={publication.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          </Link>
          
          {/* Tipo de publicación */}
          <div className="absolute top-2 left-2">
            <span className={`badge ${
              publication.type === 'offer' 
                ? 'badge-success' 
                : 'badge-primary'
            }`}>
              {publication.type === 'offer' ? 'Ofrezco' : 'Busco'}
            </span>
          </div>

          {/* Botón de favorito */}
          {user && (
            <button
              onClick={() => handleToggleFavorite(publication.id)}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              {isFavorite ? (
                <HeartSolidIcon className="h-5 w-5 text-error-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          )}
        </div>

        <div className="card-body">
          <Link to={`/publications/${publication.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
              {publication.title}
            </h3>
          </Link>
          
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {publication.description}
          </p>

          {/* Información adicional */}
          <div className="mt-3 space-y-2">
            {publication.estimatedValue && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium text-primary-600">
                  {formatValue(publication.estimatedValue)}
                </span>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-500">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span className="truncate">{publication.location}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>
                  {formatDistanceToNow(new Date(publication.createdAt), {
                    addSuffix: true,
                    locale: es
                  })}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  <span>{publication.views || 0}</span>
                </div>
                <div className="flex items-center">
                  <HeartIcon className="h-4 w-4 mr-1" />
                  <span>{publication.favorites?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {publication.tags && publication.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {publication.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="badge badge-secondary text-xs">
                  {tag}
                </span>
              ))}
              {publication.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{publication.tags.length - 3} más
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Explorar intercambios
        </h1>
        <p className="text-gray-600">
          Descubre artículos increíbles para intercambiar en tu comunidad
        </p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="mb-8 space-y-4">
        {/* Búsqueda principal */}
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input pl-10"
              placeholder="Buscar publicaciones..."
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filtros
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="card">
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Categoría */}
                <div>
                  <label className="label">Categoría</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo */}
                <div>
                  <label className="label">Tipo</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="input"
                  >
                    <option value="">Todos</option>
                    <option value="offer">Ofertas</option>
                    <option value="request">Solicitudes</option>
                  </select>
                </div>

                {/* Condición */}
                <div>
                  <label className="label">Condición</label>
                  <select
                    value={filters.condition}
                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                    className="input"
                  >
                    <option value="">Todas</option>
                    <option value="new">Nuevo</option>
                    <option value="like_new">Como nuevo</option>
                    <option value="good">Buen estado</option>
                    <option value="fair">Estado regular</option>
                    <option value="poor">Necesita reparación</option>
                  </select>
                </div>

                {/* Ordenar por */}
                <div>
                  <label className="label">Ordenar por</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="input"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ubicación */}
                <div>
                  <label className="label">Ubicación</label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="input"
                    placeholder="Ciudad, país..."
                  />
                </div>

                {/* Rango de valor */}
                <div>
                  <label className="label">Valor mínimo</label>
                  <input
                    type="number"
                    value={filters.minValue}
                    onChange={(e) => handleFilterChange('minValue', e.target.value)}
                    className="input"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="label">Valor máximo</label>
                  <input
                    type="number"
                    value={filters.maxValue}
                    onChange={(e) => handleFilterChange('maxValue', e.target.value)}
                    className="input"
                    placeholder="Sin límite"
                    min="0"
                  />
                </div>

                {/* Botón limpiar */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="btn btn-ghost w-full"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {publications.length > 0 && (
              <>Mostrando {publications.length} publicaciones</>
            )}
          </p>
          
          {/* Botón crear publicación */}
          {user && (
            <Link to="/publications/create" className="btn btn-primary">
              Crear publicación
            </Link>
          )}
        </div>
      </div>

      {/* Grid de publicaciones */}
      {isLoading && publications.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : publications.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {publications.map(publication => (
              <PublicationCard key={publication.id} publication={publication} />
            ))}
          </div>

          {/* Botón cargar más */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="btn btn-secondary"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" showText={false} />
                    <span className="ml-2">Cargando...</span>
                  </div>
                ) : (
                  'Cargar más'
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron publicaciones
          </h3>
          <p className="text-gray-600 mb-6">
            Intenta ajustar tus filtros de búsqueda o explora otras categorías.
          </p>
          {user && (
            <Link to="/publications/create" className="btn btn-primary">
              Crear la primera publicación
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicationList;