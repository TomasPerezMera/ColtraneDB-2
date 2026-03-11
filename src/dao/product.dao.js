import productModel from '../models/product.model.js';

class ProductDAO {
    async findById(id) {
        return await productModel.findOne({ id });
    }

    async findAll(filters = {}) {
        return await productModel.find(filters);
    }

    async create(productData) {
        return await productModel.create(productData);
    }

    async update(id, productData) {
        return await productModel.findOneAndUpdate(
            { id },
            productData,
            { new: true }
        );
    }

    async delete(id) {
        return await productModel.findOneAndDelete({ id });
    }
}

export default new ProductDAO();