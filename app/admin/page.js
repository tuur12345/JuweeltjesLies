'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) router.push('/');
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;
  if (!user || !user.is_admin) return null;

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!name || !price || !imageFile) {
      setMessage('All fields required');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      // Convert file to Base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
      });

      const fileName = `${Date.now()}-${imageFile.name}`;

      // Upload image
      const resImage = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, fileBase64: base64 })
      });

      const { publicUrl, error: uploadError } = await resImage.json();
      if (uploadError) throw new Error(uploadError);

      // Insert product
      const resProduct = await fetch('/api/admin/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: parseFloat(price), text: name, image: publicUrl })
      });

      const productResult = await resProduct.json();
      if (productResult.error) throw new Error(productResult.error);

      setMessage('Product uploaded successfully!');
      setName('');
      setPrice('');
      setImageFile(null);

    } catch (err) {
      console.error(err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <form onSubmit={handleUpload}>
        <input type="text" placeholder="Product name" value={name} onChange={e => setName(e.target.value)} />
        <input type="number" step="0.01" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
        <button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload Product'}</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
