// Imports
const { Router } = require("express");
const controller = require("../controller/index");
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, 'mail.csv');
    }
  });
  
  const upload = multer({ storage: storage });
// Define routes
const router = Router();
router.get("/", controller.get_home);
router.post("/send_sms", controller.send_sms);
router.get("/upload", controller.get_upload);
router.post("/upload",upload.single('csvFile'), controller.post_upload);

module.exports = router;