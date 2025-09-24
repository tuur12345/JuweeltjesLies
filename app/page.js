import ProductGrid from '../components/ProductGrid'
import products from '../data/products.json'

export default function HomePage() {
  return (
    <div className="container">
      <ProductGrid products={products} />
    </div>
  )
}