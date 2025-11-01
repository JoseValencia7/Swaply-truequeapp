# 🔄 Sistema de Intercambio - TruequeApp

Una plataforma web moderna para facilitar el intercambio de bienes y servicios entre usuarios, construida con tecnologías de vanguardia.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API Documentation](#-api-documentation)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## ✨ Características

### 🔐 Autenticación y Seguridad
- Registro y login de usuarios con validación robusta
- Autenticación JWT con refresh tokens
- Recuperación de contraseña por email
- Verificación de cuenta por email
- Protección contra ataques CSRF y XSS

### 👤 Gestión de Perfiles
- Perfiles de usuario completos con avatar
- Sistema de reputación y calificaciones
- Historial de intercambios
- Configuraciones de privacidad personalizables
- Sistema de insignias y logros

### 📝 Publicaciones de Intercambio
- Crear ofertas y solicitudes de intercambio
- Categorización avanzada de productos/servicios
- Galería de imágenes con drag & drop
- Filtros y búsqueda inteligente
- Geolocalización para intercambios locales

### 💬 Sistema de Mensajería
- Chat en tiempo real entre usuarios
- Envío de archivos e imágenes
- Indicadores de estado (en línea, escribiendo)
- Historial de conversaciones
- Notificaciones push

### 🔍 Búsqueda y Filtros
- Búsqueda por texto, categoría y ubicación
- Filtros avanzados (precio, condición, distancia)
- Ordenamiento personalizable
- Sugerencias de búsqueda
- Búsqueda geográfica con mapas

### 📊 Sistema de Reputación
- Calificaciones de 1-5 estrellas
- Comentarios y reseñas detalladas
- Cálculo automático de reputación
- Insignias por logros
- Historial de transacciones

### 🔔 Notificaciones
- Notificaciones en tiempo real
- Configuración personalizable
- Múltiples canales (email, push, in-app)
- Historial de notificaciones

## 🛠 Tecnologías

### Frontend
- **React 18** - Biblioteca de UI con hooks y context
- **Redux Toolkit** - Gestión de estado global
- **React Router v6** - Enrutamiento SPA
- **Tailwind CSS** - Framework de estilos utility-first
- **DaisyUI** - Componentes pre-diseñados para Tailwind
- **Heroicons** - Iconografía moderna
- **Socket.io Client** - Comunicación en tiempo real
- **Axios** - Cliente HTTP
- **React Hook Form** - Gestión de formularios
- **Date-fns** - Manipulación de fechas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web minimalista
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **Socket.io** - WebSockets para tiempo real
- **JWT** - Autenticación basada en tokens
- **Bcrypt** - Hashing de contraseñas
- **Multer** - Manejo de archivos
- **Nodemailer** - Envío de emails
- **Express Validator** - Validación de datos

### DevOps y Herramientas
- **Docker** - Containerización
- **Docker Compose** - Orquestación de contenedores
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Jest** - Testing framework
- **Postman** - Testing de APIs

## 🏗 Arquitectura

### Arquitectura General
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React SPA)   │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • Redux Store   │    │ • Express API   │    │ • Collections   │
│ • Components    │    │ • Socket.io     │    │ • Indexes       │
│ • Services      │    │ • Middleware    │    │ • Aggregations  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Patrón de Arquitectura
- **Frontend**: Arquitectura basada en componentes con Redux para estado global
- **Backend**: API RESTful con arquitectura MVC
- **Database**: Modelado de datos NoSQL con referencias y embebidos
- **Real-time**: WebSockets para funcionalidades en tiempo real

### Flujo de Datos
1. **Usuario** interactúa con **React Components**
2. **Components** disparan **Redux Actions**
3. **Actions** realizan llamadas a **API Services**
4. **Backend** procesa requests y actualiza **MongoDB**
5. **Socket.io** notifica cambios en tiempo real
6. **Frontend** actualiza UI reactivamente

## 🚀 Instalación

### Prerrequisitos
- Node.js 16+ y npm/yarn
- MongoDB 5.0+
- Git

### Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/trueque-app.git
cd trueque-app
```

2. **Instalar dependencias del backend**
```bash
cd server
npm install
```

3. **Instalar dependencias del frontend**
```bash
cd ../client
npm install
```

4. **Configurar variables de entorno**
```bash
# En /server
cp .env.example .env
# Editar .env con tus configuraciones
```

5. **Iniciar MongoDB**
```bash
# Con Docker
docker run -d -p 27017:27017 --name mongodb mongo:5.0

