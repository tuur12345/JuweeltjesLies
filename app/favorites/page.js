'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { useAuth } from '../../contexts/AuthContext';
import { favorites } from '../../lib/supabaseClient';
import FavoriteButton from '../../components/FavoriteButton';
import AuthModal from '../../components/AuthModal';
import { supabase } from '../../lib/supabaseClient';


export default function FavoritesPage() {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
  if (user) {
    loadFavorites();
  } else {
    setAuthModalOpen(true);
  }
  }, [user]);


  const loadFavorites = async () => {
  if (!user) return;

  try {
    const { data: favoriteIds } = await favorites.getUserFavorites(user.id);

    let { data: dbProducts, error } = await supabase
      .from('products')
      .select('*')
      .in('id', favoriteIds);

    if (error) throw error;

    setFavoriteProducts(dbProducts || []);
  } catch (error) {
    console.error('Error loading favorites:', error);
  } finally {
    setLoading(false);
  }
};

  const handleAuthRequired = () => {
    setAuthModalOpen(true);
  };

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  return (
    <div className="container">
      <h1 className="page-title">My Favorites</h1>
      <div className="product-grid">
        {favoriteProducts.map(product => (
          <div 
            key={product.id} 
            className="product-card"
            onClick={() => handleProductClick(product.id)}
          >
            <div className="product-image">
              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={400}
                style={{ objectFit: 'cover' }}
              />
              <FavoriteButton
                productId={product.id}
                onAuthRequired={handleAuthRequired}
              />
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">€{product.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
