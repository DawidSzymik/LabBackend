const express = require("express");
const { check, body } = require('express-validator');

const authController = require("../controllers/auth");
const adminController = require("../controllers/admin");
const errorController = require("../controllers/error");
const User = require("../models/user");

const router = express.Router();

router.get("/signup", authController.getSignup);

router.post('/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Valid e-mail address required.')
      .custom(async (value, { req }) => {
        const emailExists = await User.findOne({ email: value });
        if (emailExists) {
          return Promise.reject('Email in use. Different email required.');
        }
      })
      .normalizeEmail(),
    body('password', 'Password can contains chars and digits, minimum length 5')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match!');
        }
        return true;
      })
  ],
  authController.postSignup
);

router.get("/login", authController.getLogin);

router.post("/login",
  [
    check('email')
      .isEmail()
      .withMessage('Valid e-mail address required.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
      .withMessage('Password must contain at least 5 alphanumeric characters')
  ],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;