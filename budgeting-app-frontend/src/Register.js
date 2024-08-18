import React, { useState } from 'react';
import './LoginSign.css';
import { useNavigate } from 'react-router-dom';

function Register() {
  let navigate = useNavigate();
  const redirectToLogin = () => navigate('/login');
  
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });

    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting:', user);

    if (user.password !== user.confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
  
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log('Register successful:', data);
        navigate('/dashboard');  
      } else {
        console.error('Register failed:', data.message);
        alert(data.message); 
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error, please try again later.');
    }
  };

  return (
    <div className="login-sign-container" style={{ backgroundImage: 'url(/images/loginPage.webp)' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={user.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={user.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        {passwordError && <p className="error">{passwordError}</p>}
        <button type="submit">Register</button>
        <button onClick={redirectToLogin}>Go to Login</button>
      </form>
    </div>
  );
}

export default Register;
