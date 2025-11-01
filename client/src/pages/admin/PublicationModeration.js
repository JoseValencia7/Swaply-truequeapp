import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  FaSearch, 
  FaFilter, 
  FaCheck, 
  FaTimes, 
  FaEye,
  FaFlag,
  FaCalendar
} from 'react-icons/fa';

const PublicationModeration = () => {
  const { user } = useSelector((state) => state.auth);
  const [publications, setPublications] = useState([]);
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [publicationsPerPage] = useState(8);

  useEffect(() => {
    // Simular datos de publicaciones para moderación
    const mockPublications = [
      {
        id: 1,
        title: 'Vendo iPhone 13 Pro Max',
        description: 'iPhone en excelente estado, poco uso...',
        category: 'Electrónicos',
        price: 800,
        status: 'pending',
        author: 'Juan Pérez',
        createdAt: '2024-01-20',
        images: ['image1.jpg'],
        reports: 0
      },
      {
        id: 2,
        title: 'Apartamento en alquiler',
        description: 'Hermoso apartamento de 2 habitaciones...',
        category: 'Inmuebles',
        price: 1200,
        status: 'approved',
        author: 'María García',
        createdAt: '2024-01-19',
        images: ['image2.jpg', 'image3.jpg'],
        reports: 1
      },
      {
        id: 3,
        title: 'Servicios de plomería',
        description: 'Ofrezco servicios de plomería profesional...',
        category: 'Servicios',
        price: 50,
        status: 'rejected',
        author: 'Carlos López',
        createdAt: '2024-01-18',
        images: [],
        reports: 3
      },
      // Más publicaciones simuladas...
    ];
    setPublications(mockPublications);
    setFilteredPublications(mockPublications);
  }, []);

  useEffect(() => {
    let filtered = publications.filter(pub => {
      const matchesSearch = pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pub.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pub.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || pub.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || pub.category === filterCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
    
    setFilteredPublications(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory, publications]);

  const handleApprove = (publicationId) => {
    setPublications(publications.map(pub => 
      pub.id === publicationId ? { ...pub, status: 'approved' } : pub
    ));
  };

  const handleReject = (publicationId) => {
    setPublications(publications.map(pub => 
      pub.id === publicationId ? { ...pub, status: 'rejected' } : pub
    ));
  };

  const handleDelete = (publicationId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      setPublications(publications.filter(pub => pub.id !== publicationId));
    }
  };

  // Paginación
  const indexOfLastPublication = currentPage * publicationsPerPage;
  const indexOfFirstPublication = indexOfLastPublication - publicationsPerPage;
  const currentPublications = filteredPublications.slice(indexOfFirstPublication, indexOfLastPublication);
  const totalPages = Math.ceil(filteredPublications.length / publicationsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'pending': return 'Pendiente';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Moderación de Publicaciones</h1>
          <p className="mt-2 text-sm text-gray-600">
            Revisa y modera las publicaciones del sistema
          </p>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar publicaciones..."
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobada</option>
              <option value="rejected">Rechazada</option>
            </select>

            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              <option value="Electrónicos">Electrónicos</option>
              <option value="Inmuebles">Inmuebles</option>
              <option value="Servicios">Servicios</option>
              <option value="Vehículos">Vehículos</option>
            </select>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
              <FaFilter className="mr-2" />
              Filtrar
            </button>
          </div>
        </div>

        {/* Grid de Publicaciones */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
          {currentPublications.map((publication) => (
            <div key={publication.id} className="bg-white shadow rounded-lg overflow-hidden">
              {/* Imagen */}
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {publication.images.length > 0 ? (
                  <img 
                    src={`/api/placeholder/300/200`} 
                    alt={publication.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">Sin imagen</div>
                )}
              </div>

              {/* Contenido */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(publication.status)}`}>
                    {getStatusText(publication.status)}
                  </span>
                  {publication.reports > 0 && (
                    <span className="flex items-center text-red-500 text-xs">
                      <FaFlag className="mr-1" />
                      {publication.reports}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                  {publication.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {publication.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-green-600">
                    ${publication.price}
                  </span>
                  <span className="text-xs text-gray-500">
                    {publication.category}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">
                    Por: {publication.author}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center">
                    <FaCalendar className="mr-1" />
                    {publication.createdAt}
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex space-x-2">
                  <button 
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                    title="Ver detalles"
                  >
                    <FaEye />
                  </button>
                  
                  {publication.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleApprove(publication.id)}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 flex items-center justify-center"
                        title="Aprobar"
                      >
                        <FaCheck />
                      </button>
                      <button 
                        onClick={() => handleReject(publication.id)}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 flex items-center justify-center"
                        title="Rechazar"
                      >
                        <FaTimes />
                      </button>
                    </>
                  )}
                  
                  {(publication.status === 'approved' || publication.status === 'rejected') && (
                    <button 
                      onClick={() => handleDelete(publication.id)}
                      className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700"
                      title="Eliminar"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{indexOfFirstPublication + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(indexOfLastPublication, filteredPublications.length)}</span> de{' '}
                  <span className="font-medium">{filteredPublications.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicationModeration;