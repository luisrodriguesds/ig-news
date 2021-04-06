import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { stripe, stripeBase } from "../../services/stripe";
import { URLSearchParams } from "url";
import { fauna } from "../../services/fauna";
import { query as q } from "faunadb";

type User = {
  ref: {
    id: string
  },
  data: {
    email: string;
    stripe_custormer_id: string;
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
 if (req.method === 'POST') {
  // Precisa criar um customer no stripe
  const session = await getSession({ req });

  const user = await fauna.query<User>(
    q.Get(
      q.Match(
        q.Index('user_by_email'),
        q.Casefold(session.user.email)
      )
    )
  )
  
  let stripe_custormer_id = user.data.stripe_custormer_id
  if (!stripe_custormer_id) {
    const { data: stripeCustomer } = await stripeBase.post("/customers", new URLSearchParams({
      email: session.user.email
    }))
    await fauna.query(
      q.Update(
        q.Ref(q.Collection('users'), user.ref.id),
        {
          data: {
            stripe_custormer_id: stripeCustomer.id
          }
        }
      )
    )
    stripe_custormer_id = stripeCustomer.id
  }


  console.log(stripe_custormer_id, 'aqui')

  // Fazer checkout com o usuário
  try {
    
    const { data: stripeCheckoutSession } = await stripeBase.post("/checkout/sessions", new URLSearchParams({
      customer: stripe_custormer_id,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
      "payment_method_types[0]": 'card',
      billing_address_collection: 'required',
      mode: 'subscription',
      allow_promotion_codes: true,
      "line_items[0][price]": 'price_1Ib3raFcXHk7kNTMGsbSN6i7',
      "line_items[0][quantity]": 1,
    } as any))

    return res.status(200).json({
      sessionId: stripeCheckoutSession.id
    })
  } catch (error) {
    console.log(error.response)
    res.status(405).end('Method not allowed')

  }

  
 } else {
   res.setHeader('Allow', 'POST')
   res.status(405).end('Method not allowed')
 }
}