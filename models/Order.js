const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  items: {
    type: [String],
  },
  friendlyOrderNo: {
    type: Number,
  },
  name: {
    type: String,
  },
  fulfilled: {
    type: Boolean,
    default: false,
  },
  collected: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('orders', OrderSchema);
