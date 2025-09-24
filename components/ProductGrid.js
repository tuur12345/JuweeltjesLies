'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import FavoriteButton from './FavoriteButton';
import AuthModal from './AuthModal';

export default function ProductGrid({ products }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  return (
    <>
      <div className="product-grid">
        {products.map(product => (
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
                onAuthRequired={() => setIsAuthModalOpen(true)}
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
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}