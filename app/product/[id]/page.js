'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseClient';
import FavoriteButton from '../../../components/FavoriteButton';
import AuthModal from '../../../components/AuthModal';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [buttonText, setButtonText] = useState('Add to Cart');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error || !data) {
        router.push('/');
        return;
      }

      setProduct(data);
    };

    if (params.id) fetchProduct();
  }, [params.id, router]);

  const [added, setAdded] = useState(false);

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
      window.dispatchEvent(new Event('cartUpdated'));

      setAdded(true);
      setButtonText('Added!');
      setTimeout(() => {
          setButtonText('Add to Cart');
          setAdded(false);
        }, 1500
      );
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
          <svg fill="#000000" width="10px" height="10px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M222.927 580.115l301.354 328.512c24.354 28.708 20.825 71.724-7.883 96.078s-71.724 20.825-96.078-7.883L19.576 559.963a67.846 67.846 0 01-13.784-20.022 68.03 68.03 0 01-5.977-29.488l.001-.063a68.343 68.343 0 017.265-29.134 68.28 68.28 0 011.384-2.6 67.59 67.59 0 0110.102-13.687L429.966 21.113c25.592-27.611 68.721-29.247 96.331-3.656s29.247 68.721 3.656 96.331L224.088 443.784h730.46c37.647 0 68.166 30.519 68.166 68.166s-30.519 68.166-68.166 68.166H222.927z"/>
          </svg> Back to products
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
            <button 
              className={`add-to-cart ${added ? 'added' : ''}`} 
              onClick={addToCart}
            >
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
