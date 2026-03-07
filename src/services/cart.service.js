import cartModel from '../models/cart.model.js';
import mongoose from 'mongoose';

class CartService {

    async create() {
        try {
            const newCart = await cartModel.create({ products: [] });
            return newCart;
        } catch (error) {
            throw new Error(`Error creando carrito: ${error.message}`);
        }
    }

    async getById(cartId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error('ID de carrito inválido');
            }
            const cart = await cartModel.findById(cartId).populate('products.product');
            if (!cart) {
                throw new Error('Carrito no encontrado!');
            }
            return cart;
        } catch (error) {
            throw new Error(`Error obteniendo carrito: ${error.message}`);
        }
    }

    async addProduct(cartId, productId, quantity = 1) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error('ID de carrito inválido');
            }
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error('ID de producto inválido');
            }
            const cart = await cartModel.findById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            const currentTotalItems = cart.products.reduce(
                (sum, item) => sum + item.quantity, 0);

            // Validación Especial: este E-Commerce sólo permite la venta de 3 ítems por compra.
            if (currentTotalItems + quantity > 3) {
            throw new Error('Lo sentimos! Se permite un máximo 3 ítems por compra.');
            }

            // Indexamos cada producto del carrito para sumar cantidad ó crear nuevo registro.
            const existingProductIndex = cart.products.findIndex(
                item => item.product.toString() === productId
            );
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity: quantity });
            }
            // Guardamos el carrito actualizado y lo retornamos con los datos del producto poblados.
            await cart.save();
            const updatedCart = await cartModel
                .findById(cartId)
                .populate('products.product');
            return updatedCart;
        } catch (error) {
            throw new Error(`Error agregando producto: ${error.message}`);
        }
    }

    async updateProductQuantity(cartId, productId, newQuantity) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error('ID de carrito inválido');
            }
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error('ID de producto inválido');
            }
            const cart = await cartModel.findById(cartId);
            if (!cart) throw new Error('Carrito no encontrado');

            // Buscamos el producto en el carrito;
            const productIndex = cart.products.findIndex(
                item => item.product.toString() === productId
            );
            if (productIndex === -1) {
                throw new Error('Producto no encontrado en el carrito');
            }

            // Si la nueva cantidad es <= 0, eliminamos el producto.
            if (newQuantity <= 0) {
                cart.products.splice(productIndex, 1);
            } else {
                // Validamos límite de 3 ítems, restando la cantidad actual del producto.
                const otherProductsQty = cart.products.reduce(
                    (sum, item, idx) => idx === productIndex ? sum : sum + item.quantity, 0 );
                if (otherProductsQty + newQuantity > 3) {
                    throw new Error('Máximo 3 ítems por compra!');
                }
                cart.products[productIndex].quantity = newQuantity;
            }
            await cart.save();
            return await cartModel.findById(cartId).populate('products.product');
        } catch (error) {
            throw new Error(`Error actualizando cantidad: ${error.message}`);
        }
    }

    async removeProduct(cartId, productId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error('ID de carrito inválido');
            }
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error('ID de producto inválido');
            }
            const cart = await cartModel.findById(cartId);
            if (!cart) throw new Error('Carrito no encontrado');

            // Filtramos el producto a eliminar y guardamos el carrito actualizado.
            cart.products = cart.products.filter(
                item => item.product.toString() !== productId
            );
            await cart.save();
            return await cartModel.findById(cartId).populate('products.product');
        } catch (error) {
            throw new Error(`Error eliminando producto: ${error.message}`);
        }
    }

    async updateCart(cartId, productsArray) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error('ID de carrito inválido');
            }
            if (!Array.isArray(productsArray)) {
                throw new Error('Se esperaba un array de productos');
            }
            // Validamos formato y cantidad de cada producto.
            for (const item of productsArray) {
                if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
                    throw new Error('Formato de producto inválido');
                }
                if (!item.quantity || item.quantity < 1) {
                    throw new Error('Quantity debe ser mayor a 0');
                }
            }

            // Validamos límite total de 3 ítems.
            const totalItems = productsArray.reduce((sum, item) => sum + item.quantity, 0);
            if (totalItems > 3) {
                throw new Error('Error: máximo de 3 ítems por compra!');
            }
            const cart = await cartModel.findByIdAndUpdate(
                cartId,
                { products: productsArray },
                { new: true, runValidators: true }
            ).populate('products.product');

            if (!cart) throw new Error('Carrito no encontrado');
            return cart;
        } catch (error) {
            throw new Error(`Error actualizando carrito: ${error.message}`);
        }
    }

    async clearCart(cartId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error('ID de carrito inválido');
            }
            const cart = await cartModel.findByIdAndUpdate(
                cartId, { products: [] }, { new: true });
            if (!cart) {
                throw new Error('Carrito no encontrado!');
            }
            return cart;
        } catch (error) {
            throw new Error(`Error vaciando carrito: ${error.message}`);
        }
    }
}

export default new CartService();