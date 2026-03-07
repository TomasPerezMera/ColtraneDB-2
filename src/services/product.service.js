import productModel from '../models/product.model.js';

class ProductService {

    async getAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 3,
                sort,
                category,
                artist,
                available
            } = options;

            const filter = {};
            if (category) filter.category = category;
            if (artist) filter.artist = artist;
            if (available !== undefined) filter.isAvailable = available;

            // Opciones de paginación.
            const paginateOptions = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: sort === 'asc' ? { currentPrice: 1 } :
                sort === 'desc' ? { currentPrice: -1 } : {}
            };

            const result = await productModel.paginate(filter, paginateOptions);
            const baseUrl = '/api/products';
                result.prevLink = result.hasPrevPage
                    ? `${baseUrl}?page=${result.prevPage}&limit=${limit}`
                    : null;
                result.nextLink = result.hasNextPage
                    ? `${baseUrl}?page=${result.nextPage}&limit=${limit}`
                    : null;

            return result;
        } catch (error) {
            throw new Error('Error obteniendo productos: ' + error.message);
        }
    }

    async getById(productId) {
    try {
        // Validamos que ID sea numérico.
        if (!Number.isInteger(Number(productId))) {
            throw new Error('ID de producto inválido');
        }
        const product = await productModel.findOne({ id: productId });
        if (!product) {
            throw new Error('Producto no encontrado!');
        }
        return product;
    } catch (error) {
            throw new Error('Error obteniendo producto: ' + error.message);
        }
    }

    async create(productData) {
        try {
            const newProduct = await productModel.create(productData);
            return newProduct;
        } catch (error) {
            throw new Error('Error creando producto: ' + error.message);
        }
    }

    async update(productId, updateData) {
        try {
            if (!Number.isInteger(Number(productId))) {
                throw new Error('ID de producto inválido');
            }
            //Si stock llega a 0, marcar como no disponible.
            if (updateData.stock !== undefined && updateData.stock === 0) {
                updateData.isAvailable = false;
            }
            const updatedProduct = await productModel.findOneAndUpdate({ id: productId }, updateData, { returnDocument: 'after', runValidators: true });
            if (!updatedProduct) {
                throw new Error('Producto no encontrado');
            }
            return updatedProduct;
        } catch (error) {
            throw new Error('Error actualizando producto: ' + error.message);
        }
    }

    async delete(productId) {
        try {
            if (!Number.isInteger(Number(productId))) {
                throw new Error('ID de producto inválido');
            }
            const deletedProduct = await productModel.findOneAndUpdate({ id: productId }, { isAvailable: false }, { returnDocument: 'after' });
            if (!deletedProduct) {
                throw new Error('Producto no encontrado');
            }
            return deletedProduct;
        } catch (error) {
            throw new Error('Error eliminando producto: ' + error.message);
        }
    }
}

export default new ProductService();