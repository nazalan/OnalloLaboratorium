import React, { useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistered, setRegistered] = useState(false);

  const API_URL = "http://localhost:5025/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}api/Forecast/Register`, {
        "username": username,
        "password": password
      });
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
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div>{error}</div>}
        <button type="submit">Regisztráció</button>
      </form>
    </div>
  );
};

export default Register;
