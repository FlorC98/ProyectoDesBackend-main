const Product = require('../models/product.model');

class ProductManager {
    async addProduct(productData) {
        const newProduct = new Product(productData);
        await newProduct.save();
        return newProduct;
    }

    async updateProduct(id, updatedFields) {
        const product = await Product.findByIdAndUpdate(id, updatedFields, { new: true });
        return product;
    }

    async deleteProduct(id) {
        const result = await Product.findByIdAndDelete(id);
        return result ? true : false;
    }

    async getProductById(id) {
        return await Product.findById(id);
    }

    async getProducts({ limit = 10, page = 1, sort, query } = {}) {
        const options = {
            limit,
            page,
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
        };

        const filter = query ? { $or: [{ category: query }, { status: query }] } : {};

        const products = await Product.paginate(filter, options);

        return products;
    }
}

module.exports = ProductManager;
