import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import supabase from '../services/supabaseClient';

const PrivateRoute = ({ children, allowedRoles = ['user', 'admin'] }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      setSession(session);

      const user = session.user;
      console.log('User:', user);
      console.log('Session:', session);

      if (!user.email_confirmed_at) {
        setEmailVerified(false);
        setLoading(false);
        return;
      }

      setEmailVerified(true);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, role')
        .eq('id', user.id)
        .single();

      if (!profileError) {
        if (profile?.first_name && profile?.last_name) {
          setProfileComplete(true);
        }
        setUserRole(profile?.role || 'user');
      }

      setLoading(false);
    };

    checkSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkSessionAndProfile();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div style={{ color: 'white' }}>Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (!emailVerified) return <Navigate to="/verify-email" replace />;
  if (!profileComplete) return <Navigate to="/complete-profile" replace />;
  if (!allowedRoles.includes(userRole)) return <Navigate to="/not-authorized" replace />;

  return children;
};

export default PrivateRoute;
