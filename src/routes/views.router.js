import { Router } from 'express';
import ProductService from '../services/product.service.js';
import CartService from '../services/cart.service.js';

const router = Router();

// Directorio raíz de índice.
router.get('/', (req, res) => {
    res.render('index');
});


// GET /products - Catálogo paginado.
router.get('/products', async (req, res) => {
    try {
        const result = await ProductService.getAll(req.query);
        res.render('commerce/product-catalog', {
            title: 'Catálogo',
            products: result.docs.map(p => p.toObject()),
            pagination: result
        });
    } catch (error) {
        res.render('error', { message: error.message });
    }
});

// GET /products/:pid - Detalle del producto.
router.get('/products/:pid', async (req, res) => {
    try {
        const result = await ProductService.getById(req.params.pid);
        res.render('commerce/product-detail', {
            title: result.name,
            product: result.toObject()
        });
    } catch (error) {
        res.render('error', { message: error.message });
    }
});

// GET /carts/:cid - Vista del carrito.
router.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await CartService.getById(req.params.cid);
        const totalItems = cart.products.reduce((sum, item) => sum + item.quantity, 0);
        res.render('commerce/cart', {
            title: 'Tu Carrito',
            cart: cart.toObject(),
            totalItems
        });
    } catch (error) {
        res.render('error', { message: error.message });
    }
});

export default router;