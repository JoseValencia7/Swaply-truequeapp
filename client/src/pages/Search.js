import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { searchPublications } from '../store/slices/publicationsSlice';
import PublicationCard from '../components/publications/PublicationCard';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { searchResults, loading } = useSelector((state) => state.publications);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    location: '',
    sortBy: 'recent'
  });

  // Obtener término de búsqueda de la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchTerm(query);
      handleSearch(query);
    }
  }, [location.search]);

  const handleSearch = (term = searchTerm) => {
    if (term.trim()) {
      dispatch(searchPublications({ 
        query: term, 
        filters 
      }));
      
      // Actualizar URL
      const params = new URLSearchParams();
      params.set('q', term);
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      navigate(`/search?${params.toString()}`, { replace: true });
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (searchTerm) {
      dispatch(searchPublications({ 
        query: searchTerm, 
        filters: newFilters 
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      condition: '',
      location: '',
      sortBy: 'recent'
    });
    
    if (searchTerm) {
      dispatch(searchPublications({ 
        query: searchTerm, 
        filters: {
          category: '',
          condition: '',
          location: '',
          sortBy: 'recent'
        }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Buscar publicaciones..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              </div>
            </div>
            <button
              onClick={() => handleSearch()}
              className="btn-primary px-6"
            >
              Buscar
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filtros */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Limpiar
                </button>
              </div>

              <div className="space-y-4">
                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas las categorías</option>
                    <option value="electronics">Electrónicos</option>
                    <option value="clothing">Ropa</option>
                    <option value="books">Libros</option>
                    <option value="home">Hogar</option>
                    <option value="sports">Deportes</option>
                    <option value="toys">Juguetes</option>
                    <option value="other">Otros</option>
                  </select>
                </div>

                {/* Condición */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condición
                  </label>
                  <select
                    value={filters.condition}
                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Cualquier condición</option>
                    <option value="new">Nuevo</option>
                    <option value="like-new">Como nuevo</option>
                    <option value="good">Bueno</option>
                    <option value="fair">Regular</option>
                  </select>
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="Ciudad o región"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Ordenar por */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="recent">Más recientes</option>
                    <option value="oldest">Más antiguos</option>
                    <option value="popular">Más populares</option>
                    <option value="alphabetical">Alfabético</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div>
                <div className="mb-4">
                  <p className="text-gray-600">
                    {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} 
                    {searchTerm && ` para "${searchTerm}"`}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {searchResults.map((publication) => (
                    <PublicationCard 
                      key={publication._id} 
                      publication={publication} 
                    />
                  ))}
                </div>
              </div>
            ) : searchTerm ? (
              <div className="text-center py-12">
                <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-gray-600">
                  Intenta con otros términos de búsqueda o ajusta los filtros
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Busca publicaciones
                </h3>
                <p className="text-gray-600">
                  Ingresa un término de búsqueda para encontrar publicaciones
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;