# O usar instalación local
mongod
```

6. **Ejecutar el proyecto**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

### Instalación con Docker

1. **Clonar y configurar**
```bash
git clone https://github.com/tu-usuario/trueque-app.git
cd trueque-app
cp .env.example .env
```

2. **Ejecutar con Docker Compose**
```bash
docker-compose up -d
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017

## ⚙️ Configuración

### Variables de Entorno

#### Backend (.env)
```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de datos
MONGODB_URI=mongodb://localhost:27017/trueque_app

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_muy_seguro
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password

# Cloudinary (opcional)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Socket.io
SOCKET_CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=tu_google_maps_key
```

### Configuración de Base de Datos

#### Índices Recomendados
```javascript
// Usuarios
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ "location.coordinates": "2dsphere" })

// Publicaciones
db.publications.createIndex({ title: "text", description: "text" })
db.publications.createIndex({ category: 1, type: 1 })
db.publications.createIndex({ "location.coordinates": "2dsphere" })
db.publications.createIndex({ createdAt: -1 })

// Mensajes
db.messages.createIndex({ conversationId: 1, createdAt: -1 })
db.conversations.createIndex({ participants: 1 })
```

## 📖 Uso

### Registro y Autenticación

1. **Registro de Usuario**
   - Accede a `/register`
   - Completa el formulario con datos válidos
   - Verifica tu email
   - Inicia sesión

2. **Configuración de Perfil**
   - Sube una foto de perfil
   - Completa tu información personal
   - Configura preferencias de privacidad

### Crear Publicaciones

1. **Nueva Publicación**
   - Click en "Crear Publicación"
   - Selecciona tipo (Ofrezco/Busco)
   - Completa información del producto/servicio
   - Sube imágenes
   - Publica

2. **Gestionar Publicaciones**
   - Ve a "Mis Publicaciones"
   - Edita o elimina publicaciones
   - Ve estadísticas de visualizaciones

### Intercambios

1. **Buscar Productos**
   - Usa la barra de búsqueda
   - Aplica filtros por categoría, ubicación, precio
   - Ordena resultados

2. **Contactar Usuarios**
   - Click en "Enviar Mensaje"
   - Inicia conversación
   - Negocia términos del intercambio

3. **Completar Intercambio**
   - Acuerda detalles por mensaje
   - Realiza el intercambio
   - Deja una reseña

## 📚 API Documentation

### Autenticación

#### POST /api/auth/register
Registra un nuevo usuario.

**Request Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "password": "password123",
  "phone": "+57 300 123 4567",
  "location": "Bogotá, Colombia"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": { ... },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### POST /api/auth/login
Inicia sesión de usuario.

**Request Body:**
```json
{
  "email": "juan@email.com",
  "password": "password123"
}
```

### Publicaciones

#### GET /api/publications
Obtiene lista de publicaciones con filtros.

**Query Parameters:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `category`: Filtro por categoría
- `type`: offer | request
- `search`: Búsqueda por texto
- `location`: Filtro por ubicación
- `minValue`, `maxValue`: Rango de precio

#### POST /api/publications
Crea nueva publicación.

**Headers:**
```
Authorization: Bearer jwt_token
```

**Request Body:**
```json
{
  "title": "iPhone 12 Pro",
  "description": "Excelente estado, con caja",
  "category": "electronics",
  "type": "offer",
  "condition": "like-new",
  "estimatedValue": 800,
  "location": {
    "address": "Bogotá, Colombia",
    "coordinates": [-74.0721, 4.7110]
  },
  "tags": ["smartphone", "apple"],
  "images": ["url1", "url2"]
}
```

### Mensajes

#### GET /api/conversations
Obtiene conversaciones del usuario.

#### POST /api/conversations
Crea nueva conversación.

#### GET /api/conversations/:id/messages
Obtiene mensajes de una conversación.

#### POST /api/conversations/:id/messages
Envía nuevo mensaje.

### Usuarios

#### GET /api/users/profile/:id
Obtiene perfil de usuario.

#### PUT /api/users/profile
Actualiza perfil del usuario autenticado.

#### GET /api/users/:id/reviews
Obtiene reseñas de un usuario.

#### POST /api/users/:id/reviews
Crea reseña para un usuario.

## 📁 Estructura del Proyecto

