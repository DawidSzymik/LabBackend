const fs = require("fs");
const path = require("path");

const Product = require("../models/product");
const Order = require("../models/order");
const courseConfig = require("../course.json");


exports.getIndex = (req, res, next) => {
  res.render("shop/index", {
    pageTitle: "Market",
    path: "/",
    studyLevel: courseConfig.studyLevel,
    classesName: courseConfig.classesName,
  });
};

exports.getProducts = async (req, res, next) => {
  try{
    const products = await Product.find();
    //console.log(products);
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "Products",
      path: "/products"
    });
  }catch(err){
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  try{
    const product = await Product.findById(prodId);
    if(!product){
      throw new Error("Product does not exist.");
    }
    res.render("shop/product-detail", {
      product: product,
      pageTitle: product.title,
      path: "/products",
    });
  }catch(err){
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};


