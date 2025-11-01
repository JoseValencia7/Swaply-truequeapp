# 📡 API Documentation - TruequeApp

Esta documentación describe todos los endpoints disponibles en la API REST de TruequeApp.

## 📋 Tabla de Contenidos

- [Información General](#información-general)
- [Autenticación](#autenticación)
- [Usuarios](#usuarios)
- [Publicaciones](#publicaciones)
- [Mensajes](#mensajes)
- [Reseñas](#reseñas)
- [Notificaciones](#notificaciones)
- [Códigos de Error](#códigos-de-error)

## 🔧 Información General

### Base URL
```
Desarrollo: http://localhost:5000/api
Producción: https://api.truequeapp.com/api
```

### Formato de Respuesta
Todas las respuestas siguen el siguiente formato:

```json
{
  "success": true|false,
  "message": "Mensaje descriptivo",
  "data": { ... },
  "error": { ... } // Solo en caso de error
}
```

### Headers Requeridos
```
Content-Type: application/json
Authorization: Bearer <jwt_token> // Para rutas protegidas
```

### Paginación
Los endpoints que retornan listas incluyen paginación:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 🔐 Autenticación

### POST /auth/register
Registra un nuevo usuario en el sistema.

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

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6789012345",
      "name": "Juan Pérez",
      "email": "juan@email.com",
      "phone": "+57 300 123 4567",
      "location": "Bogotá, Colombia",
      "isVerified": false,
      "createdAt": "2023-07-01T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/login
Inicia sesión de usuario existente.

**Request Body:**
```json
{
  "email": "juan@email.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6789012345",
      "name": "Juan Pérez",
      "email": "juan@email.com",
      "avatar": "https://cloudinary.com/avatar.jpg",
      "isVerified": true,
      "reputationScore": 85
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/refresh
Renueva el token de acceso usando el refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/forgot-password
Solicita recuperación de contraseña.

**Request Body:**
```json
{
  "email": "juan@email.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email de recuperación enviado"
}
```

### POST /auth/reset-password
Restablece la contraseña usando el token de recuperación.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente"
}
```

### POST /auth/verify-email
Verifica la dirección de email del usuario.

**Request Body:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verificado exitosamente"
}
```

### POST /auth/logout
Cierra sesión del usuario (invalida tokens).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

## 👤 Usuarios

### GET /users/profile/:id
Obtiene el perfil público de un usuario.

**Parameters:**
- `id` (string): ID del usuario

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6789012345",
      "name": "Juan Pérez",
      "avatar": "https://cloudinary.com/avatar.jpg",
      "bio": "Amante de la tecnología y el intercambio",
      "location": "Bogotá, Colombia",
      "isVerified": true,
      "reputationScore": 85,
      "averageRating": 4.5,
      "totalReviews": 23,
      "completedExchanges": 15,
      "activePublications": 3,
      "totalPublications": 18,
      "memberSince": "2023-01-15T10:00:00.000Z",
      "badges": [
        {
          "name": "Intercambiador Confiable",
          "icon": "shield",
          "earnedAt": "2023-06-01T10:00:00.000Z"
        }
      ],
      "recentPublications": [
        {
          "id": "64a1b2c3d4e5f6789012346",
          "title": "iPhone 12 Pro",
          "type": "offer",
          "images": ["https://cloudinary.com/image1.jpg"],
          "createdAt": "2023-07-01T10:00:00.000Z"
        }
      ]
    }
  }
}
```

### PUT /users/profile
Actualiza el perfil del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Juan Carlos Pérez",
  "bio": "Desarrollador y entusiasta del intercambio",
  "location": "Medellín, Colombia",
  "phone": "+57 300 123 4567",
  "website": "https://juanperez.dev"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6789012345",
      "name": "Juan Carlos Pérez",
      "bio": "Desarrollador y entusiasta del intercambio",
      "location": "Medellín, Colombia",
      "phone": "+57 300 123 4567",
      "website": "https://juanperez.dev",
      "updatedAt": "2023-07-01T10:00:00.000Z"
    }
  }
}
```

### POST /users/upload-avatar
Sube una nueva imagen de avatar.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body (FormData):**
```
avatar: [File] // Imagen (max 5MB, formatos: jpg, png, gif)
```

**Response (200):**
```json
{
  "success": true,
  "message": "Avatar actualizado exitosamente",
  "data": {
    "avatarUrl": "https://cloudinary.com/new-avatar.jpg"
  }
}
```

### PUT /users/settings
Actualiza las configuraciones del usuario.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "privacy": {
    "showEmail": false,
    "showPhone": false,
    "showLocation": true,
    "allowMessages": true,
    "showOnlineStatus": true
  },
  "notifications": {
    "emailNotifications": true,
    "pushNotifications": true,
    "newMessages": true,
    "publicationUpdates": true,
    "exchangeRequests": true,
    "systemUpdates": false,
    "marketingEmails": false
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Configuraciones actualizadas exitosamente"
}
```

### POST /users/change-password
Cambia la contraseña del usuario.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contraseña cambiada exitosamente"
}
```

### DELETE /users/account
Elimina la cuenta del usuario permanentemente.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Cuenta eliminada exitosamente"
}
```

### GET /users/search
Busca usuarios por nombre o email.

**Query Parameters:**
- `q` (string): Término de búsqueda
- `page` (number): Página (default: 1)
- `limit` (number): Elementos por página (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "64a1b2c3d4e5f6789012345",
        "name": "Juan Pérez",
        "avatar": "https://cloudinary.com/avatar.jpg",
        "location": "Bogotá, Colombia",
        "reputationScore": 85,
        "isOnline": true
      }
    ],
    "pagination": { ... }
  }
}
```

## 📝 Publicaciones

### GET /publications
Obtiene lista de publicaciones con filtros y paginación.

**Query Parameters:**
- `page` (number): Página (default: 1)
- `limit` (number): Elementos por página (default: 10)
- `category` (string): Filtro por categoría
- `type` (string): "offer" | "request"
- `search` (string): Búsqueda por texto
- `location` (string): Filtro por ubicación
- `minValue` (number): Valor mínimo
- `maxValue` (number): Valor máximo
- `condition` (string): Estado del producto
- `sortBy` (string): "newest" | "oldest" | "price-asc" | "price-desc" | "popular"
- `userId` (string): Filtro por usuario

**Response (200):**
```json
{
  "success": true,
  "data": {
    "publications": [
      {
        "id": "64a1b2c3d4e5f6789012346",
        "title": "iPhone 12 Pro 128GB",
        "description": "Excelente estado, incluye caja y accesorios originales",
        "category": "electronics",
        "type": "offer",
        "condition": "like-new",
        "estimatedValue": 800,
        "location": {
          "address": "Bogotá, Colombia",
          "coordinates": [-74.0721, 4.7110]
        },
        "images": [
          "https://cloudinary.com/image1.jpg",
          "https://cloudinary.com/image2.jpg"
        ],
        "tags": ["smartphone", "apple", "iphone"],
        "exchangePreferences": "Busco laptop o tablet",
        "user": {
          "id": "64a1b2c3d4e5f6789012345",
          "name": "Juan Pérez",
          "avatar": "https://cloudinary.com/avatar.jpg",
          "reputationScore": 85
        },
        "views": 45,
        "favorites": 8,
        "isFavorited": false,
        "createdAt": "2023-07-01T10:00:00.000Z",
        "updatedAt": "2023-07-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### GET /publications/:id
Obtiene detalles de una publicación específica.

**Parameters:**
- `id` (string): ID de la publicación

**Response (200):**
```json
{
  "success": true,
  "data": {
    "publication": {
      "id": "64a1b2c3d4e5f6789012346",
      "title": "iPhone 12 Pro 128GB",
      "description": "Excelente estado, incluye caja y accesorios originales. Comprado hace 6 meses, siempre con protector y funda. Funciona perfectamente.",
      "category": "electronics",
      "type": "offer",
      "condition": "like-new",
      "estimatedValue": 800,
      "location": {
        "address": "Bogotá, Colombia",
        "coordinates": [-74.0721, 4.7110]
      },
      "images": [
        "https://cloudinary.com/image1.jpg",
        "https://cloudinary.com/image2.jpg",
        "https://cloudinary.com/image3.jpg"
      ],
      "tags": ["smartphone", "apple", "iphone", "128gb"],
      "exchangePreferences": "Busco laptop gaming, tablet iPad Pro, o cámara DSLR",
      "user": {
        "id": "64a1b2c3d4e5f6789012345",
        "name": "Juan Pérez",
        "avatar": "https://cloudinary.com/avatar.jpg",
        "location": "Bogotá, Colombia",
        "reputationScore": 85,
        "averageRating": 4.5,
        "totalReviews": 23,
        "isOnline": true,
        "lastSeen": "2023-07-01T09:45:00.000Z"
      },
      "views": 45,
      "favorites": 8,
      "isFavorited": false,
      "isOwner": false,
      "createdAt": "2023-07-01T10:00:00.000Z",
      "updatedAt": "2023-07-01T10:00:00.000Z"
    }
  }
}
```

### POST /publications
Crea una nueva publicación.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "iPhone 12 Pro 128GB",
  "description": "Excelente estado, incluye caja y accesorios originales",
  "category": "electronics",
  "type": "offer",
  "condition": "like-new",
  "estimatedValue": 800,
  "location": {
    "address": "Bogotá, Colombia",
    "coordinates": [-74.0721, 4.7110]
  },
  "images": [
    "https://cloudinary.com/image1.jpg",
    "https://cloudinary.com/image2.jpg"
  ],
  "tags": ["smartphone", "apple", "iphone"],
  "exchangePreferences": "Busco laptop o tablet"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Publicación creada exitosamente",
  "data": {
    "publication": {
      "id": "64a1b2c3d4e5f6789012346",
      "title": "iPhone 12 Pro 128GB",
      "description": "Excelente estado, incluye caja y accesorios originales",
      "category": "electronics",
      "type": "offer",
      "condition": "like-new",
      "estimatedValue": 800,
      "location": {
        "address": "Bogotá, Colombia",
        "coordinates": [-74.0721, 4.7110]
      },
      "images": [
        "https://cloudinary.com/image1.jpg",
        "https://cloudinary.com/image2.jpg"
      ],
      "tags": ["smartphone", "apple", "iphone"],
      "exchangePreferences": "Busco laptop o tablet",
      "user": "64a1b2c3d4e5f6789012345",
      "views": 0,
      "favorites": [],
      "createdAt": "2023-07-01T10:00:00.000Z",
      "updatedAt": "2023-07-01T10:00:00.000Z"
    }
  }
}
```

### PUT /publications/:id
Actualiza una publicación existente.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (string): ID de la publicación

**Request Body:** (Misma estructura que POST)

**Response (200):**
```json
{
  "success": true,
  "message": "Publicación actualizada exitosamente",
  "data": {
    "publication": { ... }
  }
}
```

### DELETE /publications/:id
Elimina una publicación.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (string): ID de la publicación

**Response (200):**
```json
{
  "success": true,
  "message": "Publicación eliminada exitosamente"
}
```

### POST /publications/:id/favorite
Agrega/quita una publicación de favoritos.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (string): ID de la publicación

**Response (200):**
```json
{
  "success": true,
  "message": "Publicación agregada a favoritos",
  "data": {
    "isFavorited": true,
    "favoritesCount": 9
  }
}
```

### POST /publications/:id/view
Incrementa el contador de vistas de una publicación.

**Parameters:**
- `id` (string): ID de la publicación

**Response (200):**
```json
{
  "success": true,
  "data": {
    "views": 46
  }
}
```

### POST /publications/upload-images
Sube imágenes para una publicación.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body (FormData):**
```
images: [File, File, ...] // Hasta 5 imágenes (max 5MB cada una)
```

**Response (200):**
```json
{
  "success": true,
  "message": "Imágenes subidas exitosamente",
  "data": {
    "imageUrls": [
      "https://cloudinary.com/image1.jpg",
      "https://cloudinary.com/image2.jpg"
    ]
  }
}
```

## 💬 Mensajes

### GET /conversations
Obtiene las conversaciones del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Página (default: 1)
- `limit` (number): Elementos por página (default: 20)
- `search` (string): Buscar por nombre de usuario
- `filter` (string): "all" | "unread" | "archived"

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "64a1b2c3d4e5f6789012347",
        "participants": [
          {
            "id": "64a1b2c3d4e5f6789012345",
            "name": "Juan Pérez",
            "avatar": "https://cloudinary.com/avatar1.jpg",
            "isOnline": true,
            "lastSeen": "2023-07-01T10:00:00.000Z"
          },
          {
            "id": "64a1b2c3d4e5f6789012348",
            "name": "María García",
            "avatar": "https://cloudinary.com/avatar2.jpg",
            "isOnline": false,
            "lastSeen": "2023-07-01T09:30:00.000Z"
          }
        ],
        "lastMessage": {
          "id": "64a1b2c3d4e5f6789012349",
          "content": "¿Todavía tienes disponible el iPhone?",
          "type": "text",
          "sender": "64a1b2c3d4e5f6789012348",
          "createdAt": "2023-07-01T09:45:00.000Z"
        },
        "unreadCount": 2,
        "isArchived": false,
        "relatedPublication": {
          "id": "64a1b2c3d4e5f6789012346",
          "title": "iPhone 12 Pro 128GB",
          "images": ["https://cloudinary.com/image1.jpg"]
        },
        "createdAt": "2023-06-30T15:00:00.000Z",
        "updatedAt": "2023-07-01T09:45:00.000Z"
      }
    ],
    "pagination": { ... }
  }
}
```

### POST /conversations
Crea una nueva conversación.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "participantId": "64a1b2c3d4e5f6789012348",
  "message": "Hola, me interesa tu iPhone",
  "publicationId": "64a1b2c3d4e5f6789012346" // Opcional
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Conversación creada exitosamente",
  "data": {
    "conversation": {
      "id": "64a1b2c3d4e5f6789012347",
      "participants": [...],
      "lastMessage": {...},
      "createdAt": "2023-07-01T10:00:00.000Z"
    }
  }
}
```

### GET /conversations/:id/messages
Obtiene los mensajes de una conversación.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (string): ID de la conversación

**Query Parameters:**
- `page` (number): Página (default: 1)
- `limit` (number): Elementos por página (default: 50)
- `before` (string): Obtener mensajes antes de esta fecha (ISO string)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "64a1b2c3d4e5f6789012349",
        "content": "¿Todavía tienes disponible el iPhone?",
        "type": "text",
        "sender": {
          "id": "64a1b2c3d4e5f6789012348",
          "name": "María García",
          "avatar": "https://cloudinary.com/avatar2.jpg"
        },
        "isRead": false,
        "readBy": [],
        "createdAt": "2023-07-01T09:45:00.000Z"
      },
      {
        "id": "64a1b2c3d4e5f6789012350",
        "content": "https://cloudinary.com/document.pdf",
        "type": "file",
        "fileName": "contrato.pdf",
        "fileSize": 245760,
        "sender": {
          "id": "64a1b2c3d4e5f6789012345",
          "name": "Juan Pérez",
          "avatar": "https://cloudinary.com/avatar1.jpg"
        },
        "isRead": true,
        "readBy": ["64a1b2c3d4e5f6789012348"],
        "createdAt": "2023-07-01T10:00:00.000Z"
      }
    ],
    "pagination": { ... }
  }
}
```

### POST /conversations/:id/messages
Envía un nuevo mensaje en una conversación.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (string): ID de la conversación

**Request Body (Texto):**
```json
{
  "content": "Sí, todavía está disponible",
  "type": "text"
}
```

**Request Body (Archivo - FormData):**
```
content: [File]
type: "file"
```

**Response (201):**
```json
{
  "success": true,
  "message": "Mensaje enviado exitosamente",
  "data": {
    "message": {
      "id": "64a1b2c3d4e5f6789012351",
      "content": "Sí, todavía está disponible",
      "type": "text",
      "sender": "64a1b2c3d4e5f6789012345",
      "isRead": false,
      "readBy": [],
      "createdAt": "2023-07-01T10:05:00.000Z"
    }
  }
}
```

### PUT /conversations/:id/read
Marca los mensajes de una conversación como leídos.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (string): ID de la conversación

**Response (200):**
```json
{
  "success": true,
  "message": "Mensajes marcados como leídos"
}
```

### PUT /conversations/:id/archive
Archiva o desarchivar una conversación.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (string): ID de la conversación

**Request Body:**
```json
{
  "archived": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Conversación archivada exitosamente"
}
```

## ⭐ Reseñas

### GET /users/:id/reviews
Obtiene las reseñas de un usuario.

**Parameters:**
- `id` (string): ID del usuario

**Query Parameters:**
- `page` (number): Página (default: 1)
- `limit` (number): Elementos por página (default: 10)
- `rating` (number): Filtro por calificación (1-5)
- `sort` (string): "newest" | "oldest" | "highest" | "lowest"

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "64a1b2c3d4e5f6789012352",
        "rating": 5,
        "comment": "Excelente intercambio, muy confiable y puntual",
        "reviewer": {
          "id": "64a1b2c3d4e5f6789012348",
          "name": "María García",
          "avatar": "https://cloudinary.com/avatar2.jpg"
        },
        "exchange": {
          "id": "64a1b2c3d4e5f6789012353",
          "title": "Intercambio iPhone por Laptop"
        },
        "response": {
          "content": "Gracias por la reseña, fue un placer hacer negocios contigo",
          "createdAt": "2023-07-01T11:00:00.000Z"
        },
        "createdAt": "2023-07-01T10:30:00.000Z"
      }
    ],
    "stats": {
      "averageRating": 4.5,
      "totalReviews": 23,
      "ratingDistribution": {
        "5": 15,
        "4": 5,
        "3": 2,
        "2": 1,
        "1": 0
      }
    },
    "pagination": { ... }
  }
}
```

### POST /users/:id/reviews
Crea una nueva reseña para un usuario.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (string): ID del usuario a reseñar

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excelente intercambio, muy confiable y puntual",
  "exchangeId": "64a1b2c3d4e5f6789012353" // Opcional
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Reseña creada exitosamente",
  "data": {
    "review": {
      "id": "64a1b2c3d4e5f6789012352",
      "rating": 5,
      "comment": "Excelente intercambio, muy confiable y puntual",
      "reviewer": "64a1b2c3d4e5f6789012348",
      "targetUser": "64a1b2c3d4e5f6789012345",
      "exchange": "64a1b2c3d4e5f6789012353",
      "createdAt": "2023-07-01T10:30:00.000Z"
    }
  }
}
```

