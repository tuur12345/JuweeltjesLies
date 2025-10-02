'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

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
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2>Orders</h2>
            <button className="show-btn" onClick={() => setShowOrders(!showOrders)}>
              {showOrders ? 'Hide Orders' : 'Show Orders'}
            </button>
          </div>
          {showOrders && (
            <>
              {orders.length === 0 ? <p>No orders yet</p> : (
                <ul>
                  {orders.map(order => (
                    <li key={order.id}>
                      <strong>ID:</strong> {order.id} <br />
                      <strong>User:</strong> {order.user_id} <br /> 
                      <strong>Status:</strong> {order.status} <br />
                      <strong>Total:</strong> €{order.total_amount} <br /> 
                      <strong>Date:</strong> {new Date(order.created_at).toLocaleString()} <br />

                      {order.shipping_address && (() => {
                        let addr;
                        try {
                          addr = typeof order.shipping_address === 'string' 
                            ? JSON.parse(order.shipping_address) 
                            : order.shipping_address;
                        } catch {
                          addr = order.shipping_address;
                        }

                        return (
                          <div>
                            <strong>Shipping:</strong> {addr.name}, {addr.phone || '-'}, {addr.address.line1}, {addr.address.line2 || ''} {addr.address.city}, {addr.address.state || ''}, {addr.address.postal_code}, {addr.address.country} <br />
                            <strong>Carrier:</strong> {addr.carrier || '-'} | <strong>Tracking:</strong> {addr.tracking_number || '-'}
                          </div>
                        );
                      })()}

                      {order.order_items && (() => {
                        let items;
                        try {
                          items = typeof order.order_items === 'string' 
                            ? JSON.parse(order.order_items) 
                            : order.order_items;
                        } catch {
                          items = order.order_items;
                        }

                        return (
                          <div>
                            <strong>Items:</strong>
                            <ul>
                              {items.map((item, idx) => (
                                <li key={idx}>
                                  {item.name}: {item.quantity} x €{item.price} = {order.total_amount}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <div className="admin-panel">
          <div className='admin-panel-header'>
            <h2>Feedback</h2>
            <button onClick={() => setShowFeedback(!showFeedback)}>
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
