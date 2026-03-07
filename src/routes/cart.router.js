import { Router } from 'express';
import CartService from '../services/cart.service.js';

const router = Router();

// Middleware para agregar 'io' a req
router.use((req, res, next) => {
    req.io = req.app.get('io');
    next();
});

// POST - Crear carrito.
router.post('/', async (req, res) => {
    try {
        const newCart = await CartService.create();
        res.status(201).json({ status: 'success', payload: newCart });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// GET - Obtener carrito por ID.
router.get('/:cid', async (req, res) => {
    try {
        const cart = await CartService.getById(req.params.cid);
        res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
});

// POST - Agregar producto al carrito.
router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const { quantity = 1 } = req.body;
        const cart = await CartService.addProduct(
            req.params.cid,
            req.params.pid,
            quantity
        );
        req.io.emit('cartUpdated', { cartId: req.params.cid });
        res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// PUT - Actualizar cantidad de un producto.
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { quantity } = req.body;
        if (quantity === undefined) {
            return res.status(400).json({
                status: 'error',
                message: 'Se requiere el campo quantity'
            });
        }
        const cart = await CartService.updateProductQuantity(
            req.params.cid,
            req.params.pid,
            quantity
        );
        req.io.emit('cartUpdated', { cartId: req.params.cid });
        res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// PUT - Actualizar el carrito completo, reemplazando productos.
router.put('/:cid', async (req, res) => {
    try {
        const { products } = req.body;
        if (!products) {
            return res.status(400).json({
                status: 'error',
                message: 'Se requiere el campo products (array)'
            });
        }
        const cart = await CartService.updateCart(req.params.cid, products);
        req.io.emit('cartUpdated', { cartId: req.params.cid });
        res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// DELETE - Eliminar producto del carrito.
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await CartService.removeProduct(
            req.params.cid,
            req.params.pid
        );
        req.io.emit('cartUpdated', { cartId: req.params.cid });
        res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
});

// DELETE - Vaciar carrito.
router.delete('/:cid', async (req, res) => {
    try {
        const cart = await CartService.clearCart(req.params.cid);
        req.io.emit('cartUpdated', { cartId: req.params.cid });
        res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
});

export default router;