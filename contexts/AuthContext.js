// /contexts/AuthContext.js
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get current user + profile info
  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // fetch extra profile info including is_admin
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) {
        console.warn('Error fetching profile for user:', error);
      }

      return { ...user, is_admin: profile?.is_admin || false };
    } catch (err) {
      console.error('getCurrentUser error:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      const currentUser = await getCurrentUser();
      if (mounted) {
        setUser(currentUser);
        setLoading(false);
      }
    };

    init();

    // subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // optional: you can log to debug
        console.debug('Auth event:', event);

        // Handle explicit events to avoid races
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          const cu = await getCurrentUser();
          setUser(cu);
          setLoading(false);
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setUser(null);
          setLoading(false);
        } else {
          // fallback: try to refresh current user
          const cu = await getCurrentUser();
          setUser(cu);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Auth functions: update user immediately after successful action
  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });

      if (!error) {
        // refresh current user so UI updates immediately
        const cu = await getCurrentUser();
        setUser(cu);
      }

      return { data, error };
    } catch (err) {
      console.error('signUp error:', err);
      return { data: null, error: err };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // If login succeeded, immediately refresh user state to avoid waiting for onAuthStateChange
      if (!error) {
        const cu = await getCurrentUser();
        setUser(cu);
        setLoading(false);
      }

      return { data, error };
    } catch (err) {
      console.error('signIn error:', err);
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      // optimistically clear user so UI reacts immediately
      setUser(null);
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      console.error('signOut error:', err);
      return { error: err };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
