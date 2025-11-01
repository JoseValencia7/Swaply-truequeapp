import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  UserIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { 
  searchUsers,
  createConversation,
  fetchPublicationById
} from '../../store/slices/messageSlice';
import { addToast } from '../../store/slices/uiSlice';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Componente para crear nuevas conversaciones
 * Permite buscar usuarios y enviar el primer mensaje
 */
const NewConversation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { 
    searchResults: users,
    isSearching,
    relatedPublication
  } = useSelector(state => state.messages);

  // Parámetros de URL
  const userId = searchParams.get('user');
  const publicationId = searchParams.get('publication');

  // Cargar datos iniciales
  useEffect(() => {
    if (publicationId) {
      dispatch(fetchPublicationById(publicationId));
    }
    
    if (userId) {
      // Buscar el usuario específico
      dispatch(searchUsers(''))
        .then((result) => {
          const user = result.payload?.find(u => u.id === userId);
          if (user) {
            setSelectedUser(user);
          }
        });
    }
  }, [dispatch, userId, publicationId]);

  // Buscar usuarios
  useEffect(() => {
    if (searchTerm.trim() && !selectedUser) {
      const timeoutId = setTimeout(() => {
        dispatch(searchUsers(searchTerm));
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, dispatch, selectedUser]);

  // Crear conversación
  const handleCreateConversation = async (e) => {
    e.preventDefault();
    
    if (!selectedUser || !message.trim()) return;

    setIsCreating(true);
    try {
      const conversationData = {
        participantId: selectedUser.id,
        message: message.trim(),
        publicationId: publicationId || null
      };

      const result = await dispatch(createConversation(conversationData)).unwrap();
      
      dispatch(addToast({
        type: 'success',
        message: 'Conversación iniciada exitosamente'
      }));

      navigate(`/messages/${result.conversationId}`);
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error.message || 'Error al crear la conversación'
      }));
    } finally {
      setIsCreating(false);
    }
  };

  // Seleccionar usuario
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchTerm('');
    
    // Mensaje predeterminado si hay una publicación relacionada
    if (publicationId && relatedPublication) {
      setMessage(`Hola, me interesa tu publicación "${relatedPublication.title}". ¿Podríamos hablar sobre el intercambio?`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/messages')}
          className="btn btn-ghost btn-sm mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Volver a mensajes
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Nueva Conversación
        </h1>
        <p className="text-gray-600 mt-2">
          Busca un usuario para iniciar una conversación
        </p>
      </div>

      {/* Publicación relacionada */}
      {relatedPublication && (
        <div className="card mb-6">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-2">
              Conversación sobre:
            </h3>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              {relatedPublication.images?.[0] && (
                <img
                  src={relatedPublication.images[0]}
                  alt={relatedPublication.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {relatedPublication.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {relatedPublication.type === 'offer' ? 'Oferta' : 'Búsqueda'} • {relatedPublication.category}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body space-y-6">
          {/* Búsqueda de usuarios */}
          {!selectedUser && (
            <div>
              <label className="label">
                <span className="label-text">Buscar usuario</span>
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  className="input input-bordered w-full pl-10"
                />
              </div>

              {/* Resultados de búsqueda */}
              {isSearching && (
                <div className="mt-4">
                  <LoadingSpinner size="sm" text="Buscando usuarios..." />
                </div>
              )}

              {users && users.length > 0 && searchTerm && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    {users.length} usuario(s) encontrado(s)
                  </p>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <UserIcon className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {user.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {user.email}
                            </p>
                            {user.location && (
                              <p className="text-xs text-gray-500">
                                📍 {user.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchTerm && !isSearching && users && users.length === 0 && (
                <div className="mt-4 text-center py-4">
                  <p className="text-gray-600">
                    No se encontraron usuarios con "{searchTerm}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Usuario seleccionado */}
          {selectedUser && (
            <div>
              <label className="label">
                <span className="label-text">Conversación con:</span>
              </label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {selectedUser.avatar ? (
                      <img
                        src={selectedUser.avatar}
                        alt={selectedUser.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {selectedUser.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="btn btn-ghost btn-sm"
                >
                  Cambiar
                </button>
              </div>
            </div>
          )}

          {/* Mensaje */}
          {selectedUser && (
            <form onSubmit={handleCreateConversation}>
              <div>
                <label className="label">
                  <span className="label-text">Primer mensaje *</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="textarea textarea-bordered w-full h-32"
                  required
                  maxLength={1000}
                />
                <div className="label">
                  <span className="label-text-alt">
                    {message.length}/1000 caracteres
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/messages')}
                  className="btn btn-ghost"
                  disabled={isCreating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!message.trim() || isCreating}
                >
                  {isCreating ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" showText={false} />
                      <span className="ml-2">Enviando...</span>
                    </div>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                      Enviar mensaje
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Consejos */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">
          💡 Consejos para una buena conversación
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Sé claro y específico sobre lo que buscas o ofreces</li>
          <li>• Mantén un tono respetuoso y amigable</li>
          <li>• Proporciona detalles relevantes sobre el intercambio</li>
          <li>• Responde de manera oportuna para mantener el interés</li>
        </ul>
      </div>
    </div>
  );
};

export default NewConversation;