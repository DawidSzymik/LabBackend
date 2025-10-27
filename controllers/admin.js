const { validationResult } = require("express-validator");

const fileHelper = require("../util/file");
const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: { title: title, price: price, description: description },
      errorMessage: "Attached file is not an image.",
      validationErrors: [],
    });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: { title: title, price: price, description: description },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  const imageUrl = image.path;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.session.user,
  });
  try{
    await product.save();
    res.redirect("/admin/products");
  }catch(err){
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  }
  
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  try{
    const product = await Product.findById(prodId);
    if (!product) {  
      throw new Error("Product does not exist.");  
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
    });
  }catch(err){
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  try{
    const product = await Product.findById(prodId);
    if(!product){
      throw new Error("Product does not exist.");
    }
    if (product.userId.toString() !== req.session.user._id.toString()) {
      throw new Error("Product editing not authorised.");
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    if (image) {
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    await product.save();
    // console.log("Produkt zmodyfikowany");
    res.redirect("/admin/products");
  }catch(err){
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  };
};

exports.getProducts = async (req, res, next) => {
  try{
    const products = await Product.find({ userId: req.session.user._id });
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  }catch(err){
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  };
};

exports.deleteProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  const userId = req.session.user._id;
  try{
    const product = await Product.findById(prodId);
    if (!product) {
      throw new Error("Product not found.");
    }
    fileHelper.deleteFile(product.imageUrl);
    const result = await Product.deleteOne({ _id: prodId, userId: userId });
    if(result.deletedCount>0){
      // console.log(`Produkt id=${prodId} usunięty`);
      res.status(200).json({ message: "Success!" });
    }
    return result;
  }catch(err){
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};


