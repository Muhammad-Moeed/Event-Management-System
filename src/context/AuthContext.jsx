import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

 useEffect(() => {
  const getSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) console.error(error.message);
    setUser(session?.user ?? null);
    setLoading(false);
  };

  getSession();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/login');
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);


  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, setLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


