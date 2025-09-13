import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';

const router = Router();

// Ruta para registrar un nuevo usuario
// POST http://localhost:5000/api/auth/register
router.post('/register', register);

// Ruta para iniciar sesión
// POST http://localhost:5000/api/auth/login
router.post('/login', login);

export default router;