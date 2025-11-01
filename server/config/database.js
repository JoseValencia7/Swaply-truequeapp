const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);

    // Configurar eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`.red);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected'.yellow);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected'.green);
    });

    // Configurar índices adicionales si es necesario
    await createIndexes();

  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`.red.underline.bold);
    process.exit(1);
  }
};

// Función para crear índices adicionales
const createIndexes = async () => {
  try {
    // Índices para geolocalización
    await mongoose.connection.db.collection('users').createIndex(
      { "location.coordinates": "2dsphere" }
    );
    
    await mongoose.connection.db.collection('publications').createIndex(
      { "location.coordinates": "2dsphere" }
    );

    // Índices de texto para búsqueda
    await mongoose.connection.db.collection('publications').createIndex(
      { 
        title: "text", 
        description: "text", 
        tags: "text" 
      },
      {
        weights: {
          title: 10,
          description: 5,
          tags: 1
        },
        name: "publication_text_index"
      }
    );

    // Índices compuestos para optimizar consultas frecuentes
    await mongoose.connection.db.collection('publications').createIndex(
      { status: 1, category: 1, createdAt: -1 }
    );

    await mongoose.connection.db.collection('messages').createIndex(
      { conversation: 1, createdAt: -1 }
    );

    await mongoose.connection.db.collection('notifications').createIndex(
      { recipient: 1, status: 1, createdAt: -1 }
    );

    console.log('Database indexes created successfully'.green);
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

// Función para cerrar la conexión de manera elegante
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed'.yellow);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

module.exports = { connectDB, closeDB };