var express = require('express');
var router = express.Router();
const cookieParser = require("cookie-parser");
router.use(cookieParser());
var User = require("../models/user");
var Product = require("../models/product");
var axios = require("axios");
/* GET home page. */

router.get('/', (req, res) => {
    const user = req.cookies.user;
    if (user) {
        res.redirect('/quanly')
    } else {
        res.render('home', { layout: 'main' });
    }

});
router.get('/login', (req, res) => {
    res.render('home', { layout: 'main' });
});
router.get('/register', (req, res) => {
    res.render('home', { layout: 'register' });
});
router.get('/logout', function (req, res) {
    res.cookie("user", "");
    res.cookie("jwt", "");
    res.redirect('/');
})
router.get('/quanly', async function (req, res) {
    const user = req.cookies.user;
    if (user.role == "admin") {
        res.redirect("/admin/quanly");
    } else {
        res.redirect("/user/quanly");
    }
})
router.get('/myProduct', async function (req, res) {
    const userCookie = req.cookies.user;
    const products = await Product.find({ id_user: userCookie._id });
    res.render('home', { layout: 'myproduct', products: products });
})
router.get('/editprofile', async function (req, res) {
    const userCookie = req.cookies.user;
    const user = await User.findOne({ _id: userCookie._id });
    res.render('home', { layout: 'editprofile', id: user._id, email: user.email, name: user.fullName });
})
module.exports = router;
