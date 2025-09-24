import Header from '../components/Header'
import { AuthProvider } from '../contexts/AuthContext'
import '../styles/globals.css'

export const metadata = {
  title: 'Juweeltjes Lies - Modern Jewelry Store',
  description: 'Handcrafted jewelry pieces with love and attention to detail',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}