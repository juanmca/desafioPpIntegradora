import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  products: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
      quantity: Number,
    },
  ],
});

const Cart = mongoose.model("carts", cartSchema);

class CartsManager {
  async createCart() {
    try {
      const newCart = await Cart.create({ products: [] });
      console.log("Cart creado son exito:", newCart);
      return newCart;
    } catch (error) {
      console.error("Error al crear cart:", error.message);
      return null;
    }
  }

  async getCartById(cartId) {
    try {
      const cart = await Cart.findById(cartId).populate(
        "products.id",
        "title price"
      );
      return cart ? cart : "Carrito no ha sido encontrado.";
    } catch (error) {
      console.error("Error fetching cart by ID:", error.message);
      return "Error al obtener el carrito.";
    }
  }

  async getCarts() {
    try {
      const carts = await Cart.find().populate("products.id", "title price");
      return carts;
    } catch (error) {
      console.error("Error fetching carts:", error.message);
      return [];
    }
  }

  async addProductToCart(cartId, productId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(cartId)) {
        return { error: "ID de carrito no válido.", status: 400 };
      }

      const cart = await Cart.findById(cartId);

      if (!cart) {
        return { error: "El Carrito no ha sido encontrado.", status: 404 };
      }

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return { error: "El ID de producto no es  válido.", status: 400 };
      }

      const product = cart.products.find((p) => p.id.equals(productId));

      if (!product) {
        cart.products.push({ id: productId, quantity: 1 });
      } else {
        product.quantity++;
      }

      await cart.save();
      return {
        message: "Producto agregado al carrito correctamente.",
        status: 200,
      };
    } catch (error) {
      console.error("Error agregando producto al cart:", error.message);
      return { error: "Error al agregar producto al carrito.", status: 500 };
    }
  }
}

export default CartsManager;
