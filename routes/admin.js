const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/products', adminController.checkIsLogged, adminController.getProducts);

router.get('/add-product', adminController.checkIsLogged, adminController.getAddProduct);

router.post('/add-product', adminController.checkIsLogged, adminController.postAddProduct);

router.get('/edit-product/:productId', adminController.checkIsLogged, adminController.getEditProduct);

router.post('/edit-product', adminController.checkIsLogged, adminController.postEditProduct);
    
router.delete('/product/:productId', adminController.checkIsLogged, adminController.deleteProduct);

module.exports = router;