const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

class CartManager {
    async createCart() {
        const newCart = new Cart({ products: [] });
        await newCart.save();
        return newCart;
    }

    async getCartById(id) {
        return await Cart.findById(id).populate('products.product').exec();
    }

    async addProductToCart(cartId, productId) {
        const cart = await this.getCartById(cartId);
        if (cart) {
            const productIndex = cart.products.findIndex(p => p.product._id.toString() === productId);
            if (productIndex > -1) {
                cart.products[productIndex].quantity += 1;
            } else {
                const product = await Product.findById(productId);
                if (!product) throw new Error('Product not found');
                cart.products.push({ product: product._id, quantity: 1 });
            }
            await cart.save();
            return cart;
        }
        return null;
    }

    async removeProductFromCart(cartId, productId) {
        const cart = await this.getCartById(cartId);
        if (cart) {
            cart.products = cart.products.filter(p => p.product._id.toString() !== productId);
            await cart.save();
            return cart;
        }
        return null;
    }

    async clearCart(cartId) {
        const cart = await this.getCartById(cartId);
        if (cart) {
            cart.products = [];
            await cart.save();
            return cart;
        }
        return null;
    }

    async updateProductQuantity(cartId, productId, quantity) {
        const cart = await this.getCartById(cartId);
        if (cart) {
            const productIndex = cart.products.findIndex(p => p.product._id.toString() === productId);
            if (productIndex > -1) {
                cart.products[productIndex].quantity = quantity;
                await cart.save();
                return cart;
            }
        }
        return null;
    }
}

module.exports = CartManager;
