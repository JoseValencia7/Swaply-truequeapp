import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import NewConversation from './NewConversation';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

/**
 * Componente principal de mensajes
 * Maneja el layout responsivo entre lista de conversaciones y chat
 */
const Messages = () => {
  const { conversationId } = useParams();

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Lista de conversaciones - Sidebar */}
      <div className={`w-full lg:w-1/3 xl:w-1/4 border-r border-gray-200 ${
        conversationId ? 'hidden lg:block' : 'block'
      }`}>
        <ConversationList />
      </div>

      {/* Área principal - Chat o placeholder */}
      <div className={`flex-1 ${
        conversationId ? 'block' : 'hidden lg:block'
      }`}>
        <Routes>
          {/* Nueva conversación */}
          <Route path="new" element={<NewConversation />} />
          
          {/* Chat específico */}
          <Route path=":conversationId" element={<ChatWindow />} />
          
          {/* Placeholder cuando no hay conversación seleccionada */}
          <Route path="" element={<MessagesPlaceholder />} />
        </Routes>
      </div>
    </div>
  );
};

/**
 * Placeholder que se muestra cuando no hay conversación seleccionada
 */
const MessagesPlaceholder = () => {
  return (
    <div className="h-full flex items-center justify-center bg-white">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400" />
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Bienvenido a tus mensajes
        </h2>
        
        <p className="text-gray-600 mb-8">
          Selecciona una conversación de la lista para comenzar a chatear, 
          o inicia una nueva conversación con otros usuarios de la comunidad.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-left">
              <h3 className="font-medium text-blue-900 mb-2">
                💬 Chatea de forma segura
              </h3>
              <p className="text-sm text-blue-800">
                Todas las conversaciones están protegidas y puedes reportar 
                cualquier comportamiento inapropiado.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg text-left">
              <h3 className="font-medium text-green-900 mb-2">
                🤝 Negocia intercambios
              </h3>
              <p className="text-sm text-green-800">
                Coordina los detalles de tus intercambios directamente 
                con otros miembros de la comunidad.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg text-left">
              <h3 className="font-medium text-purple-900 mb-2">
                📱 Mantente conectado
              </h3>
              <p className="text-sm text-purple-800">
                Recibe notificaciones en tiempo real cuando recibas 
                nuevos mensajes.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>
            ¿Necesitas ayuda? Consulta nuestras{' '}
            <a href="/help" className="text-primary-600 hover:text-primary-700">
              preguntas frecuentes
            </a>{' '}
            o{' '}
            <a href="/contact" className="text-primary-600 hover:text-primary-700">
              contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Messages;