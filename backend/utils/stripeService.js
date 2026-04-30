const Stripe = require('stripe');

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Plan prices in SEK (including VAT)
const PLAN_PRICES = {
  basic: 399,
  standard: 799,
  pro: 1299,
  business: 2499,
  enterprise: 4999,
  corporate: 9999
};

// Create a payment intent for subscription
exports.createPaymentIntent = async (organization, plan, duration) => {
  try {
    const amount = PLAN_PRICES[plan] * duration;
    const vatAmount = amount * 0.25; // 25% Swedish VAT
    const totalAmount = amount + vatAmount;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to öre
      currency: 'sek',
      metadata: {
        organizationId: organization._id.toString(),
        plan: plan,
        duration: duration,
        organizationName: organization.name
      },
      description: `${plan.toUpperCase()} plan - ${duration} month(s) subscription`
    });

    return {
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount,
      vatAmount: vatAmount
    };
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    throw error;
  }
};

// Webhook handler for successful payments
exports.handleSuccessfulPayment = async (paymentIntent) => {
  const { organizationId, plan, duration } = paymentIntent.metadata;
  const amount = paymentIntent.amount / 100;
  
  // Update subscription in database
  const Subscription = require('../models/Subscription');
  const Organization = require('../models/Organization');
  
  const subscription = await Subscription.findOneAndUpdate(
    { organization: organizationId },
    {
      plan: plan,
      status: 'active',
      endDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000),
      price: {
        amount: amount,
        currency: 'SEK',
        vat: { rate: 25, amount: amount * 0.2 },
        monthlyPrice: PLAN_PRICES[plan]
      }
    },
    { upsert: true, new: true }
  );
  
  await Organization.findByIdAndUpdate(organizationId, {
    'subscription.plan': plan,
    'subscription.status': 'active'
  });
  
  return subscription;
};