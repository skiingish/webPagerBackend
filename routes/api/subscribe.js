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

// @route   GET api/order/:id
// @desc    Get the subscibe public key for a order.
// @access  Public
router.get(
  '/order/:id',
  check('items', 'items are required').notEmpty(),
  async (req, res) => {
    try {
      // Create vapid keys
      const vapidKeys = webpush.generateVAPIDKeys();

      console.log(vapidKeys);
      const filter = { _id: req.params.id };
      const update = {
        publicVapid: vapidKeys.publicKey,
        privateVapid: vapidKeys.privateKey,
      };

      // Make sure order exists and then add in the vapid keys.
      let order = await Order.findOneAndUpdate(filter, update, {
        returnOriginal: false,
      });

      // Send back the order.
      res.json(order);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }

    // Store them with the order

    // Send the public vapid key back.

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

// @route   POST api/order/:id
// @desc    Post back the service worker subscription.
// @access  Public
router.post(
  '/order/:id',
  check('items', 'items are required').notEmpty(),
  async (req, res) => {
    res.json({ msg: req.params.id });

    // Get push subscribe object
    const subscripton = req.body;

    // Send 201 - resource created.
    res.status(201).json({});

    // Store the subscription
    // ? For testing
    // Create the payload
    const payload = JSON.stringify({ title: 'Order Ready' });

    // Look up the vapid keys

    // send a web push

    webpush
      .sendNotification(subscripton, payload)
      .catch((err) => console.error(err));
  }
);

module.exports = router;
