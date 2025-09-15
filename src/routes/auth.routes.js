import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
// 👈 1. Importa los middlewares de seguridad
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Ruta para registrar un nuevo usuario
// Ahora está protegida: solo un admin logueado puede acceder.
// POST http://localhost:5000/api/auth/register
router.post('/register', [verifyToken, isAdmin], register); // 👈 2. Añade los middlewares aquí

// Ruta para iniciar sesión (esta siempre es pública)
// POST http://localhost:5000/api/auth/login
router.post('/login', login);

export default router;