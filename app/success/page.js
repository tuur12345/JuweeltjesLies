'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function SuccessPage() {
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('Invalid payment session');
      setLoading(false);
      return;
    }

    if (!authLoading) {
      if (!user) {
        setError('You must be logged in to view this page');
        setLoading(false);
        return;
      }
    processSuccessfulPayment(sessionId);
  }
  }, [searchParams, user, router]);

  const processSuccessfulPayment = async (sessionId) => {
    try {
      // Call API to process the successful payment
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();
      console.log('Process payment response:', response.status, data)
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process payment');
      }

      setOrderDetails(data.order);

      // Clear the cart from localStorage
      localStorage.removeItem('cart');
      
      // Dispatch event to update cart count
      window.dispatchEvent(new Event('cartUpdated'));

    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="success-loading">
          <h1>Processing your order...</h1>
          <p>Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="success-error">
          <h1>Payment Error</h1>
          <p>{error}</p>
          <Link href="/cart" className="add-to-cart">
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="success-content">
        <div className="success-header">
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase. Your payment has been processed successfully.</p>
        </div>

        {orderDetails && (
          <div className="order-summary">
            <h2>Order Details</h2>
            <div className="order-info">
              <div className="info-row">
                <span>Order Number:</span>
                <span>#{orderDetails.id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="info-row">
                <span>Total Amount:</span>
                <span>€{orderDetails.total_amount}</span>
              </div>
              <div className="info-row">
                <span>Status:</span>
                <span className="status-badge">{orderDetails.status}</span>
              </div>
            </div>

            <div className="order-items">
              <h3>Items Ordered</h3>
              {orderDetails.order_items.map((item, index) => (
                <div key={index} className="order-item">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">Qty: {item.quantity}</span>
                  <span className="item-price">€{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="success-actions">
          <p className="confirmation-note">
            A confirmation email has been sent to your email address with all the order details.
          </p>
          
          <div className="action-buttons">
            <Link href="/profile" className="add-to-cart">
              View Order History
            </Link>
            <Link href="/" className="continue-shopping">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}