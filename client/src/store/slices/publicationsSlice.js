import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import publicationService from '../../services/publicationService';

// Async thunks
export const fetchPublications = createAsyncThunk(
  'publications/fetchPublications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await publicationService.getPublications(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar publicaciones');
    }
  }
);

export const fetchPublicationById = createAsyncThunk(
  'publications/fetchPublicationById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await publicationService.getPublicationById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar publicación');
    }
  }
);

export const createPublication = createAsyncThunk(
  'publications/createPublication',
  async (publicationData, { rejectWithValue }) => {
    try {
      const response = await publicationService.createPublication(publicationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear publicación');
    }
  }
);

export const updatePublication = createAsyncThunk(
  'publications/updatePublication',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await publicationService.updatePublication(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar publicación');
    }
  }
);

export const deletePublication = createAsyncThunk(
  'publications/deletePublication',
  async (id, { rejectWithValue }) => {
    try {
      await publicationService.deletePublication(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar publicación');
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'publications/toggleFavorite',
  async (id, { rejectWithValue }) => {
    try {
      const response = await publicationService.toggleFavorite(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cambiar favorito');
    }
  }
);

export const searchPublications = createAsyncThunk(
  'publications/searchPublications',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await publicationService.searchPublications(searchParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error en la búsqueda');
    }
  }
);

export const fetchPopularPublications = createAsyncThunk(
  'publications/fetchPopularPublications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await publicationService.getPopularPublications();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar publicaciones populares');
    }
  }
);

export const fetchRecentPublications = createAsyncThunk(
  'publications/fetchRecentPublications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await publicationService.getRecentPublications();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar publicaciones recientes');
    }
  }
);

export const fetchUserPublications = createAsyncThunk(
  'publications/fetchUserPublications',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await publicationService.getUserPublications(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar publicaciones del usuario');
    }
  }
);

export const reportPublication = createAsyncThunk(
  'publications/reportPublication',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await publicationService.reportPublication(id, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al reportar publicación');
    }
  }
);

export const markAsCompleted = createAsyncThunk(
  'publications/markAsCompleted',
  async (id, { rejectWithValue }) => {
    try {
      const response = await publicationService.markAsCompleted(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al marcar como completado');
    }
  }
);

export const fetchPublicationStats = createAsyncThunk(
  'publications/fetchPublicationStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await publicationService.getPublicationStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar estadísticas');
    }
  }
);

export const fetchFavorites = createAsyncThunk(
  'publications/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await publicationService.getFavorites();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar favoritos');
    }
  }
);

// Initial state
const initialState = {
  publications: [],
  currentPublication: null,
  popularPublications: [],
  recentPublications: [],
  userPublications: [],
  searchResults: [],
  favorites: [],
  stats: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {
    type: '',
    category: '',
    condition: '',
    location: '',
    search: '',
    minRating: 0,
    sortBy: 'createdAt',
  },
  loading: false,
  searchLoading: false,
  error: null,
  message: null,
};

// Publications slice
const publicationsSlice = createSlice({
  name: 'publications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentPublication: (state) => {
      state.currentPublication = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    updatePublicationInList: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.publications.findIndex(pub => pub._id === id);
      if (index !== -1) {
        state.publications[index] = { ...state.publications[index], ...updates };
      }
    },
    removePublicationFromList: (state, action) => {
      const id = action.payload;
      state.publications = state.publications.filter(pub => pub._id !== id);
      state.userPublications = state.userPublications.filter(pub => pub._id !== id);
    },
    addToFavorites: (state, action) => {
      const publication = action.payload;
      if (!state.favorites.find(fav => fav._id === publication._id)) {
        state.favorites.push(publication);
      }
    },
    removeFromFavorites: (state, action) => {
      const id = action.payload;
      state.favorites = state.favorites.filter(fav => fav._id !== id);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Publications
      .addCase(fetchPublications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublications.fulfilled, (state, action) => {
        state.loading = false;
        state.publications = action.payload.publications;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPublications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Publication By ID
      .addCase(fetchPublicationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPublication = action.payload.publication;
      })
      .addCase(fetchPublicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Publication
      .addCase(createPublication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPublication.fulfilled, (state, action) => {
        state.loading = false;
        state.publications.unshift(action.payload.publication);
        state.message = action.payload.message;
      })
      .addCase(createPublication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Publication
      .addCase(updatePublication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePublication.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPublication = action.payload.publication;
        
        // Update in publications list
        const index = state.publications.findIndex(pub => pub._id === updatedPublication._id);
        if (index !== -1) {
          state.publications[index] = updatedPublication;
        }
        
        // Update current publication if it's the same
        if (state.currentPublication && state.currentPublication._id === updatedPublication._id) {
          state.currentPublication = updatedPublication;
        }
        
        state.message = action.payload.message;
      })
      .addCase(updatePublication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Publication
      .addCase(deletePublication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePublication.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        state.publications = state.publications.filter(pub => pub._id !== id);
        state.userPublications = state.userPublications.filter(pub => pub._id !== id);
        state.message = 'Publicación eliminada exitosamente';
      })
      .addCase(deletePublication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Toggle Favorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        const publication = state.publications.find(pub => pub._id === id);
        if (publication) {
          publication.isFavorited = data.isFavorited;
          publication.favoritesCount = data.favoritesCount;
        }
        
        if (state.currentPublication && state.currentPublication._id === id) {
          state.currentPublication.isFavorited = data.isFavorited;
          state.currentPublication.favoritesCount = data.favoritesCount;
        }
        
        state.message = data.message;
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Search Publications
      .addCase(searchPublications.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchPublications.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.publications;
      })
      .addCase(searchPublications.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Popular Publications
      .addCase(fetchPopularPublications.fulfilled, (state, action) => {
        state.popularPublications = action.payload.publications;
      })
      
      // Fetch Recent Publications
      .addCase(fetchRecentPublications.fulfilled, (state, action) => {
        state.recentPublications = action.payload.publications;
      })
      
      // Fetch User Publications
      .addCase(fetchUserPublications.fulfilled, (state, action) => {
        state.userPublications = action.payload.publications;
      })
      
      // Report Publication
      .addCase(reportPublication.fulfilled, (state, action) => {
        state.message = action.payload.message;
      })
      .addCase(reportPublication.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Mark As Completed
      .addCase(markAsCompleted.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        const publication = state.publications.find(pub => pub._id === id);
        if (publication) {
          publication.status = 'completed';
        }
        
        if (state.currentPublication && state.currentPublication._id === id) {
          state.currentPublication.status = 'completed';
        }
        
        state.message = data.message;
      })
      .addCase(markAsCompleted.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Fetch Publication Stats
      .addCase(fetchPublicationStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
      })
      
      // Fetch Favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload.favorites || action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearMessage,
  setFilters,
  clearFilters,
  clearCurrentPublication,
  clearSearchResults,
  updatePublicationInList,
  removePublicationFromList,
  addToFavorites,
  removeFromFavorites,
} = publicationsSlice.actions;

export default publicationsSlice.reducer;