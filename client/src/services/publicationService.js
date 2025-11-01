import api from './api';

const publicationService = {
  // Obtener todas las publicaciones con filtros
  getPublications: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    return await api.get(`/publications?${queryParams.toString()}`);
  },

  // Obtener publicación por ID
  getPublicationById: async (id) => {
    return await api.get(`/publications/${id}`);
  },

  // Crear nueva publicación
  createPublication: async (publicationData) => {
    const formData = new FormData();
    
    // Agregar campos de texto
    Object.keys(publicationData).forEach(key => {
      if (key !== 'images' && publicationData[key] !== undefined) {
        if (typeof publicationData[key] === 'object') {
          formData.append(key, JSON.stringify(publicationData[key]));
        } else {
          formData.append(key, publicationData[key]);
        }
      }
    });

    // Agregar imágenes
    if (publicationData.images && publicationData.images.length > 0) {
      publicationData.images.forEach((image, index) => {
        formData.append('images', image);
      });
    }

    return await api.post('/publications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Actualizar publicación
  updatePublication: async (id, publicationData) => {
    const formData = new FormData();
    
    // Agregar campos de texto
    Object.keys(publicationData).forEach(key => {
      if (key !== 'images' && key !== 'newImages' && publicationData[key] !== undefined) {
        if (typeof publicationData[key] === 'object') {
          formData.append(key, JSON.stringify(publicationData[key]));
        } else {
          formData.append(key, publicationData[key]);
        }
      }
    });

    // Agregar nuevas imágenes
    if (publicationData.newImages && publicationData.newImages.length > 0) {
      publicationData.newImages.forEach((image) => {
        formData.append('images', image);
      });
    }

    return await api.put(`/publications/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Eliminar publicación
  deletePublication: async (id) => {
    return await api.delete(`/publications/${id}`);
  },

  // Marcar/desmarcar como favorito
  toggleFavorite: async (id) => {
    return await api.post(`/publications/${id}/favorite`);
  },

  // Búsqueda avanzada de publicaciones
  searchPublications: async (searchParams) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] !== undefined && searchParams[key] !== null && searchParams[key] !== '') {
        queryParams.append(key, searchParams[key]);
      }
    });

    return await api.get(`/publications/search?${queryParams.toString()}`);
  },

  // Obtener publicaciones populares
  getPopularPublications: async () => {
    return await api.get('/publications/popular');
  },

  // Obtener publicaciones recientes
  getRecentPublications: async () => {
    return await api.get('/publications/recent');
  },

  // Obtener publicaciones de un usuario
  getUserPublications: async (userId, params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const query = queryParams.toString();
    const url = query ? `/publications/user/${userId}?${query}` : `/publications/user/${userId}`;
    
    return await api.get(url);
  },

  // Reportar publicación
  reportPublication: async (id, reason) => {
    return await api.post(`/publications/${id}/report`, { reason });
  },

  // Marcar publicación como completada
  markAsCompleted: async (id) => {
    return await api.patch(`/publications/${id}/complete`);
  },

  // Obtener estadísticas de publicaciones
  getPublicationStats: async () => {
    return await api.get('/publications/stats');
  },

  // Obtener categorías disponibles
  getCategories: async () => {
    return await api.get('/publications/categories');
  },

  // Obtener publicaciones favoritas del usuario
  getFavoritePublications: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const query = queryParams.toString();
    const url = query ? `/users/favorites?${query}` : '/users/favorites';
    
    return await api.get(url);
  },

  // Obtener publicaciones similares
  getSimilarPublications: async (id, limit = 5) => {
    return await api.get(`/publications/${id}/similar?limit=${limit}`);
  },

  // Obtener publicaciones por ubicación
  getPublicationsByLocation: async (location, radius = 10) => {
    return await api.get(`/publications/location?location=${encodeURIComponent(location)}&radius=${radius}`);
  },

  // Obtener publicaciones por categoría
  getPublicationsByCategory: async (category, params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const query = queryParams.toString();
    const url = query ? `/publications/category/${category}?${query}` : `/publications/category/${category}`;
    
    return await api.get(url);
  },

  // Incrementar vistas de una publicación
  incrementViews: async (id) => {
    return await api.post(`/publications/${id}/view`);
  },

  // Obtener historial de precios (si aplica)
  getPriceHistory: async (id) => {
    return await api.get(`/publications/${id}/price-history`);
  },

  // Guardar búsqueda
  saveSearch: async (searchParams, name) => {
    return await api.post('/users/saved-searches', {
      searchParams,
      name,
    });
  },

  // Obtener búsquedas guardadas
  getSavedSearches: async () => {
    return await api.get('/users/saved-searches');
  },

  // Eliminar búsqueda guardada
  deleteSavedSearch: async (id) => {
    return await api.delete(`/users/saved-searches/${id}`);
  },
};

export default publicationService;