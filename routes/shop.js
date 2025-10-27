const express = require('express');

const shopController = require('../controllers/shop');
const adminController = require('../controllers/admin');
const errorController = require('../controllers/error');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', adminController.checkIsLogged, errorController.getNotReadyYet);

router.post('/cart', adminController.checkIsLogged, errorController.getNotReadyYet);

router.post('/cart-delete-item', adminController.checkIsLogged, errorController.getNotReadyYet);

router.post('/create-order', adminController.checkIsLogged, errorController.getNotReadyYet);

router.get('/orders', adminController.checkIsLogged, errorController.getNotReadyYet);

router.get('/orders/:orderId', adminController.checkIsLogged, errorController.getNotReadyYet);
module.exports = router;
