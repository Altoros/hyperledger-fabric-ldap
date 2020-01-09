const mongoose = require('mongoose');

const guaranteeSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    }
  },
  {
    strict: false,
    versionKey: false
  }
);

module.exports = guaranteeSchema;
