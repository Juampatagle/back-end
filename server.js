const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de persistencia
const PRODUCTS_FILE = path.join(__dirname, "productos.json");
const CARTS_FILE = path.join(__dirname, "carritos.json");

// Función para leer archivos
const readFile = async (file) => {
    try {
        const data = await fs.readFile(file, "utf-8");
        return JSON.parse(data);
    } catch {
        return [];
    }
};

// Función para escribir archivos
const writeFile = async (file, data) => {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
};

// Router de productos
const productsRouter = express.Router();

productsRouter.get("/", async (req, res) => {
    const products = await readFile(PRODUCTS_FILE);
    const limit = parseInt(req.query.limit);
    res.json(limit ? products.slice(0, limit) : products);
});

productsRouter.get("/:pid", async (req, res) => {
    const products = await readFile(PRODUCTS_FILE);
    const product = products.find(p => p.id === req.params.pid);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
});

productsRouter.post("/", async (req, res) => {
    const products = await readFile(PRODUCTS_FILE);
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: "Todos los campos son obligatorios, excepto thumbnails" });
    }

    const newProduct = {
        id: (products.length + 1).toString(),
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails: thumbnails || [],
    };

    products.push(newProduct);
    await writeFile(PRODUCTS_FILE, products);
    res.status(201).json(newProduct);
});

productsRouter.put("/:pid", async (req, res) => {
    const products = await readFile(PRODUCTS_FILE);
    const productIndex = products.findIndex(p => p.id === req.params.pid);

    if (productIndex === -1) return res.status(404).json({ error: "Producto no encontrado" });

    const { id, ...updates } = req.body;
    products[productIndex] = { ...products[productIndex], ...updates };

    await writeFile(PRODUCTS_FILE, products);
    res.json(products[productIndex]);
});

productsRouter.delete("/:pid", async (req, res) => {
    const products = await readFile(PRODUCTS_FILE);
    const productIndex = products.findIndex(p => p.id === req.params.pid);

    if (productIndex === -1) return res.status(404).json({ error: "Producto no encontrado" });

    products.splice(productIndex, 1);
    await writeFile(PRODUCTS_FILE, products);
    res.status(204).send();
});

// Router de carritos
const cartsRouter = express.Router();

cartsRouter.post("/", async (req, res) => {
    const carts = await readFile(CARTS_FILE);
    const newCart = {
        id: (carts.length + 1).toString(),
        products: [],
    };

    carts.push(newCart);
    await writeFile(CARTS_FILE, carts);
    res.status(201).json(newCart);
});

cartsRouter.get("/:cid", async (req, res) => {
    const carts = await readFile(CARTS_FILE);
    const cart = carts.find(c => c.id === req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(cart.products);
});

cartsRouter.post("/:cid/product/:pid", async (req, res) => {
    const carts = await readFile(CARTS_FILE);
    const products = await readFile(PRODUCTS_FILE);

    const cart = carts.find(c => c.id === req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    const product = products.find(p => p.id === req.params.pid);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    const existingProduct = cart.products.find(p => p.product === req.params.pid);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.products.push({ product: req.params.pid, quantity: 1 });
    }

    await writeFile(CARTS_FILE, carts);
    res.status(201).json(cart);
});

// Rutas principales
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
