import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  thumbnails: Array,
  code: String,
  stock: Number,
  category: String,
  status: {
    type: Boolean,
    default: true,
  },
});

const Product = mongoose.model("products", productSchema);

class ProductManager {
  async addProductRawJSON(productData) {
    try {
      const existingProduct = await Product.findOne({ code: productData.code });
      if (existingProduct) {
        return "El producto ya existe  con ese código. No se ha agregado nada.";
      }

      const newProduct = new Product({
        ...productData,
      });

      await newProduct.save();
      return "Producto agregado correctamente.";
    } catch (error) {
      console.error("Error agregando producto:", error.message);
      return "Error agregando producto.";
    }
  }

  async getProducts() {
    try {
      const products = await Product.find({ status: true }).lean();
      return products;
    } catch (error) {
      console.error("Error al leer los productos desde MongoDB:", error.message);
      return [];
    }
  }

  async getProductById(pid) {
    try {
      const product = await Product.findOne({ _id: pid });
      return product ? product : undefined;
    } catch (error) {
      console.error(
        "Error en obtener un producto por ID desde MongoDB:",
        error.message
      );
      return undefined;
    }
  }

  async updateProduct(id, updates) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return { error: "El ID del producto no es válido.", status: 400 };
      }

      const product = await Product.findOne({ _id: id });
      if (!product) {
        return { error: "Producto no encontrado.", status: 404 };
      }

      for (const key in updates) {
        if (key in product) {
          product[key] = updates[key];
        }
      }

      await product.save();
      return { message: "Producto actualizado correctamente.", status: 200 };
    } catch (error) {
      throw new Error(`Error al actualizar el producto: ${error.message}`);
    }
  }

  async deleteProduct(pid) {
    try {
      const product = await Product.findOne({ _id: pid });
      if (!product) {
        return "El Producto no ha sido encontrado.";
      }

      product.status = false;
      await product.save();
      console.log(`Producto con ID ${pid} marcado como no disponible.`);

      return "El Producto ha sido eliminado correctamente.";
    } catch (error) {
      console.error(
        "Error marcando producto como no disponible en MongoDB:",
        error.message
      );
      return "Error al marcar el producto como no disponible.";
    }
  }
}

export default ProductManager;
