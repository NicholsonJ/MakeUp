const express = require('express');
const router = express.Router();
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const User = require('../models/User');
const Product = require('../models/Product');
const Selfie = require('../models/Selfie');
const uploadCloud = require('../config/cloudinary.js');

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});
router.get('/feed', ensureLoggedIn('/auth/login'), (req, res, next) => {
  console.log(req.query, 'hello');
  let filter = {};
  if (req.query.brand && req.query.products) {
    Promise.all([
      Selfie.find().populate('_user'),
      Product.find({
        $and: [{ brand: { $eq: req.query.brand } }, { productType: { $eq: req.query.products } }]
      })
    ]).then(([selfieFromDb, productsFromDb]) => {
      console.log(productsFromDb);
      res.render('feed', { selfieFromDb: selfieFromDb, productsFromDb: productsFromDb });
    });
  } else {
    Selfie.find()
      .populate('_user')
      .then(selfieFromDb => {
        res.render('feed', { selfieFromDb: selfieFromDb });
      });
  }
});

router.get('/newproduct', ensureLoggedIn('/auth/login'), (req, res, next) => {
  res.render('newProduct');
});

router.post(
  '/newproduct',
  uploadCloud.single('productPic'),
  ensureLoggedIn('/auth/login'),
  (req, res, next) => {
    console.log('req.file', req.file);

    const productInfo = {
      brand: req.body.brand,
      image: req.file.url,
      name: req.body.name,
      productColor: [{ hex_value: '000000', colour_name: req.body.productColor }],
      website: req.body.website,
      _user: req.user._id
    };
    console.log(productInfo);
    Product.create(productInfo).then(productFromDb => {
      console.log('product was created');
    });
    res.redirect('/feed');
  }
);

router.post('/collection/new', (req, res) => {
  const addProduct = req.body.addProduct;

  console.log('addProduct: ' + addProduct);
  const userData = req.user._id;
  const userToCreate = {
    _user: userData,
    _selfie: addProduct
  };
  ProductUser.create(userToCreate).then(userFromDb => {
    console.log(userFromDb.length + ' likes were created');
  });
  res.send('New user created!!');
});

module.exports = router;
