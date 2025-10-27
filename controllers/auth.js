// const nodemailer = require('nodemailer');
// const sendgridTransport = require('nodemailer-sendgrid-transport');
// const transporter = nodemailer.createTransport(
//   sendgridTransport({
//     auth: {
//       api_key:
//         'SG.abcdefghijklmnopqrstuvwxyz-tutaj-klucz-api-uslugi-sendgrid'
//     }
//   })
// );

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const User = require("../models/user");

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) { message = message[0]; } else { message = null; }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationErrors: [],
  });
};

exports.postSignup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email, password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }
  try{
    const hashPwd = await bcrypt.hash(password, 12);
    const user = new User({email: email, password: hashPwd, cart:{ items: [] }});
    await user.save();
    return res.redirect("/login");
  }catch(err){
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  };
};

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) { message = message[0]; } else { message = null; }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: { email: "", password: "", },
    validationErrors: [],
  });
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: {email: email, password: password, },
      validationErrors: errors.array(),
    });
  }
  try{
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: "Invalid email or password.",
        oldInput: {email: email, password: password, },
        validationErrors: [],
      });
    }
    try{
      const doMatch = await bcrypt.compare(password, user.password);
      if (doMatch) {
        req.session.isAuthenticated = true;
        req.session.user = user;
        await req.session.save();
        res.redirect("/");
      } else {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: "Invalid email or password.",
          oldInput: {email: email, password: password, },
          validationErrors: [],
        });
      }
    }catch(err){
      res.redirect("/login");
    }
  }catch(err){
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postLogout = async (req, res, next) => {
  const err = await req.session.destroy();
  if(err){
    res.redirect("/");
  };
};
exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = async (req, res, next) => {
  try{
    const buffer = crypto.randomBytes(32);
    const token = buffer.toString("hex");
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash("error", "No account with that email found.");
      return res.redirect("/reset");
    }
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000;
    const result = await user.save();
    if(!result){
      throw new Error("User not saved. Unexpected error.");
    }
    // transporter.sendMail({
    //   to: req.body.email,
    //   from: 'backend_programming@gmail.com',
    //   subject: 'Reset hasła',
    //   html: `
    //     <h5>RESET HASŁA</h5>
    //     <p>Kliknij w <a href="http://localhost:33333/reset/${token}"> ten link</a> aby ustawić nowe hasło.</p>
    //   `
    //});
    res.redirect("/");
  }catch(err){
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;
  try{
    const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
    if(!user){ 
      throw new Error("User not found. Unexpected error.");
    }
    let message = req.flash("error");
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render("auth/new-password", {
      path: "/new-password",
      pageTitle: "New Password",
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token,
    });
  }catch(err){
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postNewPassword = async (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  try{
    const user = User.findOne({
      _id: userId,
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if(!user){ 
      throw new Error("User not found. Unexpected error.");
    }
    resetUser = user;
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    await resetUser.save();
    res.redirect("/login");
  }catch(err){
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

