const express = require('express');
const router = express.Router();
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const User = require('../models/User');
const Selfie = require('../models/Selfie');
const Like = require('../models/Like');
const Product = require('../models/Product');
const ProductUser = require('../models/ProductUser');
const uploadCloud = require('../config/cloudinary.js');

router.get('/editProfile', ensureLoggedIn('/auth/login'), (req, res, next) => {
  User.findById(req.user.id).then(userFromDb => {
    res.render('profile/editProfile', userFromDb);
  });
});

router.post('/editProfile', ensureLoggedIn('/auth/login'), (req, res, next) => {
  const updateProfile = {
    image: req.body.image
  };
  User.update(updateProfile).then(selfieFromDb => {
    console.log(selfieFromDb.title + ' was updated');
  });
});

router.get('/profile/:id', ensureLoggedIn('/auth/login'), (req, res, next) => {
  User.findById(req.params.id).then(userFromDb => {
    console.log('user: ', userFromDb);
    Selfie.find({ _user: req.params.id })
      .sort({ created_at: -1 })
      .populate('_user')
      .then(selfieFromDb => {
        let selfies = selfieFromDb.map(selfie => {
          selfie.isOwner = true;
          return selfie;
        });
        console.log('selfies: ', selfieFromDb);
        Like.find({ _user: req.params.id })
          .sort({ created_at: -1 })
          .populate('_selfie')
          .populate('_user')
          .then(likesFromDb => {
            console.log('likes: ', likesFromDb);
            let likes = likesFromDb.map(like => {
              like.isOwner = like._selfie._user._id === req.user._id;
              return like;
            });
            ProductUser.find({ _user: req.params.id })
              .sort({ created_at: -1 })
              .populate('_product')
              .populate('_user')
              .then(productUserFromDb => {
                console.log('productUserFromDb: ', productUserFromDb);
                res.render('profile/show', {
                  selfieFromDb: selfies,
                  products: productUserFromDb,
                  user: userFromDb,
                  likes
                });
              });
          });
      });
  });
});

module.exports = router;
