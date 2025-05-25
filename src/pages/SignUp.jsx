import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Button, TextField, Typography, InputAdornment, IconButton,
  Container, Paper
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import Logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import supabase from '../services/supabaseClient';
import { AuthContext } from '../context/AuthContext';

const DEFAULT_AVATAR =
  'https://rskkjvdnuxymangrbwbz.supabase.co/storage/v1/object/public/avatars/avatar.png';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const { user, loading, setLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) navigate('/dashboard');
  }, [user, loading, navigate]);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const togglePasswordVisibility = () => setShowPassword((p) => !p);

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (formData.password !== formData.confirmPassword) {
    toast.error('Passwords do not match!');
    return;
  }

  setLoading(true);

  const { error, data } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    toast.error(error.message);
    setLoading(false);
    return;
  }
console.log(data)
  toast.success('Signup successful! Please check your email to confirm.');
  navigate('/complete-profile');

  setLoading(false);
};

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <ToastContainer position="top-center" autoClose={3000} />
      <Container maxWidth="sm" disableGutters>
        <Paper
          elevation={10}
          sx={{
            p: 4,
            background: '#111',
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(255,215,0,.3)',
            border: '1px solid #FFD700',
            color: '#fff',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <img src={Logo} alt="Logo" style={{ width: 70 }} />
            <Typography variant="h5" sx={{ color: '#FFD700', mt: 2, fontWeight: 'bold' }}>
              Create Account
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              name="firstName"
              label="First Name"
              fullWidth
              margin="normal"
              variant="filled"
              value={formData.firstName}
              onChange={handleChange}
              InputProps={{ sx: { bgcolor: '#1a1a1a', color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#FFD700' } }}
            />

            <TextField
              name="lastName"
              label="Last Name"
              fullWidth
              margin="normal"
              variant="filled"
              value={formData.lastName}
              onChange={handleChange}
              InputProps={{ sx: { bgcolor: '#1a1a1a', color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#FFD700' } }}
            />

            <TextField
              name="email"
              label="Email"
              fullWidth
              margin="normal"
              variant="filled"
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#FFD700' }} />
                  </InputAdornment>
                ),
                sx: { bgcolor: '#1a1a1a', color: '#fff' },
              }}
              InputLabelProps={{ sx: { color: '#FFD700' } }}
            />

            <TextField
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              variant="filled"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#FFD700' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility}>
                      {showPassword ? (
                        <Visibility sx={{ color: '#FFD700' }} />
                      ) : (
                        <VisibilityOff sx={{ color: '#FFD700' }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { bgcolor: '#1a1a1a', color: '#fff' },
              }}
              InputLabelProps={{ sx: { color: '#FFD700' } }}
            />

            <TextField
              name="confirmPassword"
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              variant="filled"
              value={formData.confirmPassword}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#FFD700' }} />
                  </InputAdornment>
                ),
                sx: { bgcolor: '#1a1a1a', color: '#fff' },
              }}
              InputLabelProps={{ sx: { color: '#FFD700' } }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                bgcolor: '#FFD700',
                color: '#000',
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#e6c200' },
                '&.Mui-disabled': { bgcolor: '#FFD700', color: '#000', opacity: 0.7 },
              }}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </Button>
          </form>

          {emailSent && (
            <Typography sx={{ mt: 2, color: '#13d68a', textAlign: 'center' }}>
              🎉 Signup successful! Please check your email to confirm your account.
            </Typography>
          )}

          <Typography sx={{ mt: 2, color: '#ccc', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#FFD700', textDecoration: 'none' }}>
              Login
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignUp;
