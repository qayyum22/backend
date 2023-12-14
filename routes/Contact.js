const express  = require("express");
const router = express.Router();

// import handlers
const {contact} = require("../controllers/ContactUs");
const {testing} = require("../controllers/ContactUs");

//router
router.post("/contact", contact);
router.get("/testing", testing);

module.exports = router;
