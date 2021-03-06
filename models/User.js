const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: String,
    email: String,
    password: String,
    image: {
      type: String,
      default: '/images/DefaultProfileImg.jpg'
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
