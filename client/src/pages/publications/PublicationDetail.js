import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchPublicationById, 
  toggleFavorite, 
  deletePublication 
} from '../../store/slices/publicationsSlice';

const PublicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { selectedPublication, loading, error } = useSelector((state) => state.publications);
  const { user } = useSelector((state) => state.auth);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchPublicationById(id));
    }
  }, [dispatch, id]);

  const handleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      await dispatch(toggleFavorite(id)).unwrap();
    } catch (error) {
      console.error('Error al agregar/quitar favorito:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deletePublication(id)).unwrap();
      navigate('/publications');
    } catch (error) {
      console.error('Error al eliminar publicación:', error);
    }
  };

  const handleContact = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (selectedPublication?.user?._id) {
      navigate(`/messages?user=${selectedPublication.user._id}`);
    }
  };

  const nextImage = () => {
    if (selectedPublication?.images?.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === selectedPublication.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedPublication?.images?.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedPublication.images.length - 1 : prev - 1
      );
    }
  };

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
          <Link
            to="/publications"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver a publicaciones
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedPublication) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Publicación no encontrada
          </h2>
          <p className="text-gray-600">
            La publicación que buscas no existe o ha sido eliminada
          </p>
          <Link
            to="/publications"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver a publicaciones
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && user._id === selectedPublication.user?._id;
  const isFavorite = user && selectedPublication.favorites?.includes(user._id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-gray-700 hover:text-blue-600">
                Inicio
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link to="/publications" className="ml-1 text-gray-700 hover:text-blue-600 md:ml-2">
                  Publicaciones
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-gray-500 md:ml-2">{selectedPublication.title}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Galería de imágenes */}
            <div>
              {selectedPublication.images && selectedPublication.images.length > 0 ? (
                <div className="relative">
                  <img
                    src={selectedPublication.images[currentImageIndex]}
                    alt={selectedPublication.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  
                  {selectedPublication.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      {/* Indicadores */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {selectedPublication.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Información de la publicación */}
            <div className="space-y-6">
              {/* Estado y favorito */}
              <div className="flex justify-between items-start">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedPublication.status === 'available' 
                    ? 'bg-green-100 text-green-800'
                    : selectedPublication.status === 'completed'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedPublication.status === 'available' && 'Disponible'}
                  {selectedPublication.status === 'completed' && 'Completado'}
                  {selectedPublication.status === 'pending' && 'Pendiente'}
                </span>
                
                {user && !isOwner && (
                  <button
                    onClick={handleFavorite}
                    className={`p-2 rounded-full ${
                      isFavorite 
                        ? 'text-red-600 hover:text-red-700' 
                        : 'text-gray-400 hover:text-red-600'
                    }`}
                  >
                    <svg className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Título y descripción */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {selectedPublication.title}
                </h1>
                <p className="text-gray-700 leading-relaxed">
                  {selectedPublication.description}
                </p>
              </div>

              {/* Detalles */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Categoría</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedPublication.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Condición</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedPublication.condition}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Ubicación</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedPublication.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Publicado</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedPublication.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Información del usuario */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Publicado por</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    {selectedPublication.user?.avatar ? (
                      <img
                        src={selectedPublication.user.avatar}
                        alt={selectedPublication.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-gray-600">
                        {selectedPublication.user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedPublication.user?.name}</p>
                    <p className="text-sm text-gray-500">
                      Miembro desde {new Date(selectedPublication.user?.createdAt).getFullYear()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="border-t pt-6">
                {isOwner ? (
                  <div className="flex space-x-3">
                    <Link
                      to={`/publications/${id}/edit`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Eliminar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedPublication.status === 'available' && (
                      <button
                        onClick={handleContact}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      >
                        Contactar para intercambio
                      </button>
                    )}
                    <Link
                      to={`/users/${selectedPublication.user?._id}`}
                      className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center block"
                    >
                      Ver perfil del usuario
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirmar eliminación
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    ¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.
                  </p>
                </div>
                <div className="flex justify-center space-x-3 mt-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicationDetail;