const express = require('express');
const Product = require('../models/product.model');
const ProductManager = require('../managers/productManager');

const router = express.Router();
const productManager = new ProductManager();

module.exports = (io) => {

    router.get('/', async (req, res) => {
        try {
            const { limit = 10, page = 1, sort, query } = req.query;

            const options = {
                limit: parseInt(limit),
                page: parseInt(page),
                sort: sort ? { price: sort === 'asc' ? 1 : -1 } : null,
                lean: true // Para obtener objetos JS simples que Handlebars pueda manejar
            };

            // Construimos un filtro basado en la query
            const filter = query ? { $or: [{ category: query }, { status: query }] } : {};

            // Obtenemos los productos de MongoDB usando paginación, filtro y ordenamiento
            const products = await Product.paginate(filter, options);

            // Formateamos la respuesta de paginación
            const response = {
                status: 'success',
                payload: products.docs,
                totalPages: products.totalPages,
                prevPage: products.hasPrevPage ? products.prevPage : null,
                nextPage: products.hasNextPage ? products.nextPage : null,
                page: products.page,
                hasPrevPage: products.hasPrevPage,
                hasNextPage: products.hasNextPage,
                prevLink: products.hasPrevPage ? `/api/products?page=${products.prevPage}&limit=${limit}&sort=${sort}&query=${query}` : null,
                nextLink: products.hasNextPage ? `/api/products?page=${products.nextPage}&limit=${limit}&sort=${sort}&query=${query}` : null
            };

            // Renderizamos la vista con los productos
            res.render('products', {
                products: response.payload,
                pagination: {
                    totalPages: response.totalPages,
                    prevPage: response.prevPage,
                    nextPage: response.nextPage,
                    page: response.page,
                    hasPrevPage: response.hasPrevPage,
                    hasNextPage: response.hasNextPage,
                    prevLink: response.prevLink,
                    nextLink: response.nextLink
                }
            });
            
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ status: 'error', error: 'Internal server error' });
        }
    });

    router.get('/:pid', (req, res) => {
        const { pid } = req.params;
        const product = productManager.getProductById(Number(pid));
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    });

    router.post('/', (req, res) => {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;
        if (!title || !description || !code || !price || !status || !stock || !category || !thumbnails) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }
        const newProduct = productManager.addProduct({ title, description, code, price, status, stock, category, thumbnails });
        io.emit('updateProducts', productManager.loadProducts());
        res.status(201).json(newProduct);
    });

    router.put('/:pid', (req, res) => {
        const { pid } = req.params;
        const updatedFields = req.body;
        delete updatedFields.id; // Aseguramos que el ID no se actualice
        const updatedProduct = productManager.updateProduct(Number(pid), updatedFields);
        if (updatedProduct) {
            io.emit('updateProducts', productManager.loadProducts());
            res.json(updatedProduct);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    });

    router.delete('/:pid', (req, res) => {
        const { pid } = req.params;
        const success = productManager.deleteProduct(Number(pid));
        if (success) {
            io.emit('updateProducts', productManager.loadProducts());
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    });

    return router;
};
