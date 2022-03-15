const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
var mongoose = require('mongoose');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Order = require('../../models/Order');
const User = require('../../models/User');

// @route   POST api/order
// @desc    Create a new order
// @access  Private
router.post(
  '/',
  auth,
  check('items', 'items are required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let order = new Order(res.body);
      await order.save();
      return res.json(order);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/order/all
// @desc    Get all orders.
// @access  Private
router.get('/all', auth, async (req, res) => {
  try {
    const orders = await Order.find();
    if (orders.length > 0) {
      res.json(orders);
    } else {
      return res.status(400).json({ msg: 'There are no orders' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/order/all/active
// @desc    Get all non fulfilled orders.
// @access  Private
router.get('/all', auth, async (req, res) => {
  try {
    const orders = await Order.find({ fulfilled: false });
    if (orders.length > 0) {
      res.json(orders);
    } else {
      return res.status(400).json({ msg: 'There are no orders' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
