import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, TextField, Typography, InputAdornment, IconButton, Paper } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import Logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import { AuthContext } from '../context/AuthContext';

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return { user: null, logout: () => {} };
  }
  return context;
};

const LogIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: 'moeed@mailinator.com', password: '123456' });
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndRedirect = async () => {
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          setError('Failed to fetch user role.');
        } else {
          if (profile.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }
      }
    };

    fetchProfileAndRedirect();
  }, [user, navigate]);

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      if (error) {
        setError(error.message);
      } else {
        const userId = data.user.id;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (profileError) {
          setError('Unable to fetch user role');
        } else {
          if (profile.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <Box
      sx={{
        width: '100vw', height: '100vh', overflow: 'hidden',
        background: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Paper elevation={12} sx={{
        p: 4, width: '100%', maxWidth: 500,
        background: '#111', borderRadius: 3, border: '1px solid #FFD700',
        color: '#fff', boxShadow: '0 8px 24px rgba(255, 215, 0, 0.25)'
      }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <img src={Logo} alt="Logo" style={{ width: 70 }} />
          <Typography variant="h5" sx={{ color: '#FFD700', mt: 2, fontWeight: 'bold' }}>
            Welcome Back
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            name="email"
            label="Email"
            fullWidth margin="normal" variant="filled"
            value={formData.email} onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: '#FFD700' }} />
                </InputAdornment>
              ),
              sx: { bgcolor: '#222', color: '#fff' }
            }}
            InputLabelProps={{ sx: { color: '#FFD700' } }}
          />

          <TextField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth margin="normal" variant="filled"
            value={formData.password} onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#FFD700' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility}>
                    {showPassword
                      ? <Visibility sx={{ color: '#FFD700' }} />
                      : <VisibilityOff sx={{ color: '#FFD700' }} />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { bgcolor: '#222', color: '#fff' }
            }}
            InputLabelProps={{ sx: { color: '#FFD700' } }}
          />

          {error && <Typography sx={{ color: 'red', textAlign: 'center' }}>{error}</Typography>}

          <Button
            type="submit" fullWidth variant="contained"
            sx={{
              mt: 3, bgcolor: '#FFD700', color: '#000', fontWeight: 'bold',
              '&:hover': { bgcolor: '#e6c200' }
            }}
          >
            Login
          </Button>
        </form>

        <Typography sx={{ mt: 2, color: '#ccc', textAlign: 'center' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#FFD700', textDecoration: 'none' }}>Sign Up</Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default LogIn;
