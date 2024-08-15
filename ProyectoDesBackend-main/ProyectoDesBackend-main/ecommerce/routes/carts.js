const express = require('express');
const CartManager = require('../managers/cartManager');
const router = express.Router();
const cartManager = new CartManager();

router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.getCartById(cid);
        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ error: 'Carrito no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const updatedCart = await cartManager.addProductToCart(cid, pid);
        if (updatedCart) {
            res.json(updatedCart);
        } else {
            res.status(404).json({ error: 'Carrito no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un producto específico de un carrito
router.delete('/:cid/products/:pid', (req, res) => {
    const { cid, pid } = req.params;
    const success = cartManager.removeProductFromCart(Number(cid), Number(pid));
    if (success) {
        res.json({ status: 'success', message: 'Producto eliminado del carrito' });
    } else {
        res.status(404).json({ error: 'Carrito o producto no encontrado' });
    }
});

// Actualizar un carrito con un arreglo de productos
router.put('/:cid', (req, res) => {
    const { cid } = req.params;
    const products = req.body.products;
    const updatedCart = cartManager.updateCartProducts(Number(cid), products);
    if (updatedCart) {
        res.json({ status: 'success', message: 'Carrito actualizado', cart: updatedCart });
    } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
    }
});

// Actualizar la cantidad de un producto específico en un carrito
router.put('/:cid/products/:pid', (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const updatedCart = cartManager.updateProductQuantity(Number(cid), Number(pid), quantity);
    if (updatedCart) {
        res.json({ status: 'success', message: 'Cantidad del producto actualizada', cart: updatedCart });
    } else {
        res.status(404).json({ error: 'Carrito o producto no encontrado' });
    }
});

// Eliminar todos los productos de un carrito
router.delete('/:cid', (req, res) => {
    const { cid } = req.params;
    const success = cartManager.clearCart(Number(cid));
    if (success) {
        res.json({ status: 'success', message: 'Todos los productos han sido eliminados del carrito' });
    } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
    }
});

module.exports = router;
