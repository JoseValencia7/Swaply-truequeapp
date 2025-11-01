import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  CameraIcon,
  CheckBadgeIcon,
  TrophyIcon,
  HeartIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { 
  fetchUserProfile,
  updateUserProfile,
  uploadAvatar
} from '../../store/slices/userSlice';
import { addToast } from '../../store/slices/uiSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente de perfil de usuario
 * Muestra información del usuario, estadísticas y sistema de reputación
 */
const UserProfile = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  const { 
    currentProfile: profile,
    isLoading 
  } = useSelector(state => state.user);
  const { user: currentUser } = useSelector(state => state.auth);

  const isOwnProfile = !userId || userId === currentUser?.id;

  // Cargar perfil
  useEffect(() => {
    const targetUserId = userId || currentUser?.id;
    if (targetUserId) {
      dispatch(fetchUserProfile(targetUserId));
    }
  }, [dispatch, userId, currentUser?.id]);

  // Inicializar datos de edición
  useEffect(() => {
    if (profile && isOwnProfile) {
      setEditData({
        name: profile.name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        phone: profile.phone || '',
        website: profile.website || ''
      });
    }
  }, [profile, isOwnProfile]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardar cambios
  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      await dispatch(updateUserProfile(editData)).unwrap();
      dispatch(addToast({
        type: 'success',
        message: 'Perfil actualizado exitosamente'
      }));
      setIsEditing(false);
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Error al actualizar el perfil'
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  // Manejar subida de avatar
  const handleAvatarUpload = async (file) => {
    if (!file) return;

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      dispatch(addToast({
        type: 'error',
        message: 'La imagen es demasiado grande (máximo 5MB)'
      }));
      return;
    }

    try {
      await dispatch(uploadAvatar(file)).unwrap();
      dispatch(addToast({
        type: 'success',
        message: 'Avatar actualizado exitosamente'
      }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Error al subir la imagen'
      }));
    }
  };

  // Calcular nivel de reputación
  const getReputationLevel = (score) => {
    if (score >= 1000) return { level: 'Experto', color: 'text-purple-600', icon: TrophyIcon };
    if (score >= 500) return { level: 'Avanzado', color: 'text-blue-600', icon: CheckBadgeIcon };
    if (score >= 100) return { level: 'Intermedio', color: 'text-green-600', icon: StarIcon };
    return { level: 'Principiante', color: 'text-gray-600', icon: UserIcon };
  };

  // Renderizar estrellas de calificación
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarSolidIcon key={i} className="h-5 w-5 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="h-5 w-5 text-gray-300" />
            <StarSolidIcon className="h-5 w-5 text-yellow-400 absolute top-0 left-0" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        );
      } else {
        stars.push(
          <StarIcon key={i} className="h-5 w-5 text-gray-300" />
        );
      }
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingSpinner text="Cargando perfil..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Usuario no encontrado
          </h2>
          <p className="text-gray-600">
            El perfil que buscas no existe o no está disponible.
          </p>
        </div>
      </div>
    );
  }

  const reputationInfo = getReputationLevel(profile.reputationScore || 0);
  const ReputationIcon = reputationInfo.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header del perfil */}
      <div className="card mb-8">
        <div className="card-body">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-24 h-24 object-cover"
                  />
                ) : (
                  <UserIcon className="h-12 w-12 text-gray-400" />
                )}
              </div>
              
              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
                  <CameraIcon className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAvatarUpload(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Información básica */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="Nombre completo"
                  />
                  <textarea
                    name="bio"
                    value={editData.bio}
                    onChange={handleInputChange}
                    className="textarea textarea-bordered w-full"
                    placeholder="Cuéntanos sobre ti..."
                    rows="3"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile.name}
                    </h1>
                    {profile.isVerified && (
                      <CheckBadgeIcon className="h-6 w-6 text-blue-500" title="Usuario verificado" />
                    )}
                  </div>
                  
                  {profile.bio && (
                    <p className="text-gray-600 mb-3">{profile.bio}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {profile.location && (
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>
                        Miembro desde {formatDistanceToNow(new Date(profile.createdAt), {
                          addSuffix: true,
                          locale: es
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex space-x-2">
              {isOwnProfile ? (
                isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn btn-ghost"
                      disabled={isUpdating}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="btn btn-primary"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <LoadingSpinner size="sm" showText={false} />
                      ) : (
                        'Guardar'
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Editar perfil
                  </button>
                )
              ) : (
                <>
                  <Link
                    to={`/messages/new?user=${profile.id}`}
                    className="btn btn-primary"
                  >
                    <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
                    Enviar mensaje
                  </Link>
                  <button className="btn btn-ghost">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                    Reportar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Información adicional en modo edición */}
          {isEditing && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text">Ubicación</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={editData.location}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="Ciudad, País"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Teléfono</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editData.phone}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="+57 300 123 4567"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">
                  <span className="label-text">Sitio web</span>
                </label>
                <input
                  type="url"
                  name="website"
                  value={editData.website}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="https://mi-sitio.com"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Estadísticas y reputación */}
        <div className="lg:col-span-1 space-y-6">
          {/* Reputación */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Reputación</h3>
            </div>
            <div className="card-body text-center">
              <div className="mb-4">
                <ReputationIcon className={`h-12 w-12 mx-auto mb-2 ${reputationInfo.color}`} />
                <h4 className={`text-xl font-bold ${reputationInfo.color}`}>
                  {reputationInfo.level}
                </h4>
                <p className="text-gray-600">
                  {profile.reputationScore || 0} puntos
                </p>
              </div>

              {profile.averageRating > 0 && (
                <div className="mb-4">
                  <div className="flex justify-center mb-2">
                    {renderStars(profile.averageRating)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {profile.averageRating.toFixed(1)} de 5 ({profile.totalReviews} reseñas)
                  </p>
                </div>
              )}

              <div className="text-sm text-gray-600">
                <p>Gana puntos completando intercambios exitosos</p>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Estadísticas</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Intercambios completados</span>
                <span className="font-semibold">{profile.completedExchanges || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Publicaciones activas</span>
                <span className="font-semibold">{profile.activePublications || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total publicaciones</span>
                <span className="font-semibold">{profile.totalPublications || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Favoritos recibidos</span>
                <span className="font-semibold">{profile.totalFavorites || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vistas de perfil</span>
                <span className="font-semibold">{profile.profileViews || 0}</span>
              </div>
            </div>
          </div>

          {/* Insignias */}
          {profile.badges && profile.badges.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold">Insignias</h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-3 gap-3">
                  {profile.badges.map((badge, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <TrophyIcon className="h-6 w-6 text-yellow-600" />
                      </div>
                      <p className="text-xs text-gray-600">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Publicaciones recientes */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {isOwnProfile ? 'Mis publicaciones' : 'Publicaciones'}
              </h3>
              <Link
                to={`/publications?user=${profile.id}`}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                Ver todas
              </Link>
            </div>
            <div className="card-body">
              {profile.recentPublications && profile.recentPublications.length > 0 ? (
                <div className="space-y-4">
                  {profile.recentPublications.map((publication) => (
                    <Link
                      key={publication.id}
                      to={`/publications/${publication.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start space-x-4">
                        {publication.images?.[0] && (
                          <img
                            src={publication.images[0]}
                            alt={publication.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`badge ${
                              publication.type === 'offer' ? 'badge-success' : 'badge-primary'
                            } badge-sm`}>
                              {publication.type === 'offer' ? 'Ofrezco' : 'Busco'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(publication.createdAt), {
                                addSuffix: true,
                                locale: es
                              })}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">
                            {publication.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {publication.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center">
                              <EyeIcon className="h-3 w-3 mr-1" />
                              <span>{publication.views || 0}</span>
                            </div>
                            <div className="flex items-center">
                              <HeartIcon className="h-3 w-3 mr-1" />
                              <span>{publication.favorites?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    {isOwnProfile 
                      ? 'Aún no has creado ninguna publicación'
                      : 'Este usuario no tiene publicaciones'
                    }
                  </p>
                  {isOwnProfile && (
                    <Link to="/publications/create" className="btn btn-primary mt-4">
                      Crear primera publicación
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;