import React, { useState } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await axios.post('http://34.66.26.140/register', { username:email, password });
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.log('Signup failed', error);
      alert(error);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: '#fff',
        }}
      >
        <Typography variant="h4" textAlign="center" mb={2}>
          Sign Up
        </Typography>
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          label="Password"
          variant="outlined"
          margin="normal"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          fullWidth
          label="Confirm Password"
          variant="outlined"
          margin="normal"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={!!error}
          helperText={error}
        />
        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{
            backgroundColor: '#1976d2',
            color: '#fff',
            textTransform: 'none',
            mb: 2,
            '&:hover': { backgroundColor: '#1565c0' },
          }}
          onClick={handleSignUp}
        >
          Sign Up
        </Button>
        <Typography textAlign="center" variant="body2">
          Have an account?{' '}
          <Link href="/login" sx={{ fontWeight: 'bold' }}>
            Login
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default SignUp;



