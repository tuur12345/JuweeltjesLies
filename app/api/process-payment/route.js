import { NextResponse } from 'next/server'
import { stripe } from '../../../lib/stripeClient'
import { supabase } from '../../../lib/supabaseClient'

export async function POST(request) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details']
    })

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Get line items details
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId)

    // Find user by email
    const { data: { user }, error: userError } = await supabase.auth.admin.listUsers()
    const foundUser = user?.find(u => u.email === session.customer_email || u.email === session.metadata?.user_email)

    if (!foundUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prepare order data
    const orderItems = lineItems.data.map(item => ({
      name: item.description,
      quantity: item.quantity,
      price: item.amount_total / 100 / item.quantity, // Convert from cents and get unit price
    }))

    const totalAmount = (session.amount_total / 100).toFixed(2) // Convert from cents

    // Create order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: foundUser.id,
        total_amount: totalAmount,
        status: 'confirmed',
        order_items: orderItems,
        stripe_session_id: sessionId,
        shipping_address: session.shipping_details || session.customer_details,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order record' },
        { status: 500 }
      )
    }

    // Send confirmation email (simple version - you can enhance this)
    await sendConfirmationEmail({
      email: session.customer_email || session.metadata?.user_email,
      orderNumber: order.id.slice(-8).toUpperCase(),
      totalAmount,
      items: orderItems
    })

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        total_amount: totalAmount,
        status: order.status,
        order_items: orderItems
      }
    })

  } catch (error) {
    console.error('Process payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function sendConfirmationEmail({ email, orderNumber, totalAmount, items }) {
  // Simple email confirmation - you can integrate with a service like Resend, SendGrid, etc.
  console.log(`Sending confirmation email to ${email}:`)
  console.log(`Order #${orderNumber} - €${totalAmount}`)
  console.log('Items:', items)
  
  // For now, just log. In production, you would use an email service:
  /*
  const emailService = new YourEmailService()
  await emailService.send({
    to: email,
    subject: `Order Confirmation #${orderNumber} - Juweeltjes Lies`,
    html: generateEmailTemplate(orderNumber, totalAmount, items)
  })
  */
}