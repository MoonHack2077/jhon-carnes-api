import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './src/routes/auth.routes.js';
import productRoutes from './src/routes/product.routes.js';
import userRoutes from './src/routes/user.routes.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json()); // Permite al servidor entender JSON

// Conexión a la base de datos
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));


// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // 👈 Dile al servidor que use estas rutas
app.use('/api/users', userRoutes); //

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});