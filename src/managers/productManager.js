const fs = require("fs/promises");
const path = require("path");

class ProductManager {
    constructor() {
        this.filePath = path.join(__dirname, "../../productos.json");
    }

    async getProducts() {
        try {
            const data = await fs.readFile(this.filePath, "utf-8");
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async addProduct(product) {
        const products = await this.getProducts();
        const newProduct = { id: (products.length + 1).toString(), ...product };
        products.push(newProduct);
        await fs.writeFile(this.filePath, JSON.stringify(products, null, 2));
        return newProduct;
    }

    async deleteProduct(id) {
        let products = await this.getProducts();
        const newProducts = products.filter(p => p.id !== id);
        await fs.writeFile(this.filePath, JSON.stringify(newProducts, null, 2));
        return true;
    }
}

module.exports = ProductManager;
