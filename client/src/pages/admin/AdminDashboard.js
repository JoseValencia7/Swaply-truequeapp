import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaFileAlt, 
  FaComments, 
  FaChartLine,
  FaUserShield,
  FaExclamationTriangle,
  FaCog
} from 'react-icons/fa';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPublications: 0,
    totalMessages: 0,
    pendingReports: 0,
    activeUsers: 0,
    newUsersToday: 0
  });

  useEffect(() => {
    // Simular carga de estadísticas
    // En una implementación real, esto vendría de la API
    setStats({
      totalUsers: 1250,
      totalPublications: 3420,
      totalMessages: 8750,
      pendingReports: 12,
      activeUsers: 340,
      newUsersToday: 25
    });
  }, []);

  // Verificar si el usuario es administrador
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaUserShield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Acceso denegado</h3>
          <p className="mt-1 text-sm text-gray-500">
            No tienes permisos para acceder al panel de administración.
          </p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {value.toLocaleString()}
              </dd>
            </dl>
          </div>
        </div>
        {change && (
          <div className="mt-2">
            <span className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% desde ayer
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestiona usuarios, publicaciones y configuraciones del sistema
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <StatCard
            title="Total de Usuarios"
            value={stats.totalUsers}
            icon={FaUsers}
            color="text-blue-500"
            change={5.2}
          />
          <StatCard
            title="Publicaciones"
            value={stats.totalPublications}
            icon={FaFileAlt}
            color="text-green-500"
            change={12.1}
          />
          <StatCard
            title="Mensajes"
            value={stats.totalMessages}
            icon={FaComments}
            color="text-purple-500"
            change={8.7}
          />
          <StatCard
            title="Usuarios Activos"
            value={stats.activeUsers}
            icon={FaChartLine}
            color="text-yellow-500"
            change={-2.3}
          />
          <StatCard
            title="Nuevos Usuarios Hoy"
            value={stats.newUsersToday}
            icon={FaUsers}
            color="text-indigo-500"
            change={15.8}
          />
          <StatCard
            title="Reportes Pendientes"
            value={stats.pendingReports}
            icon={FaExclamationTriangle}
            color="text-red-500"
          />
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Gestión de Usuarios</h3>
            <div className="space-y-3">
              <Link
                to="/admin/users"
                className="block w-full text-left px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Ver todos los usuarios
              </Link>
              <Link
                to="/admin/users/moderators"
                className="block w-full text-left px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Gestionar moderadores
              </Link>
              <Link
                to="/admin/users/banned"
                className="block w-full text-left px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Usuarios suspendidos
              </Link>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Gestión de Contenido</h3>
            <div className="space-y-3">
              <Link
                to="/admin/publications"
                className="block w-full text-left px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Moderar publicaciones
              </Link>
              <Link
                to="/admin/reports"
                className="block w-full text-left px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Revisar reportes
              </Link>
              <Link
                to="/admin/categories"
                className="block w-full text-left px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Gestionar categorías
              </Link>
            </div>
          </div>
        </div>

        {/* Configuración del Sistema */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FaCog className="mr-2" />
            Configuración del Sistema
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/admin/settings/general"
              className="block p-4 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <h4 className="font-medium text-gray-900">Configuración General</h4>
              <p className="text-sm text-gray-500">Ajustes básicos del sistema</p>
            </Link>
            <Link
              to="/admin/settings/email"
              className="block p-4 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <h4 className="font-medium text-gray-900">Configuración de Email</h4>
              <p className="text-sm text-gray-500">Plantillas y configuración SMTP</p>
            </Link>
            <Link
              to="/admin/settings/security"
              className="block p-4 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <h4 className="font-medium text-gray-900">Seguridad</h4>
              <p className="text-sm text-gray-500">Políticas de seguridad y acceso</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;