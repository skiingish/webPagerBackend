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
// @desc    Subscribe to a order for ready notfication.
// @access  Public
router.post(
  '/order/:id',
  check('items', 'items are required').notEmpty(),
  async (req, res) => {
    res.json({ msg: req.params.id });
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }
    // try {
    //   let order = new Order(req.body);
    //   await order.save();
    //   return res.json(order);
    // } catch (err) {
    //   console.error(err.message);
    //   res.status(500).send('Server Error');
    // }
  }
);

module.exports = router;
