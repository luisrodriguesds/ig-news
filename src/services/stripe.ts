import axios from "axios";
import Stripe from "stripe";

export const stripe = axios.create({
  baseURL: 'https://api.stripe.com/v1/',
  headers: {
    'Authorization': `Bearer ${process.env.STRIPE_API_KEY}`
  }
})

export const stripeBase = axios.create({
  baseURL: 'https://api.stripe.com/v1/',
  auth: {
    username: `${process.env.STRIPE_API_KEY}`,
    password: ''
  }
});

export const stripeSDK = new Stripe(
  process.env.STRIPE_API_KEY, {
    apiVersion: '2020-08-27',
    appInfo: {
      name: 'Ignews',
      version: '0.1.0'
    }
  }
)

// export const stripeApi = new stripe();
// stripeApi.charges.retrieve('ch_1J4CCh2eZvKYlo2CmLYTKjiD', {
//   api_key: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc'
// });