import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function OrderRow({ order, onStatusChange }) {
  const [status, setStatus] = useState(order.status);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id);

    if (error) {
      console.error(error);
      alert('Failed to update status');
      setStatus(order.status); 
    } else {
        alert('Updated order status!')
    }
  };

  let addr = {};
  try {
    addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;
  } catch {
    addr = order.shipping_address || {};
  }

  let items = [];
  try {
    items = typeof order.order_items === 'string' ? JSON.parse(order.order_items) : order.order_items;
  } catch {
    items = order.order_items || [];
  }

  return (
    <li>
      <strong>ID:</strong> {order.id} <br />
      <strong>User:</strong> {order.user_id} <br />
      <strong>Status:</strong>{' '}
      <select value={status} onChange={handleStatusChange} onClick={(e) => e.stopPropagation()}>
        <option value="confirmed">Confirmed</option>
        <option value="in the making">In the making</option>
        <option value="ready">Ready</option>
        <option value="shipped">Shipped</option>
        <option value="completed">Completed</option>
      </select>
      <br />
      <strong>Total:</strong> €{order.total_amount} <br />
      <strong>Date:</strong> {new Date(order.created_at).toLocaleString()} <br />

      {addr.name && (
        <div>
          <strong>Shipping:</strong> {addr.name}, {addr.phone || '-'}, {addr.address.line1}, {addr.address.line2 || ''} {addr.address.city}, {addr.address.state || ''}, {addr.address.postal_code}, {addr.address.country} <br />
          <strong>Carrier:</strong> {addr.carrier || '-'} | <strong>Tracking:</strong> {addr.tracking_number || '-'}
        </div>
      )}

      {items.length > 0 && (
        <div>
          <strong>Items:</strong>
          <ul>
            {items.map((item, idx) => (
              <li key={idx}>
                {item.name}: {item.quantity} x €{item.price} = €{(item.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
