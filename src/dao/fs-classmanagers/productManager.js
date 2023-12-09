import { promises as fsPromises } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductManager {
  constructor() {
    this.filePath = path.join(__dirname, "..", "files", "products.json");
  }
  async addProductRawJSON(productData) {
    try {
      let products = await this.getProducts();

      const existingProduct = products.find(
        (product) => product.code === productData.code
      );
      if (existingProduct) {
        return "Ya existe un producto con ese código. No se ha agredado nada.";
      }

      const productIdCounter =
        Math.max(...products.map((product) => product.id), 0) + 1;
      const newProduct = {
        id: productIdCounter,
        ...productData,
      };

      products.push(newProduct);
      await this.saveProductsToJSON(products);
      return "El producto fue agregado correctamente.";
    } catch (error) {
      console.error("Error agregando producto:", error.message);
      return "Error agregando producto.";
    }
  }

  async getProducts() {
    try {
      const data = await fsPromises.readFile(this.filePath, "utf8");
      if (!data) {
        await this.saveProductsToJSON([]);
        return [];
      }
      return JSON.parse(data);
    } catch (error) {
      console.error("Error al leer el producto desde JSON:", error.message);
      return [];
    }
  }

  async getProductById(pid) {
    const products = await this.getProducts();
    const product = products.find((product) => product.id === pid);
    return product ? product : undefined;
  }

  async updateProduct(id, updates) {
    const products = await this.getProducts();
    const productIndex = products.findIndex((product) => product.id === id);
    if (productIndex === -1) {
      return "El Producto no se ha encontrado.";
    }
    const product = products[productIndex];
    const updatedProduct = { ...product };
    for (const key in updates) {
      if (key in updatedProduct) {
        updatedProduct[key] = updates[key];
      }
    }
    products[productIndex] = updatedProduct;
    await this.saveProductsToJSON(products);
    return "El Producto se ha actualizado correctamente.";
  }

  async saveProductsToJSON(products) {
    try {
      const data = JSON.stringify(products, null, 2);
      await fsPromises.writeFile(this.filePath, data);
    } catch (error) {
      console.error("Error guardando producto al JSON:", error.message);
    }
  }

  async deleteProduct(pid) {
    try {
      const products = await this.getProducts();
      const productIndex = products.findIndex((product) => product.id === pid);
      if (productIndex === -1) {
        return null;
      }

      products.splice(productIndex, 1);
      await this.saveProductsToJSON(products);
      console.log(`Producto con ID ${pid} ha sido eliminado.`);

      return "el Producto ha sido eliminado correctamente.";
    } catch (error) {
      console.error("Error eliminando el producto:", error.message);
      return "Error al eliminar el producto.";
    }
  }
}

export default ProductManager;
