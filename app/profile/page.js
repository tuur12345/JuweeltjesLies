'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { profiles, orders } from '../../lib/supabaseClient';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    postal_code: '',
    country: '',
    phone: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadProfileData();
  }, [user, router]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      // Load profile
      const { data: profileData } = await profiles.get(user.id);
      setProfile(profileData);
      
      if (profileData) {
        setFormData({
          full_name: profileData.full_name || '',
          email: profileData.email || user.email || '',
          address_line_1: profileData.address_line_1 || '',
          address_line_2: profileData.address_line_2 || '',
          city: profileData.city || '',
          postal_code: profileData.postal_code || '',
          country: profileData.country || '',
          phone: profileData.phone || ''
        });
      } else {
        // Set defaults from user data
        setFormData(prev => ({
          ...prev,
          full_name: user.user_metadata?.full_name || '',
          email: user.email || ''
        }));
      }

      // Load orders
      const { data: ordersData } = await orders.getUserOrders(user.id);
      setUserOrders(ordersData || []);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const profileData = {
        id: user.id,
        ...formData,
        updated_at: new Date().toISOString()
      };

      const { error } = await profiles.upsert(profileData);
      if (error) throw error;

      setProfile(profileData);
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || user.email || '',
        address_line_1: profile.address_line_1 || '',
        address_line_2: profile.address_line_2 || '',
        city: profile.city || '',
        postal_code: profile.postal_code || '',
        country: profile.country || '',
        phone: profile.phone || ''
      });
    }
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-state">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">My Profile</h1>
      
      <div className="profile-content">
        <div className="profile-section">
          <div className="section-header">
            <h2>Personal Information</h2>
            {!editing && (
              <button 
                className="edit-btn"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form className="profile-form" onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="full_name">Full Name</label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address_line_1">Address Line 1</label>
                <input
                  type="text"
                  id="address_line_1"
                  name="address_line_1"
                  value={formData.address_line_1}
                  onChange={handleInputChange}
                  disabled={saving}
                  placeholder="Street address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address_line_2">Address Line 2</label>
                <input
                  type="text"
                  id="address_line_2"
                  name="address_line_2"
                  value={formData.address_line_2}
                  onChange={handleInputChange}
                  disabled={saving}
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="postal_code">Postal Code</label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled={saving}
                  >
                    <option value="">Select country</option>
                    <option value="BE">Belgium</option>
                    <option value="NL">Netherlands</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="LU">Luxembourg</option>
                    <option value="GB">United Kingdom</option>
                    <option value="US">United States</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-row">
                <span className="label">Name:</span>
                <span>{formData.full_name || 'Not provided'}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span>{formData.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Address:</span>
                <span>
                  {formData.address_line_1 ? (
                    <>
                      {formData.address_line_1}
                      {formData.address_line_2 && <>, {formData.address_line_2}</>}
                      <br />
                      {formData.city} {formData.postal_code}
                      {formData.country && <>, {formData.country}</>}
                    </>
                  ) : (
                    'Not provided'
                  )}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Phone:</span>
                <span>{formData.phone || 'Not provided'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2>Order History</h2>
          {userOrders.length > 0 ? (
            <div className="orders-list">
              {userOrders.map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-header">
                    <span className="order-id">Order #{order.id.slice(-8)}</span>
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="order-details">
                    <span className="order-total">€{order.total_amount}</span>
                    <span className="order-status">{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-orders">
              <p>No orders yet. Start shopping!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}