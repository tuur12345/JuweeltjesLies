'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import ShippingForm from './ShippingForm';
import AuthModal from './AuthModal';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      setCart([]);
    }
  };

  const saveCart = (newCart) => {
    try {
      localStorage.setItem('cart', JSON.stringify(newCart));
      // Dispatch custom event for cart updates
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (e) {
      console.error('Failed to save cart');
    }
  };

  const updateQuantity = (productId, change) => {
    const newCart = cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity <= 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean);

    setCart(newCart);
    saveCart(newCart);
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    saveCart(newCart);
  };

  const checkout = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowShippingForm(true);
  };

  const handleShippingSubmit = (shippingData) => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`Order placed! Shipping to: ${shippingData.full_name}, ${shippingData.address_line_1}. Total: €${total.toFixed(2)}`);
    
    // Clear cart after successful order
    setCart([]);
    saveCart([]);
    setShowShippingForm(false);
  };

  const handleShippingCancel = () => {
    setShowShippingForm(false);
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (showShippingForm) {
    return (
      <div className="container">
        <ShippingForm 
          onSubmit={handleShippingSubmit}
          onCancel={handleShippingCancel}
        />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container">
        <h2 className="cart-title">Shopping Cart</h2>
        <div className="empty-cart">
          <h3>Your cart is empty</h3>
          <p>Start shopping to add items to your cart!</p>
          <br />
          <button 
            className="add-to-cart" 
            onClick={() => router.push('/')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container">
        <h2 className="cart-title">Shopping Cart</h2>
        
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                <Image
                  src={"/images/1.jpg"}
                  alt={item.name}
                  width={100}
                  height={100}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    borderRadius: '8px' 
                  }}
                />
              </div>
              <div className="cart-item-info">
                <h3 className="cart-item-name">{item.name}</h3>
                <p className="cart-item-price">€{item.price.toFixed(2)}</p>
                <div className="quantity-control">
                  <button 
                    className="quantity-btn" 
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    className="quantity-btn" 
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    +
                  </button>
                  <button 
                    className="remove-item" 
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="cart-total">
          <div className="total-label">Total</div>
          <div className="total-amount">€{total.toFixed(2)}</div>
          <button className="checkout-btn" onClick={checkout}>
            Proceed to Checkout
          </button>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}