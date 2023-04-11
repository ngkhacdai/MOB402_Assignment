var express = require('express');
var router = express.Router();
const cookieParser = require("cookie-parser");
router.use(cookieParser());
var axios = require("axios");
var User = require("../models/user");
const { route } = require('./api');

router.get('/quanly', async (req, res) => {
    const token = req.cookies.jwt;
    const userCookie = req.cookies.user;
    let user = await User.findOne({ _id: userCookie._id });
    try {
        const users = await axios.get("http://localhost:8080/api/getAllUsers", {
            headers: { Authorization: `jwt ${token}` },
        });
        const products = await axios.get("http://localhost:8080/api/getAllProduct", {
            headers: { Authorization: `jwt ${token}` }
        });
        const usersdata = users.data;
        const productsdata = products.data;
        res.render('home', {
            layout: 'quanly',
            users: usersdata,
            products: productsdata,
            user: user
        })
    } catch (error) {
        res.json(error);
    }
});

module.exports = router;
