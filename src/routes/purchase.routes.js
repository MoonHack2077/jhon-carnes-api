import { Router } from 'express';
import { createPurchase, getPurchases, updatePurchase } from '../controllers/purchase.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas de compras requieren ser un Admin logueado
router.use([verifyToken, isAdmin]);

// POST   /api/purchases
router.post('/', createPurchase);

// GET    /api/purchases
router.get('/', getPurchases);

// PUT    /api/purchases/:id
router.put('/:id', updatePurchase);

export default router;