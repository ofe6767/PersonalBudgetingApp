import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Dashboard from './Dashboard';
import Login from './Login'; 
import Register from './Register'; 
import Budgeting from './Budgeting';
import TransactionEntry from './TransactionEntry';
import Report from './Report';
import './App.css';


function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  let location = useLocation();
  
  const showNavbar = !['/login', '/register'].includes(location.pathname);

  return (
    <div className="App" style={{ backgroundImage: 'url(/images/loginPage.webp)' }}>
        {showNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/budgeting" element={<Budgeting />} />
          <Route path="/transaction-entry" element={<TransactionEntry />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </div>
  );
}




export default AppWrapper;
