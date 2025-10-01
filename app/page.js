export const revalidate = 10; // re-fetch every 10 seconds

import ProductGrid from '../components/ProductGrid';
import { supabase } from '../lib/supabaseClient';

export default async function HomePage() {
  const { data, error } = await supabase.from('products').select('*');
  //console.log('Products fetched:', data, error);

  if (error) return <p>Error loading products</p>;

  return (
    <div className="container">
      <ProductGrid products={data} />
    </div>
  );
}
