import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Forecast from './Forecast';
import Chart from './Chart';


const App = () => {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState('');

  return (
    <Router>
        <Routes>
          <Route path="/login" element={<Login setLoggedInUser={setLoggedInUser} setLoggedInUserId={setLoggedInUserId} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forecast" element={<Forecast loggedInUser={loggedInUser} loggedInUserId={loggedInUserId} />} />
          <Route path="/" element={<Navigate to="/login" />} /> 
          <Route path="/chart" element={<Chart />} />
        </Routes>
    </Router>
  );
}

export default App;
