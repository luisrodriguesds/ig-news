import { query as q } from "faunadb";
import { fauna } from "../../../services/fauna";
import { stripeSDK } from "../../../services/stripe";

export async function saveSubscription(
  subscriptionId: string,
  customerId: string
){
  console.log(subscriptionId, customerId, 'saveSubscription');
  const userRef = await fauna.query(
    q.Select(
      "ref",
      q.Get(
        q.Match(
          q.Index('user_by_stripe_customer_id'),
          customerId
        )
      )
    )
  )

  const subscription = await stripeSDK.subscriptions.retrieve(subscriptionId)

  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    stauts: subscription.status,
    price_id: subscription.items.data[0].price.id
  }

  await fauna.query(
    q.Create(
      q.Collection('subscriptions'),
      {
        data: subscriptionData
      }
    )
  )
}