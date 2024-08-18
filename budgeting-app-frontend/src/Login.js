import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSign.css';

function Login() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  let navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prevCredentials => ({
      ...prevCredentials,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting:', credentials);
  
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', 
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log('Login successful:', data);
  
        localStorage.setItem('userId', data.userId);
  
        navigate('/dashboard');
      } else {
        console.error('Login failed:', data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error, please try again later.');
    }
  };
  
  

  const handleRegisterRedirect = () => {
    navigate('/register'); 
  };

  return (
    <div className='login-sign-container' style={{ backgroundImage: 'url(/images/loginPage.webp)' }}>
      <h2>Personal Budgeting</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={credentials.username}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Login</button>
        <button type="button" onClick={handleRegisterRedirect}>Register</button>
      </form>
    </div>
  );
}

export default Login;
