import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  ClockIcon,
  EyeIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { 
  fetchPublicationById,
  toggleFavorite,
  deletePublication,
  incrementViews
} from '../../store/slices/publicationSlice';
import { addToast } from '../../store/slices/uiSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente para mostrar los detalles de una publicación
 * Incluye galería de imágenes, información completa y acciones
 */
const PublicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { 
    currentPublication: publication, 
    isLoading 
  } = useSelector(state => state.publications);
  const { user } = useSelector(state => state.auth);

  // Cargar publicación
  useEffect(() => {
    if (id) {
      dispatch(fetchPublicationById(id));
      dispatch(incrementViews(id));
    }
  }, [dispatch, id]);

  // Verificar si es el propietario
  const isOwner = user && publication && user.id === publication.userId;
  const isFavorite = user && publication && publication.favorites?.includes(user.id);

  // Manejar favoritos
  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      await dispatch(toggleFavorite(publication.id)).unwrap();
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Error al cambiar favorito'
      }));
    }
  };

  // Manejar compartir
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: publication.title,
          text: publication.description,
          url: window.location.href
        });
      } catch (error) {
        // Usuario canceló o error
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(window.location.href);
        dispatch(addToast({
          type: 'success',
          message: 'Enlace copiado al portapapeles'
        }));
      } catch (error) {
        dispatch(addToast({
          type: 'error',
          message: 'Error al copiar enlace'
        }));
      }
    }
  };

  // Manejar eliminación
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deletePublication(publication.id)).unwrap();
      dispatch(addToast({
        type: 'success',
        message: 'Publicación eliminada exitosamente'
      }));
      navigate('/my-publications');
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Error al eliminar la publicación'
      }));
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Navegar entre imágenes
  const nextImage = () => {
    if (publication.images && publication.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === publication.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (publication.images && publication.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? publication.images.length - 1 : prev - 1
      );
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

  // Obtener etiqueta de condición
  const getConditionLabel = (condition) => {
    const conditions = {
      'new': 'Nuevo',
      'like_new': 'Como nuevo',
      'good': 'Buen estado',
      'fair': 'Estado regular',
      'poor': 'Necesita reparación'
    };
    return conditions[condition] || condition;
  };

  // Obtener etiqueta de categoría
  const getCategoryLabel = (category) => {
    const categories = {
      'electronics': 'Electrónicos',
      'clothing': 'Ropa y Accesorios',
      'books': 'Libros y Medios',
      'sports': 'Deportes y Recreación',
      'home': 'Hogar y Jardín',
      'vehicles': 'Vehículos',
      'tools': 'Herramientas',
      'toys': 'Juguetes y Juegos',
      'art': 'Arte y Manualidades',
      'music': 'Instrumentos Musicales',
      'other': 'Otros'
    };
    return categories[category] || category;
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <LoadingSpinner text="Cargando publicación..." />
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Publicación no encontrada
          </h2>
          <p className="text-gray-600 mb-6">
            La publicación que buscas no existe o ha sido eliminada.
          </p>
          <Link to="/publications" className="btn btn-primary">
            Volver a publicaciones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header con navegación */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Volver
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <div className="space-y-4">
          {/* Imagen principal */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
            {publication.images && publication.images.length > 0 ? (
              <>
                <img
                  src={publication.images[currentImageIndex]}
                  alt={`${publication.title} - Imagen ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Navegación de imágenes */}
                {publication.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                    
                    {/* Indicador de imagen actual */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {publication.images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400">Sin imagen</span>
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {publication.images && publication.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {publication.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex 
                      ? 'border-primary-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información de la publicación */}
        <div className="space-y-6">
          {/* Tipo y acciones */}
          <div className="flex items-start justify-between">
            <div>
              <span className={`badge ${
                publication.type === 'offer' 
                  ? 'badge-success' 
                  : 'badge-primary'
              } mb-2`}>
                {publication.type === 'offer' ? 'Ofrezco' : 'Busco'}
              </span>
              <h1 className="text-3xl font-bold text-gray-900">
                {publication.title}
              </h1>
            </div>

            <div className="flex space-x-2">
              {/* Botón favorito */}
              {user && !isOwner && (
                <button
                  onClick={handleToggleFavorite}
                  className="btn btn-ghost p-2"
                  title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="h-6 w-6 text-error-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6" />
                  )}
                </button>
              )}

              {/* Botón compartir */}
              <button
                onClick={handleShare}
                className="btn btn-ghost p-2"
                title="Compartir"
              >
                <ShareIcon className="h-6 w-6" />
              </button>

              {/* Acciones del propietario */}
              {isOwner && (
                <>
                  <Link
                    to={`/publications/${publication.id}/edit`}
                    className="btn btn-ghost p-2"
                    title="Editar"
                  >
                    <PencilIcon className="h-6 w-6" />
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="btn btn-ghost p-2 text-error-600"
                    title="Eliminar"
                  >
                    <TrashIcon className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Información básica */}
          <div className="space-y-4">
            {publication.estimatedValue && (
              <div>
                <span className="text-2xl font-bold text-primary-600">
                  {formatValue(publication.estimatedValue)}
                </span>
                <span className="text-gray-600 ml-2">valor estimado</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Categoría:</span>
                <p className="font-medium">{getCategoryLabel(publication.category)}</p>
              </div>
              <div>
                <span className="text-gray-600">Condición:</span>
                <p className="font-medium">{getConditionLabel(publication.condition)}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <MapPinIcon className="h-5 w-5 mr-2" />
              <span>{publication.location}</span>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>
                  Publicado {formatDistanceToNow(new Date(publication.createdAt), {
                    addSuffix: true,
                    locale: es
                  })}
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  <span>{publication.views || 0} vistas</span>
                </div>
                <div className="flex items-center">
                  <HeartIcon className="h-4 w-4 mr-1" />
                  <span>{publication.favorites?.length || 0} favoritos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Descripción</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {publication.description}
            </p>
          </div>

          {/* Preferencias de intercambio */}
          {publication.exchangePreferences && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Preferencias de intercambio</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {publication.exchangePreferences}
              </p>
            </div>
          )}

          {/* Tags */}
          {publication.tags && publication.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                {publication.tags.map((tag, index) => (
                  <span key={index} className="badge badge-secondary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Información del usuario */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">Publicado por</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                {publication.user?.avatar ? (
                  <img
                    src={publication.user.avatar}
                    alt={publication.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{publication.user?.name}</p>
                <p className="text-sm text-gray-600">
                  Miembro desde {new Date(publication.user?.createdAt).getFullYear()}
                </p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          {user && !isOwner && (
            <div className="border-t pt-6 space-y-3">
              <Link
                to={`/messages/new?user=${publication.userId}&publication=${publication.id}`}
                className="btn btn-primary w-full"
              >
                <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                Enviar mensaje
              </Link>
              
              <button className="btn btn-ghost w-full">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                Reportar publicación
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              ¿Eliminar publicación?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. La publicación será eliminada permanentemente.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-ghost flex-1"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-error flex-1"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" showText={false} />
                    <span className="ml-2">Eliminando...</span>
                  </div>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationDetail;