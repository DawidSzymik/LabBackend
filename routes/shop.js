const express = require('express');

const shopController = require('../controllers/shop');
const adminController = require('../controllers/admin');
const errorController = require('../controllers/error');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', errorController.getNotReadyYet );

router.post('/cart', errorController.getNotReadyYet );

router.post('/cart-delete-item', errorController.getNotReadyYet );

router.post('/create-order', errorController.getNotReadyYet );

router.get('/orders', errorController.getNotReadyYet );

router.get('/orders/:orderId', errorController.getNotReadyYet );

module.exports = router;
