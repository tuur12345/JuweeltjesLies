'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();
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

  const handleAccountClick = () => {
    if (user) {
      setIsAccountDropdownOpen(!isAccountDropdownOpen);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsAccountDropdownOpen(false);
  };

  const handleProfileClick = () => {
    router.push('/profile');
    setIsAccountDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsAccountDropdownOpen(false);
    };

    if (isAccountDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isAccountDropdownOpen]);

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
          
          <div className="header-actions">
            <button 
              className="favorites-icon" 
              onClick={() => router.push('/favorites')}
              title="My Favorites"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            <div className="account-wrapper">
              <button 
                className="account-icon" 
                onClick={handleAccountClick}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>

              {isAccountDropdownOpen && user && (
                <div className="account-dropdown" onClick={e => e.stopPropagation()}>
                  <div className="dropdown-header">
                    <span>{user.user_metadata?.full_name || user.email}</span>
                  </div>
                  <button onClick={handleProfileClick}>Profile</button>
                  <button onClick={handleSignOut} className="sign-out">Logout</button>
                </div>
              )}
            </div>

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
      >      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}