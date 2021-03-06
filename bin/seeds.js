require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('../models/Product');
const makeup = require('../data.js');

// mongoose
//   .connect(
//     'mongodb://localhost/makeup',
//     { useNewUrlParser: true }
//   )
mongoose
  .connect(
    process.env.MONGODB_URI,
    { useNewUrlParser: true }
  )
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
  })
  .catch(err => {
    console.error('Error connecting to mongo', err);
  });

let productsToCreate = makeup.map(product => {
  return {
    brand: product.brand,
    name: product.name,
    productType: product.product_type,
    productColor: product.product_colors,
    image: product.image_link,
    website: product.website_link
  };
});

Product.deleteMany().then(() => {
  Product.create(productsToCreate).then(productsFromDb => {
    console.log(productsFromDb.length + ' products were created');
    mongoose.connection.close();
  });
});

//http://makeup-api.herokuapp.com/
