const paypal = require('@paypal/checkout-server-sdk');
function environment() {
  return process.env.PAYPAL_ENV === 'live'
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_SECRET
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_SECRET
      );
}
const paypalClient = new paypal.core.PayPalHttpClient(environment());
module.exports = { paypal, paypalClient };