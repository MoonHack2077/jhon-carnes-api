import { Router } from 'express';
import { createProduct, getProducts, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Aplicamos el middleware a todas las rutas de productos
// Solo un admin logueado podrá acceder
router.use([verifyToken, isAdmin]);

// Rutas CRUD
// POST   /api/products
router.post('/', createProduct);

// GET    /api/products
router.get('/', getProducts);

// PUT    /api/products/:id
router.put('/:id', updateProduct);

// DELETE /api/products/:id
router.delete('/:id', deleteProduct);

export default router;