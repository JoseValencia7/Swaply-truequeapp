import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  fetchPublications, 
  fetchPopularPublications, 
  fetchRecentPublications 
} from '../../store/slices/publicationsSlice';
import PublicationCard from '../../components/publications/PublicationCard';

const Publications = () => {
  const dispatch = useDispatch();
  const { publications, loading, error } = useSelector((state) => state.publications);
  const { user } = useSelector((state) => state.auth);
  
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

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
    if (filter === 'all') return true;
    if (filter === 'available') return publication.status === 'available';
    if (filter === 'completed') return publication.status === 'completed';
    return true;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadPublications}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Publicaciones</h1>
            <p className="text-gray-600 mt-2">
              Descubre artículos disponibles para intercambio
            </p>
          </div>
          
          {user && (
            <Link
              to="/publications/create"
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Publicación
            </Link>
          )}
        </div>

        {/* Filtros y ordenamiento */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            {/* Filtros por estado */}
            <div className="flex space-x-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilter('available')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'available'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Disponibles
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'completed'
                    ? 'bg-gray-100 text-gray-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Completados
              </button>
            </div>

            {/* Ordenamiento */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recent">Más recientes</option>
                <option value="popular">Más populares</option>
                <option value="all">Todos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de publicaciones */}
        {filteredPublications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPublications.map((publication) => (
              <PublicationCard key={publication._id} publication={publication} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay publicaciones</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? 'No se encontraron publicaciones.'
                : `No hay publicaciones ${filter === 'available' ? 'disponibles' : 'completadas'}.`
              }
            </p>
            {user && filter === 'all' && (
              <div className="mt-6">
                <Link
                  to="/publications/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear primera publicación
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Estadísticas */}
        {filteredPublications.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {publications?.length || 0}
                </div>
                <div className="text-sm text-gray-500">Total de publicaciones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {publications?.filter(p => p.status === 'available').length || 0}
                </div>
                <div className="text-sm text-gray-500">Disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {publications?.filter(p => p.status === 'completed').length || 0}
                </div>
                <div className="text-sm text-gray-500">Completados</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Publications;