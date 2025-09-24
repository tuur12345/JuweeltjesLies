'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    updateCartCount();
    
    // Listen for cart updates
    const handleStorageChange = () => updateCartCount();
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for cart updates within the same tab
    const handleCartUpdate = () => updateCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (e) {
      setCartCount(0);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleCartClick = () => {
    router.push('/cart');
  };

  return (
    <>
      <header className="header">
        <div className="header-content">
          <button 
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <Link href="/" className="logo">
            Juweeltjes Lies
          </Link>
          
          <button className="cart-icon" onClick={handleCartClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 2L6 9H3L5 2H9Z"/>
              <path d="M15 2L18 9H21L19 2H15Z"/>
              <path d="M3 9H21L20 20H4L3 9Z"/>
            </svg>
            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* Side Menu */}
      <div className={`side-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="menu-header">
          <h3>Menu</h3>
        </div>
        <nav className="menu-nav">
          <Link href="/about" onClick={closeMenu}>About Me</Link>
          <Link href="/contact" onClick={closeMenu}>Contact Me</Link>
        </nav>
      </div>

      {/* Overlay */}
      <div 
        className={`overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={closeMenu}
      ></div>
    </>
  );
}