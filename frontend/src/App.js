import React, { useState } from 'react';
import Login from './Login';
import Attendance from './AttendanceTable';
import Dashboard from './Dashboard';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [teacherId, setTeacherId] = useState(null);

  const handleLogin = (email, password) => {
    // Simulate authentication process and retrieve teacherId
    if (email === 'teacher@gmail.com' && password === '123') {
      setIsLoggedIn(true);
      setTeacherId(1); // Assuming teacherId = 1 for now
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div>
      {!isLoggedIn ? <Login onLogin={handleLogin} /> : <Dashboard teacherId={teacherId} />}
    </div>
  );
};

export default App;
