import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  KeyIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  updateUserSettings,
  changePassword,
  deleteAccount
} from '../../store/slices/userSlice';
import { addToast } from '../../store/slices/uiSlice';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Componente de configuración de perfil
 * Permite al usuario gestionar configuraciones de privacidad, notificaciones y seguridad
 */
const ProfileSettings = () => {
  const dispatch = useDispatch();
  const { user, settings, isLoading } = useSelector(state => state.user);

  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estados para configuraciones
  const [profileSettings, setProfileSettings] = useState({
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowMessages: true,
    showOnlineStatus: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newMessages: true,
    publicationUpdates: true,
    exchangeRequests: true,
    systemUpdates: false,
    marketingEmails: false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Cargar configuraciones existentes
  useEffect(() => {
    if (settings) {
      setProfileSettings(prev => ({ ...prev, ...settings.privacy }));
      setNotificationSettings(prev => ({ ...prev, ...settings.notifications }));
    }
  }, [settings]);

  // Manejar cambios en configuraciones de perfil
  const handleProfileSettingChange = (setting, value) => {
    setProfileSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Manejar cambios en configuraciones de notificaciones
  const handleNotificationSettingChange = (setting, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Guardar configuraciones
  const handleSaveSettings = async () => {
    setIsUpdating(true);
    try {
      await dispatch(updateUserSettings({
        privacy: profileSettings,
        notifications: notificationSettings
      })).unwrap();

      dispatch(addToast({
        type: 'success',
        message: 'Configuraciones guardadas exitosamente'
      }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Error al guardar las configuraciones'
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      dispatch(addToast({
        type: 'error',
        message: 'Las contraseñas no coinciden'
      }));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      dispatch(addToast({
        type: 'error',
        message: 'La contraseña debe tener al menos 6 caracteres'
      }));
      return;
    }

    setIsUpdating(true);
    try {
      await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })).unwrap();

      dispatch(addToast({
        type: 'success',
        message: 'Contraseña cambiada exitosamente'
      }));

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error.message || 'Error al cambiar la contraseña'
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  // Eliminar cuenta
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'ELIMINAR') {
      dispatch(addToast({
        type: 'error',
        message: 'Debes escribir "ELIMINAR" para confirmar'
      }));
      return;
    }

    setIsUpdating(true);
    try {
      await dispatch(deleteAccount()).unwrap();
      dispatch(addToast({
        type: 'success',
        message: 'Cuenta eliminada exitosamente'
      }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Error al eliminar la cuenta'
      }));
      setIsUpdating(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: UserIcon },
    { id: 'notifications', name: 'Notificaciones', icon: BellIcon },
    { id: 'privacy', name: 'Privacidad', icon: EyeIcon },
    { id: 'security', name: 'Seguridad', icon: ShieldCheckIcon }
  ];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingSpinner text="Cargando configuraciones..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Configuración de perfil
        </h1>
        <p className="text-gray-600">
          Gestiona tu información personal, privacidad y configuraciones de notificaciones
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navegación de pestañas */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenido de pestañas */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="card-body">
              {/* Pestaña de Perfil */}
              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Configuración de perfil</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Mostrar email público</span>
                          <p className="text-sm text-gray-600">
                            Otros usuarios podrán ver tu dirección de email
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={profileSettings.showEmail}
                          onChange={(e) => handleProfileSettingChange('showEmail', e.target.checked)}
                        />
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Mostrar teléfono público</span>
                          <p className="text-sm text-gray-600">
                            Otros usuarios podrán ver tu número de teléfono
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={profileSettings.showPhone}
                          onChange={(e) => handleProfileSettingChange('showPhone', e.target.checked)}
                        />
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Mostrar ubicación</span>
                          <p className="text-sm text-gray-600">
                            Otros usuarios podrán ver tu ubicación general
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={profileSettings.showLocation}
                          onChange={(e) => handleProfileSettingChange('showLocation', e.target.checked)}
                        />
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Permitir mensajes</span>
                          <p className="text-sm text-gray-600">
                            Otros usuarios pueden enviarte mensajes directos
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={profileSettings.allowMessages}
                          onChange={(e) => handleProfileSettingChange('allowMessages', e.target.checked)}
                        />
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Mostrar estado en línea</span>
                          <p className="text-sm text-gray-600">
                            Otros usuarios pueden ver cuando estás conectado
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={profileSettings.showOnlineStatus}
                          onChange={(e) => handleProfileSettingChange('showOnlineStatus', e.target.checked)}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Pestaña de Notificaciones */}
              {activeTab === 'notifications' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Configuración de notificaciones</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-4">Métodos de notificación</h4>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">Notificaciones por email</span>
                            <p className="text-sm text-gray-600">
                              Recibir notificaciones en tu correo electrónico
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={notificationSettings.emailNotifications}
                            onChange={(e) => handleNotificationSettingChange('emailNotifications', e.target.checked)}
                          />
                        </label>

                        <label className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">Notificaciones push</span>
                            <p className="text-sm text-gray-600">
                              Recibir notificaciones en el navegador
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={notificationSettings.pushNotifications}
                            onChange={(e) => handleNotificationSettingChange('pushNotifications', e.target.checked)}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-4">Tipos de notificaciones</h4>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between">
                          <span>Nuevos mensajes</span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={notificationSettings.newMessages}
                            onChange={(e) => handleNotificationSettingChange('newMessages', e.target.checked)}
                          />
                        </label>

                        <label className="flex items-center justify-between">
                          <span>Actualizaciones de publicaciones</span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={notificationSettings.publicationUpdates}
                            onChange={(e) => handleNotificationSettingChange('publicationUpdates', e.target.checked)}
                          />
                        </label>

                        <label className="flex items-center justify-between">
                          <span>Solicitudes de intercambio</span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={notificationSettings.exchangeRequests}
                            onChange={(e) => handleNotificationSettingChange('exchangeRequests', e.target.checked)}
                          />
                        </label>

                        <label className="flex items-center justify-between">
                          <span>Actualizaciones del sistema</span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={notificationSettings.systemUpdates}
                            onChange={(e) => handleNotificationSettingChange('systemUpdates', e.target.checked)}
                          />
                        </label>

                        <label className="flex items-center justify-between">
                          <span>Emails de marketing</span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={notificationSettings.marketingEmails}
                            onChange={(e) => handleNotificationSettingChange('marketingEmails', e.target.checked)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pestaña de Privacidad */}
              {activeTab === 'privacy' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Configuración de privacidad</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <EyeIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-800">
                            Control de privacidad
                          </h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Estas configuraciones controlan qué información es visible para otros usuarios.
                            Puedes cambiarlas en cualquier momento.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-4">Información visible</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>Perfil público</span>
                          <span className="text-sm text-gray-600">Siempre visible</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>Historial de intercambios</span>
                          <span className="text-sm text-gray-600">Visible para usuarios verificados</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>Calificaciones y reseñas</span>
                          <span className="text-sm text-gray-600">Siempre visible</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-4">Datos y descargas</h4>
                      <div className="space-y-3">
                        <button className="btn btn-outline w-full">
                          Descargar mis datos
                        </button>
                        <p className="text-sm text-gray-600">
                          Descarga una copia de toda tu información almacenada en nuestra plataforma.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pestaña de Seguridad */}
              {activeTab === 'security' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Configuración de seguridad</h3>
                  
                  <div className="space-y-8">
                    {/* Cambiar contraseña */}
                    <div>
                      <h4 className="font-medium mb-4">Cambiar contraseña</h4>
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                          <label className="label">
                            <span className="label-text">Contraseña actual</span>
                          </label>
                          <input
                            type="password"
                            className="input input-bordered w-full"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({
                              ...prev,
                              currentPassword: e.target.value
                            }))}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="label">
                            <span className="label-text">Nueva contraseña</span>
                          </label>
                          <input
                            type="password"
                            className="input input-bordered w-full"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({
                              ...prev,
                              newPassword: e.target.value
                            }))}
                            required
                            minLength="6"
                          />
                        </div>
                        
                        <div>
                          <label className="label">
                            <span className="label-text">Confirmar nueva contraseña</span>
                          </label>
                          <input
                            type="password"
                            className="input input-bordered w-full"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({
                              ...prev,
                              confirmPassword: e.target.value
                            }))}
                            required
                            minLength="6"
                          />
                        </div>
                        
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isUpdating}
                        >
                          <KeyIcon className="h-4 w-4 mr-2" />
                          {isUpdating ? 'Cambiando...' : 'Cambiar contraseña'}
                        </button>
                      </form>
                    </div>

                    {/* Sesiones activas */}
                    <div>
                      <h4 className="font-medium mb-4">Sesiones activas</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">Sesión actual</p>
                            <p className="text-sm text-gray-600">
                              {navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Navegador'} • 
                              Última actividad: Ahora
                            </p>
                          </div>
                          <span className="badge badge-success">Activa</span>
                        </div>
                      </div>
                    </div>

                    {/* Zona de peligro */}
                    <div className="border-t pt-8">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-red-800 mb-2">
                              Zona de peligro
                            </h4>
                            <p className="text-sm text-red-700 mb-4">
                              Una vez que elimines tu cuenta, no hay vuelta atrás. 
                              Por favor, asegúrate de que realmente quieres hacer esto.
                            </p>
                            <button
                              onClick={() => setShowDeleteModal(true)}
                              className="btn btn-error btn-sm"
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Eliminar cuenta
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              {(activeTab === 'profile' || activeTab === 'notifications') && (
                <div className="flex justify-end pt-6 border-t">
                  <button
                    onClick={handleSaveSettings}
                    className="btn btn-primary"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <LoadingSpinner size="sm" showText={false} />
                    ) : (
                      'Guardar cambios'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar cuenta */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-red-600 mb-4">
              ¿Eliminar cuenta permanentemente?
            </h3>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Esta acción no se puede deshacer. Se eliminarán permanentemente:
              </p>
              
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Tu perfil y toda tu información personal</li>
                <li>Todas tus publicaciones y mensajes</li>
                <li>Tu historial de intercambios</li>
                <li>Todas las calificaciones y reseñas</li>
              </ul>
              
              <div>
                <label className="label">
                  <span className="label-text">
                    Para confirmar, escribe <strong>ELIMINAR</strong> en el campo:
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="ELIMINAR"
                />
              </div>
            </div>
            
            <div className="modal-action">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="btn btn-ghost"
                disabled={isUpdating}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                className="btn btn-error"
                disabled={isUpdating || deleteConfirmation !== 'ELIMINAR'}
              >
                {isUpdating ? (
                  <LoadingSpinner size="sm" showText={false} />
                ) : (
                  'Eliminar cuenta'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;