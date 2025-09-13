import { Router } from 'express';
import { getUsers, updateUser, deleteUser } from '../controllers/user.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Protegemos todas las rutas de usuarios
router.use([verifyToken, isAdmin]);

// GET    /api/users
router.get('/', getUsers);

// PUT    /api/users/:id
router.put('/:id', updateUser);

// DELETE /api/users/:id
router.delete('/:id', deleteUser);

export default router;