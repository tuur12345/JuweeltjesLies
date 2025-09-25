import { NextResponse } from 'next/server'
import { createCheckoutSession, formatLineItems } from '../../../lib/stripeClient'

export async function POST(request) {
  try {
    const { cartItems, userEmail } = await request.json()

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      )
    }

    // Format cart items for Stripe
    const lineItems = formatLineItems(cartItems)

    // Create checkout session
    const { session, error } = await createCheckoutSession(
      lineItems,
      userEmail,
      `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      `${request.nextUrl.origin}/cart`
    )

    if (error) {
      return NextResponse.json(
        { error },
        { status: 500 }
      )
    }

    return NextResponse.json({ sessionId: session.id })

  } catch (error) {
    console.error('Checkout API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}