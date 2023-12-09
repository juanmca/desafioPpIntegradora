import { promises as fsPromises } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CartsManager {
    constructor() {
        this.filePath = path.join(__dirname, '..', 'files', 'carts.json');
    }

    async initializeCartFile() {
        const defaultData = [];
        await this.saveCartsToJSON(defaultData);
    }

    async createCart() {
        try {
            let data;
            let carts = [];
            try {
                data = await fsPromises.readFile(this.filePath, 'utf8');
                carts = JSON.parse(data);
            } catch (error) {
                await this.initializeCartFile();
                data = await fsPromises.readFile(this.filePath, 'utf8');
                carts = JSON.parse(data);
            }
            const cartIdCounter = Math.max(...carts.map(cart => cart.id), 0) + 1;
            const newCart = {
                id: cartIdCounter,
                products: [],
            };
            carts.push(newCart);
            await this.saveCartsToJSON(carts);
            return newCart;
        } catch (error) {
            console.error('Error creando carrito:', error.message);
            return null;
        }
    }

    async getCartById(cartId) {
        const carts = await this.getCarts();
        const cart = carts.find(cart => cart.id === cartId);
        if (cart) {
            const products = await Promise.all(cart.products.map(async product => {
                const productData = await fsPromises.readFile(path.join(__dirname, '..', 'files', 'products.json'), 'utf8');
                const products = JSON.parse(productData);
                const productObj = products.find(p => p.id === product.id);
                return { ...product, ...productObj };
            }));
            return { ...cart, products };
        } else {
            return "Carrito no encontrado.";
        }
    }

    async saveCartsToJSON(carts) {
        try {
            const data = JSON.stringify(carts, null, 2);
            await fsPromises.writeFile(this.filePath, data);
        } catch (error) {
            console.error('Error guardando el carrito al JSON:', error.message);
        }
    }

    async getCarts() {
        try {
            const data = await fsPromises.readFile(this.filePath, 'utf8');
            if (!data) {
                await this.saveCartsToJSON([]);
                return [];
            }
            return JSON.parse(data);
        } catch (error) {
            console.error('Error al leer carrito desde JSON:', error.message);
            return [];
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            const carts = await this.getCarts();
            const cartIndex = carts.findIndex(cart => cart.id === cartId);

            if (cartIndex === -1) {
                return { error: "Carrito no encontrado.", status: 404 };
            }

            const cart = carts[cartIndex];

            const productData = await fsPromises.readFile(path.join(__dirname, '..', 'files', 'products.json'), 'utf8');
            const products = JSON.parse(productData);
            const productIndex = products.findIndex(p => p.id === productId);

            if (productIndex === -1) {
                return { error: "Producto no encontrado.", status: 400 };
            }

            const cartProductIndex = cart.products.findIndex(product => product.id === productId);

            if (cartProductIndex === -1) {
                cart.products.push({ id: productId, quantity: 1 });
            } else {
                cart.products[cartProductIndex].quantity++;
            }

            await this.saveCartsToJSON(carts);
            return { message: "Producto agregado al carrito correctamente.", status: 200 };
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error.message);
            return { error: "Error al agregar producto al carrito.", status: 500 };
        }
    }
}

export default CartsManager;