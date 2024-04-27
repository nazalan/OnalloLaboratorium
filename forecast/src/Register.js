import React, { useState } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import { keyframes } from '@emotion/react';

const primaryColor = '#ff4500'; // Narancssárga szín
const secondaryColor = '#00bfff'; // Világoskék szín
const bgColor = '#f0f0f0'; // Háttérszín

// Gombokhoz animáció
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 ${primaryColor};
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
`;

// Input mezőkhöz animáció
const glowAnimation = keyframes`
  0% {
    box-shadow: 0 0 0px ${secondaryColor};
  }
  50% {
    box-shadow: 0 0 15px ${secondaryColor};
  }
  100% {
    box-shadow: 0 0 0px ${secondaryColor};
  }
`;

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistered, setRegistered] = useState(false);
  const [usernameHovered, setUsernameHovered] = useState(false);
  const [passwordHovered, setPasswordHovered] = useState(false);
  const [confirmPasswordHovered, setConfirmPasswordHovered] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5025/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}api/Forecast/Registration`, {
        "username": username,
        "password": password
      });

      console.log(response);
      if (response.data.success) {
        setRegistered(true);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('Hiba történt a regisztráció során!');
    }
  };

  if (isRegistered) {
    return <Navigate to="/login" />;
  }

  return (
    <Container maxWidth="sm" style={{ backgroundColor: bgColor }}>
      <Box sx={{ mt: 8, mb: 2 }}>
        <Typography variant="h2" style={{ color: primaryColor }}>Regisztráció</Typography>
      </Box>
      <Box component="form" onSubmit={handleSubmit}>
        <Box
          sx={{ mb: 2 }}
          onMouseEnter={() => setUsernameHovered(true)}
          onMouseLeave={() => setUsernameHovered(false)}
        >
          <TextField
            label="Felhasználónév"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              animation: usernameHovered && `${glowAnimation} 1s infinite alternate`,
              backgroundColor: '#fff',
            }}
          />
        </Box>
        <Box
          sx={{ mb: 2 }}
          onMouseEnter={() => setPasswordHovered(true)}
          onMouseLeave={() => setPasswordHovered(false)}
        >
          <TextField
            label="Jelszó"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              animation: passwordHovered && `${glowAnimation} 1s infinite alternate`,
              backgroundColor: '#fff',
            }}
          />
        </Box>
        <Box
          sx={{ mb: 2 }}
          onMouseEnter={() => setConfirmPasswordHovered(true)}
          onMouseLeave={() => setConfirmPasswordHovered(false)}
        >
          <TextField
            label="Jelszó újra"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{
              animation: confirmPasswordHovered && `${glowAnimation} 1s infinite alternate`,
              backgroundColor: '#fff',
            }}
          />
        </Box>
        {error && (
          <Typography variant="body2" color="error" mb={2}>
            {error}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: secondaryColor,
            color: '#fff',
            animation: buttonHovered && `${pulseAnimation} 1s infinite`,
          }}
          onMouseEnter={() => setButtonHovered(true)}
          onMouseLeave={() => setButtonHovered(false)}
        >
          Regisztráció
        </Button>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Button
          variant="text"
          fullWidth
          style={{ color: primaryColor }}
          onClick={() => navigate('/login')}
        >
          Bejelentkezés
        </Button>
      </Box>
    </Container>
  );
};

export default Register;
