const express = require("express");
const ProductManager = require("../managers/ProductManager");

module.exports = (io) => {
    const router = express.Router();
    const productManager = new ProductManager();

    // Obtener todos los productos
    router.get("/", async (req, res) => {
        const products = await productManager.getProducts();
        res.json(products);
    });

    // Agregar un producto
    router.post("/", async (req, res) => {
        const newProduct = req.body;
        const addedProduct = await productManager.addProduct(newProduct);
        
        // Emitir evento a WebSockets
        io.emit("updateProducts", await productManager.getProducts());

        res.json(addedProduct);
    });

    // Eliminar un producto
    router.delete("/:pid", async (req, res) => {
        const { pid } = req.params;
        await productManager.deleteProduct(pid);
        
        // Emitir evento a WebSockets
        io.emit("updateProducts", await productManager.getProducts());

        res.send({ message: "Producto eliminado" });
    });

    return router;
};