```
trueque-app/
├── client/                          # Frontend React
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/              # Componentes React
│   │   │   ├── auth/               # Autenticación
│   │   │   │   ├── Login.js
│   │   │   │   ├── Register.js
│   │   │   │   ├── ForgotPassword.js
│   │   │   │   └── ResetPassword.js
│   │   │   ├── common/             # Componentes comunes
│   │   │   │   ├── Header.js
│   │   │   │   ├── Footer.js
│   │   │   │   ├── LoadingSpinner.js
│   │   │   │   └── ProtectedRoute.js
│   │   │   ├── layout/             # Layout y navegación
│   │   │   │   ├── Navbar.js
│   │   │   │   ├── Sidebar.js
│   │   │   │   └── Layout.js
│   │   │   ├── messages/           # Sistema de mensajería
│   │   │   │   ├── ChatWindow.js
│   │   │   │   ├── ConversationList.js
│   │   │   │   ├── NewConversation.js
│   │   │   │   └── Messages.js
│   │   │   ├── profile/            # Perfil de usuario
│   │   │   │   ├── UserProfile.js
│   │   │   │   ├── ProfileSettings.js
│   │   │   │   └── UserReviews.js
│   │   │   └── publications/       # Publicaciones
│   │   │       ├── CreatePublication.js
│   │   │       ├── EditPublication.js
│   │   │       ├── PublicationDetail.js
│   │   │       └── PublicationList.js
│   │   ├── hooks/                  # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useSocket.js
│   │   │   └── useLocalStorage.js
│   │   ├── pages/                  # Páginas principales
│   │   │   ├── Home.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Search.js
│   │   │   └── NotFound.js
│   │   ├── services/               # Servicios API
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── publicationService.js
│   │   │   ├── messageService.js
│   │   │   └── userService.js
│   │   ├── store/                  # Redux store
│   │   │   ├── index.js
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       ├── publicationSlice.js
│   │   │       ├── messageSlice.js
│   │   │       ├── userSlice.js
│   │   │       ├── reviewSlice.js
│   │   │       └── uiSlice.js
│   │   ├── utils/                  # Utilidades
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   └── validators.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
├── server/                          # Backend Node.js
│   ├── config/                     # Configuraciones
│   │   ├── database.js
│   │   ├── cloudinary.js
│   │   └── email.js
│   ├── controllers/                # Controladores
│   │   ├── authController.js
│   │   ├── publicationController.js
│   │   ├── messageController.js
│   │   ├── userController.js
│   │   └── reviewController.js
│   ├── middleware/                 # Middlewares
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── upload.js
│   │   └── errorHandler.js
│   ├── models/                     # Modelos de datos
│   │   ├── User.js
│   │   ├── Publication.js
│   │   ├── Message.js
│   │   ├── Conversation.js
│   │   ├── Review.js
│   │   └── Notification.js
│   ├── routes/                     # Rutas API
│   │   ├── auth.js
│   │   ├── publications.js
│   │   ├── messages.js
│   │   ├── users.js
│   │   └── reviews.js
│   ├── services/                   # Servicios
│   │   ├── emailService.js
│   │   ├── uploadService.js
│   │   ├── notificationService.js
│   │   └── socketService.js
│   ├── utils/                      # Utilidades
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   └── constants.js
│   ├── app.js
│   ├── server.js
│   └── package.json
├── docs/                           # Documentación
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── CONTRIBUTING.md
│   └── CHANGELOG.md
├── docker-compose.yml
├── .gitignore
├── .env.example
└── README.md
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Frontend
cd client
npm test

# Backend
cd server
npm test

# Coverage
npm run test:coverage
```

### Tipos de Tests
- **Unit Tests**: Componentes y funciones individuales
- **Integration Tests**: Flujos completos de funcionalidad
- **E2E Tests**: Pruebas de extremo a extremo con Cypress

## 🚀 Deployment

### Producción con Docker

1. **Build de imágenes**
```bash
docker-compose -f docker-compose.prod.yml build
```

2. **Deploy**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Deploy en Heroku

1. **Preparar aplicación**
```bash
heroku create tu-app-name
heroku addons:create mongolab:sandbox
```

2. **Configurar variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu_secret
# ... otras variables
```

3. **Deploy**
```bash
git push heroku main
```

### Deploy en AWS/DigitalOcean

Ver documentación detallada en [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- Usar ESLint y Prettier
- Escribir tests para nuevas funcionalidades
- Documentar funciones complejas
- Seguir convenciones de naming

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **Desarrollador Principal**: [Tu Nombre](https://github.com/tu-usuario)
- **UI/UX Designer**: [Nombre Designer](https://github.com/designer)

## 📞 Soporte

- **Email**: soporte@truequeapp.com
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/trueque-app/issues)
- **Documentación**: [Wiki](https://github.com/tu-usuario/trueque-app/wiki)

## 🔄 Changelog

Ver [CHANGELOG.md](docs/CHANGELOG.md) para historial de versiones.

---

⭐ Si este proyecto te fue útil, ¡dale una estrella en GitHub!