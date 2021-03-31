import axios from "axios";

export const stripe = axios.create({
  baseURL: 'https://api.stripe.com/v1/',
  headers: {
    'Authorization': `Bearer ${process.env.STRIPE_API_KEY}`
  }
})