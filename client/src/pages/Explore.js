import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  fetchPublications, 
  fetchPopularPublications, 
  fetchRecentPublications 
} from '../store/slices/publicationsSlice';
import PublicationCard from '../components/publications/PublicationCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  MapPinIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const Explore = () => {
  const dispatch = useDispatch();
  const { publications, loading, error } = useSelector((state) => state.publications);
  
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');

  const loadPublications = () => {
    switch (sortBy) {
      case 'popular':
        dispatch(fetchPopularPublications());
        break;
      case 'recent':
        dispatch(fetchRecentPublications());
        break;
      default:
        dispatch(fetchPublications());
    }
  };

  useEffect(() => {
    loadPublications();
  }, [sortBy, dispatch]);

  const filteredPublications = publications?.filter(publication => {
    // Filtro por estado
    let matchesFilter = true;
    if (filter === 'available') matchesFilter = publication.status === 'available';
    if (filter === 'completed') matchesFilter = publication.status === 'completed';
    
    // Filtro por búsqueda
    let matchesSearch = true;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      matchesSearch = 
        publication.title?.toLowerCase().includes(searchLower) ||
        publication.description?.toLowerCase().includes(searchLower) ||
        publication.category?.toLowerCase().includes(searchLower);
    }
    
    return matchesFilter && matchesSearch;
  }) || [];

  if (loading) {
    return <LoadingSpinner message="Cargando publicaciones..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadPublications}
            className="btn-primary"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Explorar Intercambios
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre productos y servicios increíbles disponibles para intercambio en tu comunidad
            </p>
          </div>

          {/* Barra de búsqueda */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar productos, servicios, categorías..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-4 justify-center">
            {/* Filtro por estado */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="available">Disponibles</option>
                <option value="completed">Completados</option>
              </select>
            </div>

            {/* Ordenar por */}
            <div className="flex items-center space-x-2">
              <TagIcon className="h-5 w-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recent">Más recientes</option>
                <option value="popular">Más populares</option>
                <option value="all">Todos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container py-8">
        {filteredPublications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No se encontraron publicaciones
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `No hay resultados para "${searchTerm}". Intenta con otros términos de búsqueda.`
                : 'No hay publicaciones disponibles en este momento.'
              }
            </p>
            <div className="space-x-4">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                  setSortBy('recent');
                }}
                className="btn-secondary"
              >
                Limpiar filtros
              </button>
              <Link to="/publications/create" className="btn-primary">
                Crear publicación
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Estadísticas */}
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                Mostrando {filteredPublications.length} de {publications.length} publicaciones
              </p>
            </div>

            {/* Grid de publicaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPublications.map((publication) => (
                <PublicationCard 
                  key={publication._id} 
                  publication={publication} 
                />
              ))}
            </div>

            {/* Paginación (placeholder para futuras mejoras) */}
            <div className="mt-12 text-center">
              <p className="text-gray-500 text-sm">
                Mostrando todas las publicaciones disponibles
              </p>
            </div>
          </>
        )}
      </div>

      {/* Call to action */}
      <div className="bg-blue-50 border-t">
        <div className="container py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Crea tu propia publicación y encuentra personas interesadas en intercambiar contigo
          </p>
          <Link to="/publications/create" className="btn-primary">
            Crear nueva publicación
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Explore;