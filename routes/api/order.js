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
      let order = new Order(req.body);
      await order.save();
      return res.json(order);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PATCH api/order/fulfill/:id
// @desc    Order is fulfilled.
// @access  Private
router.patch('/fulfill/:id', auth, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const update = { fulfilled: req.body.fulfilled };

    let order = await Order.findOneAndUpdate(filter, update, {
      returnOriginal: false,
    });

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

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

// @route   GET api/order/:id
// @desc    Get a single unprotected customer facing order.
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    const order = await Order.find(filter);

    if (order.length > 0) {
      const customerOrder = {
        items: order[0].items,
        fulfilled: order[0].fulfilled,
      };
      res.json(customerOrder);
    } else {
      return res.status(400).json({ msg: 'There is no matching order' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/order/venue/:id
// @desc    Get a protected customer's order.
// @access  Private
router.get('/venue/:id', auth, async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    const order = await Order.find(filter);
    if (order.length > 0) {
      res.json(order);
    } else {
      return res.status(400).json({ msg: 'There is no matching order' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/order/all/active
// @desc    Get all non fulfilled orders.
// @access  Private
router.get('/all/active', auth, async (req, res) => {
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

// @route   GET api/order/all/ready
// @desc    Get all fulfilled orders that are awaiting collection.
// @access  Private
router.get('/all/ready', auth, async (req, res) => {
  try {
    const orders = await Order.find({ fulfilled: true, collected: false });
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

// @route   GET api/order/all/ready
// @desc    Get all collected orders.
// @access  Private
router.get('/all/collected', auth, async (req, res) => {
  try {
    const orders = await Order.find({ fulfilled: true, collected: true });
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
