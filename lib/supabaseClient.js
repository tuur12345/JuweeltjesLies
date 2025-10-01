import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tzjwyitpvhndpntphvon.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6and5aXRwdmhuZHBudHBodm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjYyMjIsImV4cCI6MjA3NDMwMjIyMn0.Ds6PsXVUQnX2rRWTdYx9Bt_6yy0y_uiguC_dWxCSvXk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl,process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6and5aXRwdmhuZHBudHBodm9uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcyNjIyMiwiZXhwIjoyMDc0MzAyMjIyfQ.SADa6ASXAywLVq3h4eSpa6suAm_Np8Ie3pDCXA5Ys9k')

// Auth helpers
export const auth = {
  signUp: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },


  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
}

// Profile helpers
export const profiles = {
  get: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  upsert: async (profileData) => {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select()
      .single()
    return { data, error }
  }
}

// Favorites helpers
export const favorites = {
  getUserFavorites: async (userId) => {
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', userId);
    return { data: data?.map(f => f.product_id) || [], error };
  },

  addFavorite: async (userId, productId) => {
    const { error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, product_id: productId }]);
    return { error };
  },

  removeFavorite: async (userId, productId) => {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    return { error };
  },

  isFavorite: async (userId, productId) => {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();
    return { isFavorite: !!data, error };
  }
}

// Orders helpers
export const orders = {
  create: async (orderData) => {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()
    return { data, error }
  },

  getUserOrders: async (userId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  }
}