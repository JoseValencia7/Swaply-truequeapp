import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  StarIcon,
  UserIcon,
  CalendarIcon,
  FlagIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import {
  fetchUserReviews,
  createReview,
  reportReview
} from '../../store/slices/reviewSlice';
import { addToast } from '../../store/slices/uiSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente de reseñas de usuario
 * Muestra las reseñas recibidas por un usuario y permite crear nuevas reseñas
 */
const UserReviews = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();

  const [showCreateReview, setShowCreateReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    exchangeId: ''
  });
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  const {
    reviews,
    reviewStats,
    isLoading,
    isCreating
  } = useSelector(state => state.reviews);
  const { user: currentUser } = useSelector(state => state.auth);

  const canCreateReview = currentUser && currentUser.id !== userId;

  // Cargar reseñas
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserReviews({ userId, filter: filterRating, sort: sortBy }));
    }
  }, [dispatch, userId, filterRating, sortBy]);

  // Manejar creación de reseña
  const handleCreateReview = async (e) => {
    e.preventDefault();

    if (!newReview.comment.trim()) {
      dispatch(addToast({
        type: 'error',
        message: 'El comentario es requerido'
      }));
      return;
    }

    try {
      await dispatch(createReview({
        targetUserId: userId,
        ...newReview
      })).unwrap();

      dispatch(addToast({
        type: 'success',
        message: 'Reseña creada exitosamente'
      }));

      setNewReview({
        rating: 5,
        comment: '',
        exchangeId: ''
      });
      setShowCreateReview(false);

      // Recargar reseñas
      dispatch(fetchUserReviews({ userId, filter: filterRating, sort: sortBy }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error.message || 'Error al crear la reseña'
      }));
    }
  };

  // Reportar reseña
  const handleReportReview = async (reviewId, reason) => {
    try {
      await dispatch(reportReview({ reviewId, reason })).unwrap();
      dispatch(addToast({
        type: 'success',
        message: 'Reseña reportada exitosamente'
      }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Error al reportar la reseña'
      }));
    }
  };

  // Renderizar estrellas
  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= rating;
      const StarComponent = isFilled ? StarSolidIcon : StarIcon;
      
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => interactive && onRatingChange && onRatingChange(i)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          disabled={!interactive}
        >
          <StarComponent 
            className={`h-5 w-5 ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`} 
          />
        </button>
      );
    }
    
    return <div className="flex space-x-1">{stars}</div>;
  };

  // Alternar expansión de reseña
  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  // Filtrar y ordenar reseñas
  const filteredReviews = reviews?.filter(review => {
    if (filterRating === 'all') return true;
    return review.rating === parseInt(filterRating);
  }) || [];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingSpinner text="Cargando reseñas..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Reseñas y calificaciones
        </h1>
        <p className="text-gray-600">
          Opiniones de otros usuarios sobre sus intercambios
        </p>
      </div>

      {/* Estadísticas de reseñas */}
      {reviewStats && (
        <div className="card mb-8">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Calificación promedio */}
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {reviewStats.averageRating?.toFixed(1) || '0.0'}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(reviewStats.averageRating || 0))}
                </div>
                <p className="text-sm text-gray-600">
                  {reviewStats.totalReviews} reseñas
                </p>
              </div>

              {/* Distribución de calificaciones */}
              <div className="lg:col-span-3">
                <h4 className="font-medium mb-3">Distribución de calificaciones</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = reviewStats.ratingDistribution?.[rating] || 0;
                    const percentage = reviewStats.totalReviews > 0 
                      ? (count / reviewStats.totalReviews) * 100 
                      : 0;
                    
                    return (
                      <div key={rating} className="flex items-center space-x-3">
                        <span className="text-sm w-8">{rating}</span>
                        <StarSolidIcon className="h-4 w-4 text-yellow-400" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controles de filtro y ordenamiento */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Filtro por calificación */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="all">Todas las calificaciones</option>
            <option value="5">5 estrellas</option>
            <option value="4">4 estrellas</option>
            <option value="3">3 estrellas</option>
            <option value="2">2 estrellas</option>
            <option value="1">1 estrella</option>
          </select>

          {/* Ordenamiento */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="highest">Calificación más alta</option>
            <option value="lowest">Calificación más baja</option>
          </select>
        </div>

        {/* Botón para crear reseña */}
        {canCreateReview && (
          <button
            onClick={() => setShowCreateReview(true)}
            className="btn btn-primary btn-sm"
          >
            Escribir reseña
          </button>
        )}
      </div>

      {/* Lista de reseñas */}
      <div className="space-y-6">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => {
            const isExpanded = expandedReviews.has(review.id);
            const shouldShowExpand = review.comment.length > 200;
            
            return (
              <div key={review.id} className="card">
                <div className="card-body">
                  <div className="flex items-start space-x-4">
                    {/* Avatar del revisor */}
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {review.reviewer.avatar ? (
                        <img
                          src={review.reviewer.avatar}
                          alt={review.reviewer.name}
                          className="w-12 h-12 object-cover"
                        />
                      ) : (
                        <UserIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      {/* Header de la reseña */}
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {review.reviewer.name}
                          </h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              <span>
                                {formatDistanceToNow(new Date(review.createdAt), {
                                  addSuffix: true,
                                  locale: es
                                })}
                              </span>
                            </div>
                            {review.exchange && (
                              <span>
                                Intercambio: {review.exchange.title}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Menú de acciones */}
                        <div className="dropdown dropdown-end">
                          <button className="btn btn-ghost btn-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                            <li>
                              <button
                                onClick={() => handleReportReview(review.id, 'inappropriate')}
                                className="text-red-600"
                              >
                                <FlagIcon className="h-4 w-4" />
                                Reportar reseña
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Calificación */}
                      <div className="flex items-center space-x-2 mb-3">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600">
                          {review.rating} de 5
                        </span>
                      </div>

                      {/* Comentario */}
                      {review.comment && (
                        <div>
                          <p className="text-gray-700 leading-relaxed">
                            {isExpanded || !shouldShowExpand
                              ? review.comment
                              : `${review.comment.substring(0, 200)}...`
                            }
                          </p>
                          
                          {shouldShowExpand && (
                            <button
                              onClick={() => toggleReviewExpansion(review.id)}
                              className="text-primary-600 hover:text-primary-700 text-sm mt-2 flex items-center"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUpIcon className="h-4 w-4 mr-1" />
                                  Ver menos
                                </>
                              ) : (
                                <>
                                  <ChevronDownIcon className="h-4 w-4 mr-1" />
                                  Ver más
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Respuesta del usuario (si existe) */}
                      {review.response && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-primary-500">
                          <div className="flex items-center mb-2">
                            <span className="font-medium text-sm text-gray-900">
                              Respuesta del usuario
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {formatDistanceToNow(new Date(review.response.createdAt), {
                                addSuffix: true,
                                locale: es
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {review.response.content}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay reseñas aún
            </h3>
            <p className="text-gray-600">
              {canCreateReview 
                ? 'Sé el primero en escribir una reseña sobre este usuario'
                : 'Este usuario aún no ha recibido reseñas'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal para crear reseña */}
      {showCreateReview && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Escribir reseña</h3>
            
            <form onSubmit={handleCreateReview} className="space-y-4">
              {/* Calificación */}
              <div>
                <label className="label">
                  <span className="label-text">Calificación</span>
                </label>
                <div className="flex items-center space-x-2">
                  {renderStars(newReview.rating, true, (rating) => 
                    setNewReview(prev => ({ ...prev, rating }))
                  )}
                  <span className="text-sm text-gray-600 ml-2">
                    {newReview.rating} de 5
                  </span>
                </div>
              </div>

              {/* Comentario */}
              <div>
                <label className="label">
                  <span className="label-text">Comentario</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows="4"
                  placeholder="Comparte tu experiencia con este usuario..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({
                    ...prev,
                    comment: e.target.value
                  }))}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {newReview.comment.length}/500 caracteres
                </div>
              </div>

              {/* ID del intercambio (opcional) */}
              <div>
                <label className="label">
                  <span className="label-text">Intercambio relacionado (opcional)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="ID del intercambio"
                  value={newReview.exchangeId}
                  onChange={(e) => setNewReview(prev => ({
                    ...prev,
                    exchangeId: e.target.value
                  }))}
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setShowCreateReview(false)}
                  className="btn btn-ghost"
                  disabled={isCreating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isCreating || !newReview.comment.trim()}
                >
                  {isCreating ? (
                    <LoadingSpinner size="sm" showText={false} />
                  ) : (
                    'Publicar reseña'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReviews;