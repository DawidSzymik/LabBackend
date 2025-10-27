const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("tiny-csrf");
const flash = require("connect-flash");
const multer = require("multer");

const errorController = require("./controllers/error");
const adminController = require("./controllers/admin");
const authController = require("./controllers/auth");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const files = require("./util/file");


const MONGODB_URI = "mongodb://127.0.0.1:27017/pb_2001_14K1_filo";
mongoose.set("strictQuery", false);
const store = new mongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: false }));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  multer({ storage: files.fileStorage, fileFilter: files.fileFilter }).single("image")
);

app.use(cookieParser("cookie-parser-secret"));

app.use(
  session({
    secret: "our-very-important-session-secret-of-backend-programming",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrf("1234567ThisIsSecret9876543210PAI",
  ["POST","DELETE","PUT","PATCH"], ["/logout",/\/product(\/.*)?/i])); 

app.use((req, res, next) => {
  res.locals.isAuthenticated = false;
  res.locals.cToken = req.csrfToken();
  res.locals.path = "/";
  next(); 
});


app.use(flash());

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);
app.use(errorController.get500);

(async () => {
  try {
    await mongoose.connect(MONGODB_URI, { });
    app.listen(33333, () => {
      console.log('Server is running on port 33333');
    });
  }catch (err) {
    console.error(err);
  }
})();


