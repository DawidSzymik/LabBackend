const express = require('express');

const shopController = require('../controllers/shop');
const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', adminController.checkIsLogged, shopController.getCart);

router.post('/cart', adminController.checkIsLogged, shopController.postCart);

router.post('/cart-delete-item', adminController.checkIsLogged, shopController.postCartDeleteProduct);

router.post('/create-order', adminController.checkIsLogged, shopController.postOrder);

router.get('/orders', adminController.checkIsLogged, shopController.getOrders);

router.get('/orders/:orderId', adminController.checkIsLogged, shopController.getInvoice);

module.exports = router;