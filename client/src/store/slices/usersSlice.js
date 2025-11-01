import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Thunks asíncronos
export const getUserProfile = createAsyncThunk(
  'users/getUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener perfil');
    }
  }
);

export const getUserPublications = createAsyncThunk(
  'users/getUserPublications',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/publications`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener publicaciones');
    }
  }
);

export const followUser = createAsyncThunk(
  'users/followUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/${userId}/follow`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al seguir usuario');
    }
  }
);

export const unfollowUser = createAsyncThunk(
  'users/unfollowUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/users/${userId}/follow`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al dejar de seguir');
    }
  }
);

export const getFollowers = createAsyncThunk(
  'users/getFollowers',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/followers`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener seguidores');
    }
  }
);

export const getFollowing = createAsyncThunk(
  'users/getFollowing',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/following`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener seguidos');
    }
  }
);

export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error en búsqueda');
    }
  }
);

export const reportUser = createAsyncThunk(
  'users/reportUser',
  async ({ userId, reason, description }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/${userId}/report`, {
        reason,
        description
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al reportar usuario');
    }
  }
);

const initialState = {
  selectedUser: null,
  userPublications: [],
  followers: [],
  following: [],
  searchResults: [],
  loading: false,
  error: null,
  message: null
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
      state.userPublications = [];
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Get user profile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get user publications
      .addCase(getUserPublications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserPublications.fulfilled, (state, action) => {
        state.loading = false;
        state.userPublications = action.payload;
      })
      .addCase(getUserPublications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Follow user
      .addCase(followUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.loading = false;
        state.message = 'Usuario seguido exitosamente';
        if (state.selectedUser) {
          state.selectedUser.isFollowing = true;
          state.selectedUser.followersCount = (state.selectedUser.followersCount || 0) + 1;
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Unfollow user
      .addCase(unfollowUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.loading = false;
        state.message = 'Dejaste de seguir al usuario';
        if (state.selectedUser) {
          state.selectedUser.isFollowing = false;
          state.selectedUser.followersCount = Math.max((state.selectedUser.followersCount || 1) - 1, 0);
        }
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get followers
      .addCase(getFollowers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFollowers.fulfilled, (state, action) => {
        state.loading = false;
        state.followers = action.payload;
      })
      .addCase(getFollowers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get following
      .addCase(getFollowing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFollowing.fulfilled, (state, action) => {
        state.loading = false;
        state.following = action.payload;
      })
      .addCase(getFollowing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Report user
      .addCase(reportUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reportUser.fulfilled, (state, action) => {
        state.loading = false;
        state.message = 'Reporte enviado exitosamente';
      })
      .addCase(reportUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearMessage,
  clearSelectedUser,
  clearSearchResults
} = usersSlice.actions;

export default usersSlice.reducer;