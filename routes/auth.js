const express = require("express");

const authController = require("../controllers/auth");
const adminController = require("../controllers/admin");
const errorController = require("../controllers/error");
const User = require("../models/user");

const router = express.Router();

router.get("/signup", errorController.getNotReadyYet );
router.post('/signup', errorController.getNotReadyYet );

router.get("/login", errorController.getNotReadyYet );
router.post("/login", errorController.getNotReadyYet );
router.post("/logout", errorController.getNotReadyYet );

router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
