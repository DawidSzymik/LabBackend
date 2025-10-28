const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/products', adminController.checkIsLogged, adminController.getProducts);

router.get('/add-product', adminController.checkIsLogged, adminController.getAddProduct);

router.post('/add-product', 
  adminController.checkIsLogged,
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim()
      .withMessage('Title must be at least 3 characters long'),
    body('price')
      .isFloat()
      .withMessage('Price must be a numeric value'),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
      .withMessage('Description must be between 5 and 400 characters')
  ],
  adminController.postAddProduct
);

router.get('/edit-product/:productId', adminController.checkIsLogged, adminController.getEditProduct);

router.post('/edit-product', 
  adminController.checkIsLogged,
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim()
      .withMessage('Title must be at least 3 characters long'),
    body('price')
      .isFloat()
      .withMessage('Price must be a numeric value'),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
      .withMessage('Description must be between 5 and 400 characters')
  ],
  adminController.postEditProduct
);
    
router.delete('/product/:productId', adminController.checkIsLogged, adminController.deleteProduct);

module.exports = router;