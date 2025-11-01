import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  MagnifyingGlassIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { 
  fetchConversations,
  searchConversations,
  markAsRead
} from '../../store/slices/messageSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente de lista de conversaciones
 * Muestra todas las conversaciones del usuario con búsqueda y filtros
 */
const ConversationList = () => {
  const { conversationId } = useParams();
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, archived

  const { 
    conversations,
    isLoading,
    searchResults
  } = useSelector(state => state.messages);
  const { user } = useSelector(state => state.auth);

  // Cargar conversaciones
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Buscar conversaciones
  useEffect(() => {
    if (searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        dispatch(searchConversations(searchTerm));
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, dispatch]);

  // Filtrar conversaciones
  const getFilteredConversations = () => {
    let filtered = searchTerm.trim() ? searchResults : conversations;

    switch (filter) {
      case 'unread':
        return filtered.filter(conv => conv.unreadCount > 0);
      case 'archived':
        return filtered.filter(conv => conv.isArchived);
      default:
        return filtered.filter(conv => !conv.isArchived);
    }
  };

  // Formatear último mensaje
  const formatLastMessage = (message) => {
    if (!message) return 'Sin mensajes';

    switch (message.type) {
      case 'image':
        return '📷 Imagen';
      case 'file':
        return '📎 Archivo';
      default:
        return message.content.length > 50 
          ? `${message.content.substring(0, 50)}...`
          : message.content;
    }
  };

  // Formatear tiempo
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Ahora';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) { // 7 días
      return date.toLocaleDateString('es-CO', {
        weekday: 'short'
      });
    } else {
      return date.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  // Manejar clic en conversación
  const handleConversationClick = (conversation) => {
    if (conversation.unreadCount > 0) {
      dispatch(markAsRead(conversation.id));
    }
  };

  const filteredConversations = getFilteredConversations();

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Mensajes
          </h2>
          <Link
            to="/messages/new"
            className="btn btn-primary btn-sm"
            title="Nueva conversación"
          >
            <PlusIcon className="h-4 w-4" />
          </Link>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar conversaciones..."
            className="input input-bordered w-full pl-10"
          />
        </div>

        {/* Filtros */}
        <div className="flex space-x-2 mt-3">
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${
              filter === 'all' ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`btn btn-sm ${
              filter === 'unread' ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            No leídas
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`btn btn-sm ${
              filter === 'archived' ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            Archivadas
          </button>
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            <LoadingSpinner text="Cargando conversaciones..." />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            {searchTerm ? (
              <div>
                <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sin resultados
                </h3>
                <p className="text-gray-600">
                  No se encontraron conversaciones que coincidan con "{searchTerm}"
                </p>
              </div>
            ) : filter === 'unread' ? (
              <div>
                <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sin mensajes no leídos
                </h3>
                <p className="text-gray-600">
                  Todas tus conversaciones están al día
                </p>
              </div>
            ) : filter === 'archived' ? (
              <div>
                <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sin conversaciones archivadas
                </h3>
                <p className="text-gray-600">
                  Las conversaciones archivadas aparecerán aquí
                </p>
              </div>
            ) : (
              <div>
                <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sin conversaciones
                </h3>
                <p className="text-gray-600 mb-4">
                  Aún no tienes conversaciones. Inicia una nueva para comenzar a intercambiar.
                </p>
                <Link to="/messages/new" className="btn btn-primary">
                  Nueva conversación
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => {
              const isActive = conversationId === conversation.id;
              const otherUser = conversation.participants.find(p => p.id !== user?.id);
              
              return (
                <Link
                  key={conversation.id}
                  to={`/messages/${conversation.id}`}
                  onClick={() => handleConversationClick(conversation)}
                  className={`block p-4 hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {otherUser?.avatar ? (
                          <img
                            src={otherUser.avatar}
                            alt={otherUser.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      
                      {/* Indicador de estado en línea */}
                      {otherUser?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-success-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium truncate ${
                          conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {otherUser?.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                          {conversation.unreadCount > 0 && (
                            <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Último mensaje */}
                      <div className="flex items-center mt-1">
                        {conversation.lastMessage?.senderId === user?.id && (
                          <span className="text-gray-400 mr-1">
                            {conversation.lastMessage.read ? '✓✓' : '✓'}
                          </span>
                        )}
                        <p className={`text-sm truncate ${
                          conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                        }`}>
                          {formatLastMessage(conversation.lastMessage)}
                        </p>
                      </div>

                      {/* Información adicional */}
                      {conversation.relatedPublication && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">
                            Sobre: {conversation.relatedPublication.title}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Estadísticas */}
      {!isLoading && conversations.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {conversations.filter(c => !c.isArchived).length} conversaciones
            </span>
            <span>
              {conversations.filter(c => c.unreadCount > 0).length} no leídas
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationList;