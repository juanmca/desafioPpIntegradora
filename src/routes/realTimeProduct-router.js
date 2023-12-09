import express from 'express';
const router = express.Router();
import { deleteProduct, addProduct } from '../utils/productOperations.js';

router.get('/', (req, res) => {
    res.render('realTimeProducts');
});
router.delete('/:pid', deleteProduct);
router.post('/', addProduct);


export default router;