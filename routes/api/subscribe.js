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
router.get('/order/:id', async (req, res) => {
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
});

// @route   POST api/order/:id
// @desc    Post back the service worker subscription.
// @access  Public
router.post('/order/:id', async (req, res) => {
  //res.json({ msg: req.params.id });

  // Get push subscribe object
  const subscripton = req.body;

  console.log(subscripton);

  const filter = { _id: req.params.id };
  const update = {
    subscription: subscripton,
  };

  // Make sure order exists and then add in subscription object.
  let order = await Order.findOneAndUpdate(filter, update, {
    returnOriginal: false,
  });

  // Send 201 - resource created.
  res.status(201).json({});

  // Store the subscription
  // ? For testing
  // Create the payload
  const payload = JSON.stringify({
    title: 'Thank you',
    body: 'We will let you know when your order is ready!',
  });

  // Set the vapid keys
  webpush.setVapidDetails(
    'mailto:test@test.com',
    order.publicVapid,
    order.privateVapid
  );

  // send a web push for testing
  webpush
    .sendNotification(order.subscription, payload)
    .catch((err) => console.error(err));
});

module.exports = router;