### POST /reviews/:id/response
Responde a una reseña recibida.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (string): ID de la reseña

**Request Body:**
```json
{
  "content": "Gracias por la reseña, fue un placer hacer negocios contigo"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Respuesta agregada exitosamente"
}
```

### POST /reviews/:id/report
Reporta una reseña inapropiada.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (string): ID de la reseña

**Request Body:**
```json
{
  "reason": "inappropriate",
  "description": "Contenido ofensivo"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Reseña reportada exitosamente"
}
```

## 🔔 Notificaciones

### GET /notifications
Obtiene las notificaciones del usuario.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Página (default: 1)
- `limit` (number): Elementos por página (default: 20)
- `type` (string): Filtro por tipo de notificación
- `read` (boolean): Filtro por estado de lectura

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "64a1b2c3d4e5f6789012354",
        "type": "new_message",
        "title": "Nuevo mensaje",
        "message": "María García te envió un mensaje",
        "data": {
          "conversationId": "64a1b2c3d4e5f6789012347",
          "senderId": "64a1b2c3d4e5f6789012348"
        },
        "isRead": false,
        "createdAt": "2023-07-01T10:00:00.000Z"
      },
      {
        "id": "64a1b2c3d4e5f6789012355",
        "type": "publication_favorite",
        "title": "Nueva favorita",
        "message": "Tu publicación 'iPhone 12 Pro' fue agregada a favoritos",
        "data": {
          "publicationId": "64a1b2c3d4e5f6789012346",
          "userId": "64a1b2c3d4e5f6789012348"
        },
        "isRead": true,
        "createdAt": "2023-07-01T09:30:00.000Z"
      }
    ],
    "unreadCount": 5,
    "pagination": { ... }
  }
}
```

### PUT /notifications/:id/read
Marca una notificación como leída.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (string): ID de la notificación

**Response (200):**
```json
{
  "success": true,
  "message": "Notificación marcada como leída"
}
```

### PUT /notifications/read-all
Marca todas las notificaciones como leídas.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Todas las notificaciones marcadas como leídas"
}
```

