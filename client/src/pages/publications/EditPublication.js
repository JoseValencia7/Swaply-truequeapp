import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPublicationById, updatePublication } from '../../store/slices/publicationsSlice';

const EditPublication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { selectedPublication, loading } = useSelector((state) => state.publications);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    location: '',
    exchangePreferences: ''
  });

  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'electronics', label: 'Electrónicos' },
    { value: 'clothing', label: 'Ropa' },
    { value: 'books', label: 'Libros' },
    { value: 'home', label: 'Hogar' },
    { value: 'sports', label: 'Deportes' },
    { value: 'toys', label: 'Juguetes' },
    { value: 'other', label: 'Otros' }
  ];

  const conditions = [
    { value: 'new', label: 'Nuevo' },
    { value: 'like-new', label: 'Como nuevo' },
    { value: 'good', label: 'Bueno' },
    { value: 'fair', label: 'Regular' }
  ];

  useEffect(() => {
    if (id) {
      dispatch(fetchPublicationById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedPublication) {
      // Verificar que el usuario sea el propietario
      if (selectedPublication.user._id !== user?._id) {
        navigate('/publications');
        return;
      }

      setFormData({
        title: selectedPublication.title || '',
        description: selectedPublication.description || '',
        category: selectedPublication.category || '',
        condition: selectedPublication.condition || '',
        location: selectedPublication.location || '',
        exchangePreferences: selectedPublication.exchangePreferences || ''
      });
    }
  }, [selectedPublication, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Limpiar error del campo
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }

    if (!formData.condition) {
      newErrors.condition = 'La condición es requerida';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(updatePublication({
        id: selectedPublication._id,
        data: formData
      }));
      
      if (result.type === 'publications/updatePublication/fulfilled') {
        navigate(`/publications/${selectedPublication._id}`);
      }
    } catch (error) {
      console.error('Error updating publication:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            La publicación que intentas editar no existe
          </p>
        </div>
      </div>
    );
  }

  if (!user || selectedPublication.user._id !== user._id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso denegado
          </h2>
          <p className="text-gray-600">
            No tienes permisos para editar esta publicación
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Editar Publicación</h1>
            <p className="mt-2 text-gray-600">
              Actualiza la información de tu publicación
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                placeholder="¿Qué quieres intercambiar?"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Describe tu artículo, su estado, historia, etc."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Categoría y Condición */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`input-field ${errors.category ? 'border-red-500' : ''}`}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condición *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className={`input-field ${errors.condition ? 'border-red-500' : ''}`}
                >
                  <option value="">Selecciona la condición</option>
                  {conditions.map(cond => (
                    <option key={cond.value} value={cond.value}>
                      {cond.label}
                    </option>
                  ))}
                </select>
                {errors.condition && (
                  <p className="mt-1 text-sm text-red-600">{errors.condition}</p>
                )}
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`input-field ${errors.location ? 'border-red-500' : ''}`}
                placeholder="Ciudad, región o área"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            {/* Preferencias de intercambio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Qué te gustaría recibir a cambio?
              </label>
              <textarea
                name="exchangePreferences"
                value={formData.exchangePreferences}
                onChange={handleChange}
                rows={3}
                className="input-field"
                placeholder="Describe qué tipo de artículos te interesan para el intercambio"
              />
            </div>

            {/* Imágenes actuales */}
            {selectedPublication.images && selectedPublication.images.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imágenes actuales
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {selectedPublication.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Para cambiar las imágenes, contacta al soporte
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/publications/${selectedPublication._id}`)}
                className="btn-secondary px-6"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPublication;