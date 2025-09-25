import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export const createCheckoutSession = async (lineItems, userEmail, successUrl, cancelUrl) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      currency: 'eur',
      line_items: lineItems,
      customer_email: userEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_email: userEmail,
      },
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['BE', 'NL', 'DE', 'FR', 'LU', 'GB', 'US'],
      },
    })

    return { session, error: null }
  } catch (error) {
    console.error('Stripe error:', error)
    return { session: null, error: error.message }
  }
}

export const formatLineItems = (cartItems) => {
  return cartItems.map(item => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.name,
        description: item.description || `Beautiful jewelry piece from Juweeltjes Lies`,
      },
      unit_amount: Math.round(item.price * 100), // Convert to cents
    },
    quantity: item.quantity,
  }))
}