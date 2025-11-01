import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile, getUserPublications } from '../../store/slices/usersSlice';
import PublicationCard from '../../components/publications/PublicationCard';

const UserProfile = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  
  const { selectedUser, userPublications, loading } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('publications');

  useEffect(() => {
    if (userId) {
      dispatch(getUserProfile(userId));
      dispatch(getUserPublications(userId));
    }
  }, [dispatch, userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Usuario no encontrado
          </h2>
          <p className="text-gray-600">
            El perfil que buscas no existe o ha sido eliminado
          </p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser._id === selectedUser._id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header del perfil */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h1>
              {selectedUser.location && (
                <p className="text-gray-600 flex items-center mt-1">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  {selectedUser.location}
                </p>
              )}
              {selectedUser.bio && (
                <p className="text-gray-700 mt-2">{selectedUser.bio}</p>
              )}
              
              <div className="flex items-center space-x-6 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedUser.publicationsCount || 0}
                  </p>
                  <p className="text-sm text-gray-500">Publicaciones</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {selectedUser.exchangesCount || 0}
                  </p>
                  <p className="text-sm text-gray-500">Intercambios</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {selectedUser.rating || 0}
                  </p>
                  <p className="text-sm text-gray-500">Valoración</p>
                </div>
              </div>
            </div>

            {!isOwnProfile && currentUser && (
              <div className="flex flex-col space-y-2">
                <button className="btn-primary">
                  <i className="fas fa-envelope mr-2"></i>
                  Enviar mensaje
                </button>
                <button className="btn-secondary">
                  <i className="fas fa-user-plus mr-2"></i>
                  Seguir
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('publications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'publications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Publicaciones ({userPublications?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reseñas
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'publications' && (
              <div>
                {userPublications && userPublications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userPublications.map((publication) => (
                      <PublicationCard 
                        key={publication._id} 
                        publication={publication} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <i className="fas fa-box-open text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {isOwnProfile ? 'No tienes publicaciones aún' : 'No hay publicaciones'}
                    </h3>
                    <p className="text-gray-600">
                      {isOwnProfile 
                        ? 'Crea tu primera publicación para empezar a intercambiar'
                        : 'Este usuario no ha publicado nada aún'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-12">
                <i className="fas fa-star text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sistema de reseñas
                </h3>
                <p className="text-gray-600">
                  Las reseñas estarán disponibles próximamente
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;