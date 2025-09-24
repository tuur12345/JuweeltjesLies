import Header from '../components/Header'
import '../styles/globals.css'

export const metadata = {
  title: 'Juweeltjes Lies - Modern Jewelry Store',
  description: 'Handcrafted jewelry pieces with love and attention to detail',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}