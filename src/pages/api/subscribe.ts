import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";

import { query as q } from "faunadb";

import { stripe } from "../../services/stripe";
import { fauna } from "../../services/fauna";

type User = {
  ref: {
    id: string,
  },
  data: {
    stripe_costumer_id: string
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const session = await getSession({ req });

    const user = await fauna.query<User>(
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(session.user.email)
        )
      )
    )

    let custumerId = user.data.stripe_costumer_id;

    if (!custumerId) {
      const stripeCustumer = await stripe.customers.create({
        email: session.user.email,
       // metadata 
      });

      await fauna.query(
        q.Update(
          q.Ref(q.Collection('users'), user.ref.id),
          {
            data: {
              stripe_costumer_id: stripeCustumer.id,
            }
          }
        )
      )
    
      custumerId = stripeCustumer.id;
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: custumerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        { price: 'price_1JeSjbJTgAIouV7U4d3HmhN5', quantity: 1 }
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL
    });

    return res.status(200).json({ sessionId: stripeCheckoutSession.id })
    
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).send('Method not allowed')
  }
}