import express from 'express';
const router = express.Router();
import { getProducts, getProductById, deleteProduct, addProduct, updateProduct } from '../utils/productOperations.js';

router.get('/', getProducts);
router.get('/:pid', getProductById);
router.delete('/:pid', deleteProduct);
router.post('/', addProduct);
router.put('/:pid', updateProduct);

export default router;