import React, { useState } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistered, setRegistered] = useState(false);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5025/";

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     if (password !== confirmPassword) {
  //       setError('A jelszavak nem egyeznek meg');
  //       return;
  //     }

  //     const response = await axios.post(`${API_URL}api/Forecast/Register`, {
  //       username: username,
  //       password: password
  //     });

  //     if (response.data && response.data.success) {
  //       setRegistered(true); 
  //     } else {
  //       setError(response.data ? response.data.message : 'Hiba történt a regisztráció során!'); 
  //     }
  //   } catch (error) {
  //     setError('Hiba történt a regisztráció során!');
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}api/Forecast/Registration`, {
        "username" : username,
        "password" : password
      });

      console.log(response);
      if (response.data.success) {
        setRegistered(true);
      } else {
        setError(response.data.message); 
      }
    } catch (error) {
      setError('Hiba történt a bejelentkezés során!');
    }
  };

  if (isRegistered) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h2>Regisztráció</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Felhasználónév:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label>Jelszó:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label>Jelszó újra:</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        {error && <div>{error}</div>}
        <button type="submit">Regisztráció</button>
      </form>
      <button onClick={() => navigate('/login')}>
        Bejelentkezés
      </button>
    </div>
  );
};

export default Register;
