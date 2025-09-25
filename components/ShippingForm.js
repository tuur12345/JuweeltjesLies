'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profiles } from '../lib/supabaseClient';


export default function ShippingForm({ onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  
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
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await profiles.get(user.id);
      if (profile) {
        setFormData({
          full_name: profile.full_name || user.user_metadata?.full_name || '',
          email: profile.email || user.email || '',
          address_line_1: profile.address_line_1 || '',
          address_line_2: profile.address_line_2 || '',
          city: profile.city || '',
          postal_code: profile.postal_code || '',
          country: profile.country || '',
          phone: profile.phone || ''
        });
      } else {
        // Set defaults from user data
        setFormData(prev => ({
          ...prev,
          full_name: user.user_metadata?.full_name || '',
          email: user.email || ''
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Save shipping info to user profile
      const profileData = {
        id: user.id,
        ...formData,
        updated_at: new Date().toISOString()
      };

      const { error: profileError } = await profiles.upsert(profileData);
      if (profileError) {
        throw profileError;
      }

      // Call parent's onSubmit with form data
      onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Failed to save shipping information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shipping-form-container">
      <h3>Shipping Information</h3>
      
      <form className="shipping-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="full_name">Full Name *</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="address_line_1">Address Line 1 *</label>
          <input
            type="text"
            id="address_line_1"
            name="address_line_1"
            value={formData.address_line_1}
            onChange={handleInputChange}
            required
            disabled={loading}
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
            disabled={loading}
            placeholder="Apartment, suite, etc. (optional)"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="postal_code">Postal Code *</label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="country">Country *</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
              disabled={loading}
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
              disabled={loading}
              placeholder="Optional"
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>
      </form>
    </div>
  );
}