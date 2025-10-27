const fs = require('fs');
const multer = require("multer");

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            throw (err);
        }
    });
}
exports.deleteFile = deleteFile;

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    let name = new Date().toISOString() + "-" + file.originalname;
    name = name.replace(/:/g, "_");
    cb(null, name);
  },
});
exports.fileStorage = fileStorage;

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
exports.fileFilter = fileFilter;