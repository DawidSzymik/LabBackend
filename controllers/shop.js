const fs = require("fs");
const path = require("path");
const PDFDoc = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
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
  try {
    const products = await Product.find();
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "Products",
      path: "/products"
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  try {
    const product = await Product.findById(prodId);
    if (!product) {
      throw new Error("Product does not exist.");
    }
    res.render("shop/product-detail", {
      product: product,
      pageTitle: product.title,
      path: "/products",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.session.user._id });
    const produser = await user.populate("cart.items.productId");
    const products = produser.cart.items;
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: products,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postCart = async (req, res, next) => {
  const prodId = req.body.productId;
  try {
    const product = await Product.findById(prodId);
    if (!product) { throw new Error("Product not found."); }
    const user = await User.findOne({ _id: req.session.user._id });
    await user.addToCart(product);
    res.redirect("/cart");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  try {
    const user = await User.findOne({ _id: req.session.user._id });
    await user.removeFromCart(prodId);
    res.redirect("/cart");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postOrder = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.session.user._id });
    const produser = await user.populate("cart.items.productId");
    const products = produser.cart.items.map((i) => {
      return { quantity: i.quantity, product: { ...i.productId._doc } };
    });
    const order = new Order({
      user: { email: user.email, userId: user._id },
      products: products,
    });
    await order.save();
    await user.clearCart();
    res.redirect("/orders");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.session.user._id })
    .then((orders) => {
      res.render("shop/orders",
        { path: "/orders", pageTitle: "Orders", orders: orders });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;
  try {
    const order = await Order.findById(orderId);
    if (!order) { throw new Error("Order does not exist."); }
    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = path.join("data", "invoices", invoiceName);
    const pdfDoc = new PDFDoc();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename='" + invoiceName + "'");
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
    pdfDoc.fontSize(24).text("FAKTURA", { underline: true });
    pdfDoc.text("----------------------------------");
    let totalPrice = 0;
    order.products.forEach((prod) => {
      totalPrice += prod.quantity * prod.product.price;
      pdfDoc
        .fontSize(14)
        .text(prod.product.title + ":  " + prod.quantity + " x " +
          prod.product.price + " zl = " +
          (prod.quantity * prod.product.price).toFixed(2) + " zl");
    });
    pdfDoc.text("-----");
    pdfDoc.fontSize(20).text("RAZEM: " + totalPrice + " zl");
    pdfDoc.end();
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};