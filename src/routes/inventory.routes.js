import { Router } from 'express';
import { createInventory, getInventories, updateInventory, deleteInventory } from '../controllers/inventory.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Rutas accesibles para ambos roles (Admin y Empleado)
router.get('/', verifyToken, getInventories);
router.post('/', verifyToken, createInventory);
router.put('/:id', verifyToken, updateInventory);

// Ruta accesible SOLO para Admin
router.delete('/:id', [verifyToken, isAdmin], deleteInventory);

export default router;