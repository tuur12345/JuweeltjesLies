'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import OrderRow from '../../components/OrderRow';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const [orders, setOrders] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.is_admin) {
      loadOrders();
      loadFeedback();
    }
  }, [user]);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setOrders(data);
    else console.error(error);
  };

  const loadFeedback = async () => {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setFeedback(data);
    else console.error(error);
  };

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
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
      });

      const fileName = `${Date.now()}-${imageFile.name}`;

      const resImage = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, fileBase64: base64 })
      });

      const { publicUrl, error: uploadError } = await resImage.json();
      if (uploadError) throw new Error(uploadError);

      const resProduct = await fetch('/api/admin/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: parseFloat(price), description, image: publicUrl })
      });

      const productResult = await resProduct.json();
      if (productResult.error) throw new Error(productResult.error);

      setMessage('Product uploaded successfully!');
      setName('');
      setDescription('');
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
    <div className="admin-page">
      <h1>Admin Dashboard</h1>

      <form onSubmit={handleUpload} className="upload-form">
        <input type="text" placeholder="Product name" value={name} onChange={e => setName(e.target.value)} />
        <input type="text" placeholder="Product description" value={description} onChange={e => setDescription(e.target.value)} />
        <input type="number" step="0.01" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
        <button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload Product'}</button>
      </form>

      {message && <p>{message}</p>}

      <div className="admin-sections">
        <div className="admin-panel" onClick={() => setShowOrders(!showOrders)}>
          <div className="admin-panel-header">
            <h2>Orders</h2>
            <button className="show-btn" >
              {showOrders ? 'Hide Orders' : 'Show Orders'}
            </button>
          </div>
          {showOrders && (
            <>
              {orders.length === 0 ? <p>No orders yet</p> : (
                <ul>
                  {orders.map(order => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <div className="admin-panel" onClick={() => setShowFeedback(!showFeedback)}>
          <div className='admin-panel-header'>
            <h2>Feedback</h2>
            <button className="show-btn">
              {showFeedback ? 'Hide Feedback' : 'Show Feedback'}
            </button>
          </div>
         
          {showFeedback && (
            <>
              {feedback.length === 0 ? <p>No feedback yet</p> : (
                <ul>
                  {feedback.map(fb => (
                    <li key={fb.id}>
                      <strong>{new Date(fb.created_at).toLocaleString()}</strong><br />{fb.message}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}