### DELETE /notifications/:id
Elimina una notificación.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (string): ID de la notificación

**Response (200):**
```json
{
  "success": true,
  "message": "Notificación eliminada exitosamente"
}
```

## ❌ Códigos de Error

### Códigos HTTP Estándar

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos de entrada inválidos |
| 401 | Unauthorized - Token de autenticación requerido o inválido |
| 403 | Forbidden - Sin permisos para acceder al recurso |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto con el estado actual del recurso |
| 422 | Unprocessable Entity - Errores de validación |
| 429 | Too Many Requests - Límite de rate limiting excedido |
| 500 | Internal Server Error - Error interno del servidor |

### Formato de Errores

```json
{
  "success": false,
  "message": "Descripción del error",
  "error": {
    "code": "ERROR_CODE",
    "details": {
      "field": "Descripción específica del error"
    }
  }
}
```

### Errores Comunes

#### Validación (422)
```json
{
  "success": false,
  "message": "Errores de validación",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "email": "Email es requerido",
      "password": "La contraseña debe tener al menos 6 caracteres"
    }
  }
}
```

#### Autenticación (401)
```json
{
  "success": false,
  "message": "Token de acceso inválido",
  "error": {
    "code": "INVALID_TOKEN"
  }
}
```

#### Recurso no encontrado (404)
```json
{
  "success": false,
  "message": "Usuario no encontrado",
  "error": {
    "code": "USER_NOT_FOUND"
  }
}
```

#### Rate Limiting (429)
```json
{
  "success": false,
  "message": "Demasiadas solicitudes, intenta de nuevo en 1 minuto",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 60
  }
}
```

## 🔒 Autenticación y Seguridad

### Headers de Autenticación
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Rate Limiting
- **Autenticación**: 5 intentos por minuto por IP
- **API General**: 100 requests por minuto por usuario
- **Upload de archivos**: 10 uploads por minuto por usuario

### Validaciones de Seguridad
- Sanitización de inputs
- Validación de tipos de archivo
- Límites de tamaño de archivo
- Protección CSRF
- Headers de seguridad

---

Para más información o reportar problemas con la API, contacta al equipo de desarrollo.