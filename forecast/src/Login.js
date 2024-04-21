import React, { useState } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';

const Login = ({ setLoggedInUser,  setLoggedInUserId}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5025/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}api/Forecast/Login`, {
        "username" : username,
        "password" : password
      });
      if (response.data.success) {
        setLoggedIn(true);
        setLoggedInUser(username);
        setLoggedInUserId(response.data.userId);
        console.log(response.data.userId);
      } else {
        setError(response.data.message); 
      }
    } catch (error) {
      setError('Hiba történt a bejelentkezés során!');
    }
  };

  if (isLoggedIn) {
    return <Navigate to="/forecast" state={{ username: username }} />; 
  }

  return (
    <div>
      <h2>Bejelentkezés</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Felhasználónév:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label>Jelszó:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div>{error}</div>}
        <button type="submit">Bejelentkezés</button>
      </form>
      <button onClick={() => navigate('/register')}>
        Regisztráció
      </button>
    </div>
  );
};

export default Login;
