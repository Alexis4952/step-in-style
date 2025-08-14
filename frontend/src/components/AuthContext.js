import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On mount, check for session
  useEffect(() => {
    let mounted = true;
    async function restoreSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    }
    restoreSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Register
  const register = async (email, password, user_metadata = {}) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: user_metadata }
    });
    
    // If registration successful, add to user_profiles table
    if (data.user && !error) {
      try {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            email: data.user.email,
            full_name: user_metadata.full_name || 'Νέος Χρήστης',
            phone: user_metadata.phone || null
          });
        
        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Don't fail registration if profile creation fails
        }
      } catch (profileError) {
        console.error('Error creating user profile:', profileError);
      }
    }
    
    setLoading(false);
    if (error) setError(error.message);
    return { data, error };
  };

  // Login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    return { data, error };
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    setLoading(false);
    if (error) setError(error.message);
    return { data, error };
  };

  // Update Profile
  const updateProfile = async (updates) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setUser(data.user);
    }
    return { data, error };
  };

  // Update Email
  const updateEmail = async (newEmail) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.updateUser({
      email: newEmail
    });
    setLoading(false);
    if (error) setError(error.message);
    return { data, error };
  };

  // Update Password
  const updatePassword = async (newPassword) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    setLoading(false);
    if (error) setError(error.message);
    return { data, error };
  };

  // Delete Account
  const deleteAccount = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setUser(null);
    }
    return { error };
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    setError(null);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      register, 
      login, 
      signInWithGoogle, 
      updateProfile,
      updateEmail,
      updatePassword,
      deleteAccount,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 