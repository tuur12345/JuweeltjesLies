'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { favorites } from '../../lib/supabaseClient';
import products from '../../data/products.json';
import FavoriteButton from '../../components/FavoriteButton';

export default function FavoritesPage() {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadFavorites();
  }, [user, router]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      const { data: favoriteIds } = await favorites.getUserFavorites(user.id);
      const favoriteProducts = products.filter(product => 
        favoriteIds.includes(product.id)
      );
      setFavoriteProducts(favoriteProducts);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  const handleFavoriteRemoved = () => {
    // Reload favorites when a product is unfavorited
    loadFavorites();
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-state">Loading your favorites...</div>
      </div>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="container">
        <h1 className="page-title">My Favorites</h1>
        <div className="empty-favorites">
          <h3>No favorites yet</h3>
          <p>Start browsing and save your favorite pieces!</p>
          <br />
          <Link href="/" className="add-to-cart">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

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
                onAuthRequired={() => {}}
                key={`favorite-${product.id}`}
              />
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">€{product.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}