import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowLeftIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  PaperClipIcon,
  EllipsisVerticalIcon,
  UserIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';
import { 
  fetchConversation,
  sendMessage,
  markAsRead,
  blockUser,
  reportConversation
} from '../../store/slices/messageSlice';
import { addToast } from '../../store/slices/uiSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente principal de la ventana de chat
 * Permite enviar y recibir mensajes en tiempo real
 */
const ChatWindow = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [message, setMessage] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { 
    currentConversation,
    messages,
    isLoading,
    isSending
  } = useSelector(state => state.messages);
  const { user } = useSelector(state => state.auth);

  // Cargar conversación
  useEffect(() => {
    if (conversationId) {
      dispatch(fetchConversation(conversationId));
      dispatch(markAsRead(conversationId));
    }
  }, [dispatch, conversationId]);

  // Scroll automático al final
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Enviar mensaje
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    const messageData = {
      conversationId,
      content: message.trim(),
      type: 'text'
    };

    try {
      await dispatch(sendMessage(messageData)).unwrap();
      setMessage('');
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Error al enviar mensaje'
      }));
    }
  };

  // Manejar archivos
  const handleFileUpload = async (files) => {
    const file = files[0];
    if (!file) return;

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      dispatch(addToast({
        type: 'error',
        message: 'El archivo es demasiado grande (máximo 10MB)'
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const messageData = {
        conversationId,
        content: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        fileData: e.target.result,
        fileName: file.name,
        fileSize: file.size
      };

      try {
        await dispatch(sendMessage(messageData)).unwrap();
      } catch (error) {
        dispatch(addToast({
          type: 'error',
          message: 'Error al enviar archivo'
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Bloquear usuario
  const handleBlockUser = async () => {
    if (!currentConversation?.otherUser) return;

    try {
      await dispatch(blockUser(currentConversation.otherUser.id)).unwrap();
      dispatch(addToast({
        type: 'success',
        message: 'Usuario bloqueado exitosamente'
      }));
      navigate('/messages');
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Error al bloquear usuario'
      }));
    }
  };

  // Reportar conversación
  const handleReport = async () => {
    try {
      await dispatch(reportConversation(conversationId)).unwrap();
      dispatch(addToast({
        type: 'success',
        message: 'Conversación reportada exitosamente'
      }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Error al reportar conversación'
      }));
    }
  };

  // Formatear tiempo del mensaje
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: es
      });
    }
  };

  // Renderizar mensaje
  const renderMessage = (msg) => {
    const isOwn = msg.senderId === user?.id;
    
    return (
      <div
        key={msg.id}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
          {/* Avatar del remitente */}
          {!isOwn && (
            <div className="flex items-center mb-1">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                {currentConversation?.otherUser?.avatar ? (
                  <img
                    src={currentConversation.otherUser.avatar}
                    alt={currentConversation.otherUser.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <span className="text-xs text-gray-600">
                {currentConversation?.otherUser?.name}
              </span>
            </div>
          )}

          {/* Contenido del mensaje */}
          <div
            className={`px-4 py-2 rounded-lg ${
              isOwn
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {msg.type === 'text' && (
              <p className="whitespace-pre-wrap">{msg.content}</p>
            )}
            
            {msg.type === 'image' && (
              <div>
                <img
                  src={msg.fileData}
                  alt={msg.fileName}
                  className="max-w-full h-auto rounded-lg mb-2"
                />
                <p className="text-sm opacity-75">{msg.fileName}</p>
              </div>
            )}
            
            {msg.type === 'file' && (
              <div className="flex items-center space-x-2">
                <PaperClipIcon className="h-5 w-5" />
                <div>
                  <p className="font-medium">{msg.fileName}</p>
                  <p className="text-xs opacity-75">
                    {(msg.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatMessageTime(msg.createdAt)}
            {isOwn && msg.read && (
              <span className="ml-1 text-primary-500">✓✓</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner text="Cargando conversación..." />
      </div>
    );
  }

  if (!currentConversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Conversación no encontrada
          </h3>
          <p className="text-gray-600 mb-4">
            La conversación que buscas no existe o no tienes acceso a ella.
          </p>
          <button
            onClick={() => navigate('/messages')}
            className="btn btn-primary"
          >
            Volver a mensajes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/messages')}
            className="btn btn-ghost btn-sm mr-3 lg:hidden"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
          
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
              {currentConversation.otherUser?.avatar ? (
                <img
                  src={currentConversation.otherUser.avatar}
                  alt={currentConversation.otherUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {currentConversation.otherUser?.name}
              </h3>
              <p className="text-sm text-gray-600">
                {currentConversation.otherUser?.isOnline ? 'En línea' : 'Desconectado'}
              </p>
            </div>
          </div>
        </div>

        {/* Opciones */}
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="btn btn-ghost btn-sm"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>

          {showOptions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => {
                  handleReport();
                  setShowOptions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                Reportar conversación
              </button>
              <button
                onClick={() => {
                  handleBlockUser();
                  setShowOptions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-error-600 hover:bg-gray-50 flex items-center"
              >
                <NoSymbolIcon className="h-4 w-4 mr-2" />
                Bloquear usuario
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No hay mensajes aún. ¡Envía el primer mensaje!
            </p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          {/* Botón de archivo */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-ghost btn-sm p-2"
            title="Adjuntar archivo"
          >
            <PaperClipIcon className="h-5 w-5" />
          </button>

          {/* Input de texto */}
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Escribe un mensaje..."
              className="textarea textarea-bordered w-full resize-none"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>

          {/* Botón enviar */}
          <button
            type="submit"
            disabled={!message.trim() || isSending}
            className="btn btn-primary btn-sm"
          >
            {isSending ? (
              <LoadingSpinner size="sm" showText={false} />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </form>

        {/* Input de archivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
      </div>
    </div>
  );
};

export default ChatWindow;