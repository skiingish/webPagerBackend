const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const webpush = require('web-push');
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

    //
    if (req.body.fulfilled && order.publicVapid) {
      // Set the payload
      const payload = JSON.stringify({
        title: 'Order Ready!',
        body: 'Your order is ready, please come to collect.',
      });

      // Set the vapid keys
      webpush.setVapidDetails(
        'mailto:test@test.com',
        order.publicVapid,
        order.privateVapid
      );

      // Send a web push for to tell customer their order is ready
      webpush.sendNotification(order.subscription, payload).catch((err) => {
        console.error(err);
        return res.json({ msg: 'Order complete, Error Sending Push!' });
      });
      res.json({ msg: 'Order complete, Push was sent!' });
    } else {
      res.json({ msg: 'Order complete, no push sent' });
    }
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
        id: req.params.id,
        items: order[0].items,
        fulfilled: order[0].fulfilled,
      };

      res.json(customerOrder);
      // res.render('index.ejs', {
      //   orderId: customerOrder.id,
      //   items: customerOrder.items,
      //   status: customerOrder.fulfilled,
      // });
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

// @route   DELETE api/order/:id
// @desc    Delete a order
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  // Delete the required device.
  try {
    await Order.deleteOne({ device_id: req.params.id });
    res.json({ msg: `Deleted Order: ${req.params.id}` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/order/all
// @desc    Delete all orders
// @access  Private
router.delete('/all', auth, async (req, res) => {
  // Delete all! (Mass wipe)
  Order.deleteMany((err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    } else res.send('Deleted all devices');
  });
});

module.exports = router;
