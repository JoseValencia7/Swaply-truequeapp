import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { 
  fetchPublicationById,
  updatePublication
} from '../../store/slices/publicationSlice';
import { addToast } from '../../store/slices/uiSlice';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Componente para editar una publicación existente
 * Permite modificar todos los campos de la publicación
 */
const EditPublication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { 
    currentPublication: publication, 
    isLoading, 
    isUpdating 
  } = useSelector(state => state.publications);
  const { user } = useSelector(state => state.auth);

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'offer',
    condition: '',
    estimatedValue: '',
    location: '',
    exchangePreferences: '',
    tags: [],
    images: []
  });

  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Categorías disponibles
  const categories = [
    { value: 'electronics', label: 'Electrónicos' },
    { value: 'clothing', label: 'Ropa y Accesorios' },
    { value: 'books', label: 'Libros y Medios' },
    { value: 'sports', label: 'Deportes y Recreación' },
    { value: 'home', label: 'Hogar y Jardín' },
    { value: 'vehicles', label: 'Vehículos' },
    { value: 'tools', label: 'Herramientas' },
    { value: 'toys', label: 'Juguetes y Juegos' },
    { value: 'art', label: 'Arte y Manualidades' },
    { value: 'music', label: 'Instrumentos Musicales' },
    { value: 'other', label: 'Otros' }
  ];

  // Condiciones disponibles
  const conditions = [
    { value: 'new', label: 'Nuevo' },
    { value: 'like_new', label: 'Como nuevo' },
    { value: 'good', label: 'Buen estado' },
    { value: 'fair', label: 'Estado regular' },
    { value: 'poor', label: 'Necesita reparación' }
  ];

  // Cargar publicación
  useEffect(() => {
    if (id) {
      dispatch(fetchPublicationById(id));
    }
  }, [dispatch, id]);

  // Llenar formulario cuando se carga la publicación
  useEffect(() => {
    if (publication) {
      // Verificar que el usuario sea el propietario
      if (user && publication.userId !== user.id) {
        navigate('/publications');
        return;
      }

      setFormData({
        title: publication.title || '',
        description: publication.description || '',
        category: publication.category || '',
        type: publication.type || 'offer',
        condition: publication.condition || '',
        estimatedValue: publication.estimatedValue || '',
        location: publication.location || '',
        exchangePreferences: publication.exchangePreferences || '',
        tags: publication.tags || [],
        images: publication.images || []
      });
    }
  }, [publication, user, navigate]);

  // Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (formData.title.length < 5) {
      newErrors.title = 'El título debe tener al menos 5 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (formData.description.length < 20) {
      newErrors.description = 'La descripción debe tener al menos 20 caracteres';
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

    if (formData.estimatedValue && isNaN(formData.estimatedValue)) {
      newErrors.estimatedValue = 'El valor debe ser un número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const updateData = {
        ...formData,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null
      };

      await dispatch(updatePublication({ 
        id: publication.id, 
        data: updateData 
      })).unwrap();

      dispatch(addToast({
        type: 'success',
        message: 'Publicación actualizada exitosamente'
      }));

      navigate(`/publications/${publication.id}`);
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error.message || 'Error al actualizar la publicación'
      }));
    }
  };

  // Manejar tags
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Manejar imágenes
  const handleImageUpload = (files) => {
    const newImages = Array.from(files).slice(0, 5 - formData.images.length);
    
    newImages.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, e.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Manejar drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingSpinner text="Cargando publicación..." />
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Publicación no encontrada
          </h2>
          <p className="text-gray-600 mb-6">
            La publicación que intentas editar no existe.
          </p>
          <button
            onClick={() => navigate('/my-publications')}
            className="btn btn-primary"
          >
            Volver a mis publicaciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Volver
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Editar Publicación
        </h1>
        <p className="text-gray-600 mt-2">
          Modifica los detalles de tu publicación
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información básica */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Información básica</h2>
          </div>
          <div className="card-body space-y-6">
            {/* Tipo */}
            <div>
              <label className="label">
                <span className="label-text">Tipo de publicación *</span>
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="offer"
                    checked={formData.type === 'offer'}
                    onChange={handleInputChange}
                    className="radio radio-primary mr-2"
                  />
                  <span>Ofrezco</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="request"
                    checked={formData.type === 'request'}
                    onChange={handleInputChange}
                    className="radio radio-primary mr-2"
                  />
                  <span>Busco</span>
                </label>
              </div>
            </div>

            {/* Título */}
            <div>
              <label className="label">
                <span className="label-text">Título *</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
                placeholder="Ej: iPhone 12 Pro en excelente estado"
                maxLength={100}
              />
              {errors.title && (
                <div className="label">
                  <span className="label-text-alt text-error">{errors.title}</span>
                </div>
              )}
              <div className="label">
                <span className="label-text-alt">{formData.title.length}/100 caracteres</span>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="label">
                <span className="label-text">Descripción *</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`textarea textarea-bordered w-full h-32 ${errors.description ? 'textarea-error' : ''}`}
                placeholder="Describe detalladamente lo que ofreces o buscas..."
                maxLength={1000}
              />
              {errors.description && (
                <div className="label">
                  <span className="label-text-alt text-error">{errors.description}</span>
                </div>
              )}
              <div className="label">
                <span className="label-text-alt">{formData.description.length}/1000 caracteres</span>
              </div>
            </div>

            {/* Categoría y Condición */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <span className="label-text">Categoría *</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`select select-bordered w-full ${errors.category ? 'select-error' : ''}`}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <div className="label">
                    <span className="label-text-alt text-error">{errors.category}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Condición *</span>
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className={`select select-bordered w-full ${errors.condition ? 'select-error' : ''}`}
                >
                  <option value="">Selecciona la condición</option>
                  {conditions.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
                {errors.condition && (
                  <div className="label">
                    <span className="label-text-alt text-error">{errors.condition}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Valor estimado y Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <span className="label-text">Valor estimado (COP)</span>
                </label>
                <input
                  type="number"
                  name="estimatedValue"
                  value={formData.estimatedValue}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full ${errors.estimatedValue ? 'input-error' : ''}`}
                  placeholder="50000"
                  min="0"
                />
                {errors.estimatedValue && (
                  <div className="label">
                    <span className="label-text-alt text-error">{errors.estimatedValue}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Ubicación *</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full ${errors.location ? 'input-error' : ''}`}
                  placeholder="Ej: Bogotá, Colombia"
                />
                {errors.location && (
                  <div className="label">
                    <span className="label-text-alt text-error">{errors.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preferencias de intercambio */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Preferencias de intercambio</h2>
          </div>
          <div className="card-body">
            <div>
              <label className="label">
                <span className="label-text">¿Qué te interesa a cambio?</span>
              </label>
              <textarea
                name="exchangePreferences"
                value={formData.exchangePreferences}
                onChange={handleInputChange}
                className="textarea textarea-bordered w-full h-24"
                placeholder="Describe qué tipo de intercambio te interesa..."
                maxLength={500}
              />
              <div className="label">
                <span className="label-text-alt">{formData.exchangePreferences.length}/500 caracteres</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Etiquetas</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="input input-bordered flex-1"
                  placeholder="Agregar etiqueta"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn btn-primary"
                  disabled={!newTag.trim() || formData.tags.length >= 10}
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="badge badge-secondary gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="btn btn-ghost btn-xs p-0"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-600">
                Máximo 10 etiquetas. Las etiquetas ayudan a otros usuarios a encontrar tu publicación.
              </p>
            </div>
          </div>
        </div>

        {/* Imágenes */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Imágenes</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {/* Área de subida */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Arrastra imágenes aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Máximo 5 imágenes. Formatos: JPG, PNG, WebP
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                  disabled={formData.images.length >= 5}
                />
                <label
                  htmlFor="image-upload"
                  className={`btn ${formData.images.length >= 5 ? 'btn-disabled' : 'btn-primary'}`}
                >
                  Seleccionar imágenes
                </label>
              </div>

              {/* Vista previa de imágenes */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 btn btn-error btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-ghost"
            disabled={isUpdating}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" showText={false} />
                <span className="ml-2">Actualizando...</span>
              </div>
            ) : (
              'Actualizar publicación'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPublication;