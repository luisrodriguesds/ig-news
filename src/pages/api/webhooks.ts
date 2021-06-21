
import { NextApiRequest, NextApiResponse } from "next"
import { Readable } from "stream";
import Stripe from "stripe";
import { stripeSDK } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscritioin";
// import { stripe } from "../../services/stripe";

async function buffer(readable: Readable){
  const chunks = [];
  for await (const chunk of readable){
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    )
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParse: false
  }
}

const relevantEvents = new Set([
  'checkout.session.completed'
])

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    
    // Fazer check para verificar token de webhook
    const secret = req.headers['stripe-signature'];
    
    let event: Stripe.Event;

    try {
      // console.log(buf, secret, process.env.STRIPE_WEBHOOKS_SECRET, 'checking the credentaisl');
      event = stripeSDK.webhooks.constructEvent(req.body, secret, process.env.STRIPE_WEBHOOKS_SECRET);
    } catch (error) {
      event = error.raw.detail.payload;
      // console.log(error, 'error raw');
      // return res.status(400).send(`Webhook error: ${error.message}`)
    }

    const { type } = event;
    if (relevantEvents.has(type)) {
      switch (type) {
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          await saveSubscription(
            checkoutSession.subscription.toString(),
            checkoutSession.customer.toString()
          )
          break;
      
        default:
          return res.status(400).send(`Unknown error`)
      }
      console.log('Evento recebido', event);
    }
    
    return res.json({
      received: true
    });

    
  }else{
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed')
  }
}