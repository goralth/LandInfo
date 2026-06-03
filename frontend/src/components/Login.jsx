import React, { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onLogin(username, password);
    if (!success) {
      alert('Invalid credentials');
      setPassword('');
    }
  };

  return (
    <div className="login-modal">
      <div className="login-box">
        <h3>🔐 LandInfo GIS Login</h3>
        <form onSubmit={handleSubmit}>
          <input
            className="login-input"
            placeholder="Username (viewer or editor)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn-login" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
