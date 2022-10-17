const mongoose = require('mongoose');

const validateUserSchema = new mongoose.Schema({
    name: {
      type: String,
      min: 3,
      max: 255,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    }
  });

  const ValidateUser = mongoose.model('ValidateUser', validateUserSchema);

  module.exports = ValidateUser;