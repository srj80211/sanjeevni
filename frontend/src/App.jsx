import React, { useState } from 'react';
import FaceAuthentication from './pages/FaceAuthentication';
import Home from './components/Home';
import './App.css';

function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  const handleAuthenticated = (user) => {
    setAuthenticatedUser(user);
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
  };

  return (
    <div className="sanjeevani-app">
      {authenticatedUser ? (
        <Home user={authenticatedUser} onLogout={handleLogout} />
      ) : (
        <FaceAuthentication onAuthenticated={handleAuthenticated} />
      )}
    </div>
  );
}

export default App;
