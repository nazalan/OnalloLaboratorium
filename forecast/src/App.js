import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Forecast from './Forecast';

const App = () => {
  return (
    <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forecast" element={<Forecast/>} />
          <Route path="/" element={<Navigate to="/login" />} /> 
        </Routes>
    </Router>
  );
}

export default App;
