'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { favorites } from '../lib/supabaseClient';

export default function FavoriteButton({ productId, onAuthRequired }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, productId]);

  const checkFavoriteStatus = async () => {
    if (!user) return;
    
    try {
      const { isFavorite: favStatus } = await favorites.isFavorite(user.id, productId);
      setIsFavorite(favStatus);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    if (!user) {
      onAuthRequired();
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await favorites.removeFavorite(user.id, productId);
        setIsFavorite(false);
      } else {
        await favorites.addFavorite(user.id, productId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`favorite-btn ${isFavorite ? 'favorite' : ''} ${loading ? 'loading' : ''}`}
      onClick={handleFavoriteClick}
      disabled={loading}
      title={user ? (isFavorite ? 'Remove from favorites' : 'Add to favorites') : 'Login to save favorites'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  );
}