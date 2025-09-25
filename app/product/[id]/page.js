'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import products from '../../../data/products.json';
import FavoriteButton from '../../../components/FavoriteButton';
import AuthModal from '../../../components/AuthModal';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [buttonText, setButtonText] = useState('Add to Cart');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const productId = parseInt(params.id);
    const foundProduct = products.find(p => p.id === productId);
    
    if (!foundProduct) {
      router.push('/');
      return;
    }
    
    setProduct(foundProduct);
  }, [params.id, router]);

  const addToCart = () => {
    if (!product) return;

    try {
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = existingCart.find(item => item.id === product.id);
      
      let newCart;
      if (existingItem) {
        newCart = existingCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...existingCart, { ...product, quantity: 1 }];
      }

      localStorage.setItem('cart', JSON.stringify(newCart));
      
      // Dispatch custom event for cart updates
      window.dispatchEvent(new Event('cartUpdated'));

      // Show feedback
      setButtonText('Added!');
      setTimeout(() => {
        setButtonText('Add to Cart');
      }, 1500);
    } catch (e) {
      console.error('Failed to add to cart');
    }
  };

  if (!product) {
    return <div className="container">Loading...</div>;
  }

  return (
    <>
      <div className="container">
        <Link href="/" className="back-button">
          ← Back to products
        </Link>
        
        <div className="detail-content">
          <div className="detail-image">
            <Image
              src={product.image}
              alt={product.name}
              width={600}
              height={600}
              style={{ objectFit: 'cover' }}
            />
            <FavoriteButton 
              productId={product.id}
              onAuthRequired={() => setIsAuthModalOpen(true)}
            />
          </div>
          
          <div className="detail-info">
            <h1 className="detail-title">{product.name}</h1>
            <p className="detail-price">€{product.price.toFixed(2)}</p>
            <p className="detail-description">{product.description}</p>
            <button className="add-to-cart" onClick={addToCart}>
              {buttonText}
            </button>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}