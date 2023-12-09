import express from 'express';
const router = express.Router();
import ProductManager from '../dao/models/products.model.js';

const productManager = new ProductManager();

router.get('/', async (req, res) => {
    const products = await productManager.getProducts();

    res.render('home', {
        products
    });
});

export default router;