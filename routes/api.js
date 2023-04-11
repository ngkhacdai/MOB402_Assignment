var multer = require('multer');
var passport = require('passport');
var config = require('../config/database');
require('../config/Passport')(passport);
var jwt = require('jsonwebtoken');
var fs = require('fs');
var express = require('express');
var router = express.Router();
var User = require("../models/user");
var Product = require("../models/product");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
router.use(bodyParser.json());
const parser = bodyParser.urlencoded({ extended: true });
router.use(parser);
router.use(cookieParser());
var bcrypt = require('bcrypt-nodejs');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
})
var upload = multer({ storage: storage });

router.post('/register', upload.single('myFile'), async (req, res, next) => {
    const email = req.body.email;
    const name = req.body.hoTen;
    const password = req.body.pass;

    var img = fs.readFileSync(req.file.path);
    var encode_img = img.toString('base64');

    var final_img = {
        contentType: req.file.mimetype,
        data: encode_img
    };
    const newUser = new User({ email: email, fullName: name, password: password, avatar: final_img, role: 'user' })
    await newUser.save();
    res.redirect('/');
})



router.post("/login", upload.single('myFile'), async function (req, res) {
    let user = await User.findOne({ email: req.body.email }, { _id: 1, email: 1, password: 1, role: 1 });

    if (user) {
        user.comparePassword(req.body.pass, function (err, isMatch) {

            if (isMatch && !err) {
                var token = jwt.sign(user.toJSON(), config.secret);
                res.cookie("jwt", token, { httpOnly: true });
                res.cookie("user", user, { httpOnly: true });
                if (user.role == "admin") {
                    res.redirect("/admin/quanly");
                } else {
                    res.redirect("/user/quanly");
                }
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
})
router.post('/addUser', upload.single('myFile'), async function (req, res) {
    const email = req.body.email;
    const name = req.body.hoTen;
    const password = req.body.pass;

    var img = fs.readFileSync(req.file.path);
    var encode_img = img.toString('base64');

    var final_img = {
        contentType: req.file.mimetype,
        data: encode_img
    };
    const newUser = new User({ email: email, fullName: name, password: password, avatar: final_img, role: 'user' })
    await newUser.save();
    res.redirect('/admin/quanly');
})

router.post('/updateUser/:id', upload.single('myFile'), async function (req, res) {
    const id = req.params.id;
    const email = req.body.email;
    const name = req.body.hoTen;
    const role = req.body.role;
    const password = req.body.pass;
    let hashPassword;
    bcrypt.genSalt(10, function (err, salt) {

        bcrypt.hash(password, salt, null, function (err, hash) {
            if (err) {
                return next(err);
            }
            hashPassword = hash;
        });
    });
    var img = fs.readFileSync(req.file.path);
    var encode_img = img.toString('base64');

    var final_img = {
        contentType: req.file.mimetype,
        data: encode_img
    };
    await User.findOneAndUpdate({ _id: id }, { email: email, fullName: name, password: hashPassword, avatar: final_img, role: role });

    res.redirect('/quanly');
})

router.get('/deleteUser/:id', upload.single('myFile'), async function (req, res) {
    const id = req.params.id;
    await User.deleteOne({ _id: id });
    res.redirect('/quanly');
})
router.post('/editUser/:id', upload.single('myFile'), async function (req, res) {
    const id = req.params.id;
    const user = await User.findOne({ _id: id })
    const name = req.body.hoTen;
    const role = req.body.role;
    const password = req.body.pass;
    let hashPassword;
    bcrypt.genSalt(10, function (err, salt) {

        bcrypt.hash(password, salt, null, function (err, hash) {
            if (err) {
                return next(err);
            }
            hashPassword = hash;
        });
    });
    var img = fs.readFileSync(req.file.path);
    var encode_img = img.toString('base64');

    var final_img = {
        contentType: req.file.mimetype,
        data: encode_img
    };
    await User.findOneAndUpdate({ _id: id }, { email: user.email, fullName: name, password: hashPassword, avatar: final_img, role: role });

    res.redirect('/quanly');
})
router.post('/addProduct', upload.single('myFile'), async function (req, res) {
    const userCookie = req.cookies.user;
    const name = req.body.namepro;
    const price = req.body.pricepro;
    const color = req.body.color;
    var img = fs.readFileSync(req.file.path);
    var encode_img = img.toString('base64');
    const user = await User.findOne({ _id: userCookie._id })
    var final_img = {
        contentType: req.file.mimetype,
        data: encode_img
    };
    await Product.insertMany([{ name: name, price: price, color: color, img: final_img, id_user: user._id, name_user: user.fullName }])
    res.redirect('/myProduct');
})
router.get('/deleteProduct/:id', upload.single('myFile'), async function (req, res) {
    const id = req.params.id;
    await Product.deleteOne({ _id: id });
    res.redirect('/myProduct');
})
router.post('/updateProduct/:id', upload.single('myFile'), async function (req, res) {
    const id = req.params.id;
    const userCookie = req.cookies.user;
    const name = req.body.namepro;
    const price = req.body.pricepro;
    const color = req.body.color;
    var img = fs.readFileSync(req.file.path);
    var encode_img = img.toString('base64');
    const user = await User.findOne({ _id: userCookie._id })
    var final_img = {
        contentType: req.file.mimetype,
        data: encode_img
    };
    await Product.updateOne({ _id: id }, { name: name, price: price, color: color, img: final_img, id_user: user._id, name_user: user.fullName })
    res.redirect('/myProduct');
})
router.get('/getAllUsers', passport.authenticate('jwt', { session: false }), async function (req, res) {
    var token = getToken(req.headers);
    if (token) {
        let users = await User.find();

        return res.json(users);
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorized.' });
    }
});
router.get('/getAllProduct', passport.authenticate('jwt', { session: false }), async function (req, res) {
    var token = getToken(req.headers);
    if (token) {
        let products = await Product.find();

        return res.json(products);
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorized.' });
    }
})
getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

module.exports = router;
