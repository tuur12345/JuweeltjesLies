'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProductGrid({ products }) {
  const router = useRouter();

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  return (
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
          </div>
          <div className="product-info">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-price">€{product.price.toFixed(2)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}