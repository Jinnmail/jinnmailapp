var express = require('express');
var router = express.Router();
const userAuth = require('../middlewares/userAuth');
const userModel = require('../models/user');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.get('/config', async (req, res) => {
  const price = await stripe.prices.retrieve(process.env.PRICE);
  res.send({
    publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    unitAmount: price.unit_amount,
    currency: price.currency,
  });
});

router.post('/create-checkout-session', userAuth.validateUser, async (req, res) => {
  const domainURL = process.env.DOMAIN;
  const { quantity, locale } = req.body;
  
  const userId = req.userId
  const user = await userModel.findOne({userId: userId});
  const customerId = user.customerId;

  const session = await stripe.checkout.sessions.create({
    customer: customerId, 
    payment_method_types: process.env.PAYMENT_METHODS.split(', '),
    mode: 'payment',
    locale: locale,
    line_items: [
      {
        price: process.env.PRICE,
        quantity: quantity
      },
    ],
    success_url: `${domainURL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domainURL}/canceled.html`,
  });

  res.send({
    sessionId: session.id,
  });
});

router.get('/checkout-session', async (req, res) => {
  const { sessionId } = req.query;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  res.send(session);
});

router.post('/webhook', async (req, res) => {
  let data;
  let eventType;
 
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    let event;
    let signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    data = event.data;
    console.log(data);
    eventType = event.type;
  } else {
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === 'checkout.session.completed') {
    console.log(`🔔  Payment received!`);
  }

  res.sendStatus(200);
});

// todo: call middleware to verify token and also to get userId


module.exports = router;