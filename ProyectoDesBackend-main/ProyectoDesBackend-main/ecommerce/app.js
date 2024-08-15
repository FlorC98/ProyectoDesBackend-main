const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');
const path = require('path');
const ProductManager = require('./managers/productManager');
const mongoose = require('mongoose');
const userRouter = require('./routes/user.router.js');
const cartRouter = require('./routes/carts');
const productRouter = require('./routes/products');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const productManager = new ProductManager();

// Configuración de Handlebars
app.engine('handlebars', exphbs.engine({ extname: '.hbs', defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MongoDB
mongoose.connect('mongodb+srv://florchu5898:flor96@cluster0.tjvokkq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
}).then(() => console.log('Conexión a MongoDB exitosa'))
 .catch((error) => console.error('Error al conectar a MongoDB:', error));

app.use("/", userRouter);

// Rutas
app.use('/api/carts', cartRouter);
app.use('/api/products', productRouter(io));

// Ruta para la vista "home"
app.get('/', (req, res) => {
    res.render('home');
});

// Ruta para la vista "realTimeProducts"
app.get('/realtimeproducts', (req, res) => {
    const products = productManager.loadProducts();
    res.render('realTimeProducts', { products });
});

// Ruta para la vista "products"
app.use('/products', productRouter(io));

// Ruta para la vista "cartDetail"
app.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.getCartWithProducts(Number(cid));
        if (cart) {
            res.render('cartDetail', { products: cart.products });
        } else {
            res.status(404).json({ error: 'Carrito no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Configuración de Socket.IO
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Enviar la lista de productos al cliente
    socket.emit('updateProducts', productManager.loadProducts());

    // Escuchar la creación de un nuevo producto
    socket.on('newProduct', (product) => {
        const newProduct = productManager.addProduct(product);
        io.emit('updateProducts', productManager.addProductProducts());
    });

    // Escuchar la eliminación de un producto
    socket.on('deleteProduct', (productId) => {
        productManager.deleteProduct(productId);
        io.emit('updateProducts', productManager.loadProducts());
    });
});

// Iniciar el servidor
const PORT = 8080;
httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
