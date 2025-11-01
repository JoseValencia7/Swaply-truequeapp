import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  PhotoIcon,
  XMarkIcon,
  MapPinIcon,
  TagIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  PlusIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { createPublication } from '../../store/slices/publicationsSlice';
import { addToast } from '../../store/slices/uiSlice';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Componente para crear nuevas publicaciones de intercambio
 * Permite a los usuarios crear ofertas y solicitudes de intercambio
 */
const CreatePublication = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'offer', // 'offer' o 'request'
    condition: 'new',
    estimatedValue: '',
    location: '',
    tags: [],
    images: [],
    exchangePreferences: ''
  });
  const [errors, setErrors] = useState({});
  const [currentTag, setCurrentTag] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoading } = useSelector(state => state.publications);
  const { user } = useSelector(state => state.auth);

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

  // Condiciones del artículo
  const conditions = [
    { value: 'new', label: 'Nuevo' },
    { value: 'like_new', label: 'Como nuevo' },
    { value: 'good', label: 'Buen estado' },
    { value: 'fair', label: 'Estado regular' },
    { value: 'poor', label: 'Necesita reparación' }
  ];

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (formData.title.length < 5) {
      newErrors.title = 'El título debe tener al menos 5 caracteres';
    } else if (formData.title.length > 100) {
      newErrors.title = 'El título no puede exceder 100 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (formData.description.length < 20) {
      newErrors.description = 'La descripción debe tener al menos 20 caracteres';
    } else if (formData.description.length > 1000) {
      newErrors.description = 'La descripción no puede exceder 1000 caracteres';
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }

    if (formData.estimatedValue && isNaN(formData.estimatedValue)) {
      newErrors.estimatedValue = 'El valor debe ser un número válido';
    }

    if (formData.images.length === 0) {
      newErrors.images = 'Debes agregar al menos una imagen';
    } else if (formData.images.length > 10) {
      newErrors.images = 'No puedes agregar más de 10 imágenes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
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

  // Manejar archivos de imagen
  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isImage && isValidSize;
    });

    if (validFiles.length !== files.length) {
      dispatch(addToast({
        type: 'warning',
        message: 'Algunos archivos fueron omitidos. Solo se permiten imágenes menores a 5MB.'
      }));
    }

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 10)
    }));

    // Limpiar error de imágenes
    if (errors.images) {
      setErrors(prev => ({
        ...prev,
        images: ''
      }));
    }
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
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Eliminar imagen
  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  // Manejar tags
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim()) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const publicationData = new FormData();
      
      // Agregar datos del formulario
      Object.keys(formData).forEach(key => {
        if (key === 'images') {
          formData.images.forEach(image => {
            publicationData.append('images', image.file);
          });
        } else if (key === 'tags') {
          publicationData.append('tags', JSON.stringify(formData.tags));
        } else {
          publicationData.append(key, formData[key]);
        }
      });

      await dispatch(createPublication(publicationData)).unwrap();
      
      dispatch(addToast({
        type: 'success',
        message: 'Publicación creada exitosamente'
      }));
      
      navigate('/my-publications');
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error.message || 'Error al crear la publicación'
      }));
    }
  };

  // Limpiar URLs de preview al desmontar
  useEffect(() => {
    return () => {
      formData.images.forEach(image => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Crear nueva publicación
        </h1>
        <p className="text-gray-600 mt-2">
          Comparte lo que quieres intercambiar con la comunidad
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Tipo de publicación */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Tipo de publicación</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <label className={`cursor-pointer border-2 rounded-lg p-4 transition-colors ${
                formData.type === 'offer' 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="offer"
                  checked={formData.type === 'offer'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-2xl mb-2">🎁</div>
                  <h3 className="font-medium">Ofrezco</h3>
                  <p className="text-sm text-gray-600">Tengo algo para intercambiar</p>
                </div>
              </label>

              <label className={`cursor-pointer border-2 rounded-lg p-4 transition-colors ${
                formData.type === 'request' 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="request"
                  checked={formData.type === 'request'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-2xl mb-2">🔍</div>
                  <h3 className="font-medium">Busco</h3>
                  <p className="text-sm text-gray-600">Necesito algo específico</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Información básica */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Información básica</h2>
          </div>
          <div className="card-body space-y-6">
            {/* Título */}
            <div>
              <label htmlFor="title" className="label label-required">
                Título
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className={`input ${errors.title ? 'input-error' : ''}`}
                placeholder="Ej: iPhone 12 en excelente estado"
                maxLength={100}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.title && (
                  <p className="error-message">{errors.title}</p>
                )}
                <span className="text-xs text-gray-500 ml-auto">
                  {formData.title.length}/100
                </span>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="label label-required">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`input ${errors.description ? 'input-error' : ''}`}
                placeholder="Describe detalladamente el artículo, su estado, características especiales, etc."
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description && (
                  <p className="error-message">{errors.description}</p>
                )}
                <span className="text-xs text-gray-500 ml-auto">
                  {formData.description.length}/1000
                </span>
              </div>
            </div>

            {/* Categoría y Condición */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="label label-required">
                  Categoría
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`input ${errors.category ? 'input-error' : ''}`}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="error-message">{errors.category}</p>
                )}
              </div>

              <div>
                <label htmlFor="condition" className="label label-required">
                  Condición
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="input"
                >
                  {conditions.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Valor estimado y Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="estimatedValue" className="label">
                  Valor estimado (opcional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="estimatedValue"
                    name="estimatedValue"
                    type="number"
                    value={formData.estimatedValue}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.estimatedValue ? 'input-error' : ''}`}
                    placeholder="0"
                    min="0"
                  />
                </div>
                {errors.estimatedValue && (
                  <p className="error-message">{errors.estimatedValue}</p>
                )}
              </div>

              <div>
                <label htmlFor="location" className="label label-required">
                  Ubicación
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.location ? 'input-error' : ''}`}
                    placeholder="Ciudad, País"
                  />
                </div>
                {errors.location && (
                  <p className="error-message">{errors.location}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Imágenes */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Imágenes</h2>
            <p className="text-sm text-gray-600">
              Agrega hasta 10 imágenes (máximo 5MB cada una)
            </p>
          </div>
          <div className="card-body">
            {/* Zona de drop */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary-500 bg-primary-50' 
                  : errors.images 
                    ? 'border-error-300 bg-error-50'
                    : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary"
                >
                  Seleccionar imágenes
                </button>
                <p className="mt-2 text-sm text-gray-600">
                  o arrastra y suelta las imágenes aquí
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>

            {errors.images && (
              <p className="error-message mt-2">{errors.images}</p>
            )}

            {/* Preview de imágenes */}
            {formData.images.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Imágenes seleccionadas ({formData.images.length}/10)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute -top-2 -right-2 bg-error-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                          Principal
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tags y preferencias */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Etiquetas y preferencias</h2>
          </div>
          <div className="card-body space-y-6">
            {/* Tags */}
            <div>
              <label htmlFor="tags" className="label">
                Etiquetas (opcional)
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TagIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    className="input pl-10"
                    placeholder="Agregar etiqueta"
                    maxLength={20}
                  />
                </div>
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!currentTag.trim() || formData.tags.length >= 10}
                  className="btn btn-secondary"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="badge badge-primary flex items-center space-x-1"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-primary-200"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                Máximo 10 etiquetas. Presiona Enter para agregar.
              </p>
            </div>

            {/* Preferencias de intercambio */}
            <div>
              <label htmlFor="exchangePreferences" className="label">
                Preferencias de intercambio (opcional)
              </label>
              <textarea
                id="exchangePreferences"
                name="exchangePreferences"
                rows={3}
                value={formData.exchangePreferences}
                onChange={handleChange}
                className="input"
                placeholder="Describe qué tipo de artículos te interesan para el intercambio..."
                maxLength={500}
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-500">
                  {formData.exchangePreferences.length}/500
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-ghost"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" showText={false} />
                <span className="ml-2">Publicando...</span>
              </div>
            ) : (
              'Publicar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePublication;