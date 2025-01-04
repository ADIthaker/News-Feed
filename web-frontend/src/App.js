import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Feed from './components/Feed';
import Settings from './components/Settings';
import Navbar from './components/Navbar';
import store from './redux/store';
import Selection from './components/Selection';

// PrivateRoute component to protect routes
const PrivateRoute = ({ element }) => {
  const isLoggedIn = localStorage.getItem('jwtToken'); // Check if JWT token exists in localStorage
  return isLoggedIn ? element : <Navigate to="/login" />; // Redirect to login if not logged in
};

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Protected routes */}
          <Route path="/feed" element={<PrivateRoute element={<Feed />} />} />
          <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
          <Route path="/selection" element={<PrivateRoute element={<Selection />} />} />
          
          {/* Allow logout by redirecting to login */}
          <Route path="/logout" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;


