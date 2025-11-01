import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFavorites } from '../../store/slices/publicationsSlice';
import PublicationCard from '../../components/publications/PublicationCard';

const Favorites = () => {
  const dispatch = useDispatch();
  const { favorites, loading } = useSelector((state) => state.publications);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso requerido
          </h2>
          <p className="text-gray-600">
            Debes iniciar sesión para ver tus favoritos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
          <p className="mt-2 text-gray-600">
            Publicaciones que has marcado como favoritas
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((publication) => (
              <PublicationCard 
                key={publication._id} 
                publication={publication} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="fas fa-heart text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes favoritos aún
            </h3>
            <p className="text-gray-600 mb-6">
              Explora publicaciones y marca las que te interesen como favoritas
            </p>
            <a
              href="/publications"
              className="btn-primary"
            >
              Explorar publicaciones
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;