import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { googleLogout } from '@react-oauth/google';
import './App.css';
import Review from './Components/Review';
import Navbar from './Components/Navbar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [responses, setResponses] = useState({});
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const fetchReviews = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/reviews');
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    fetchReviews();
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        fetchReviews();
      }
    };
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    const token = Cookies.get('google_token');
    if (token) {
      const decoded = jwtDecode(token);
      setIsLoggedIn(true);
      setUser(decoded);
      fetchReviews(); 
    } else {
      setIsLoggedIn(false);
      setUser(null);
      setReviews([]); 
    }
  }, [isOnline]);

  const onLoginSuccess = (response) => {
    const token = response.credential;
    const decoded = jwtDecode(token);
    setIsLoggedIn(true);
    setUser(decoded);
    Cookies.set('google_token', token, { expires: 7 });
    fetchReviews(); 
  };

  const onLoginFailure = (response) => {
    console.error('Login Failed:', response);
  };

  const handleLogout = () => {
    googleLogout();
    Cookies.remove('google_token');
    setIsLoggedIn(false);
    setUser(null);
    setReviews([]); 
    fetchReviews();
  };

  const handleRespond = async (reviewId) => {
    const responseText = responses[reviewId];
    if (!responseText) {
      window.alert("Please write a response before submitting.");
      return;
    }

    const token = Cookies.get('google_token');

    try {
      await axios.post(
        `http://127.0.0.1:5000/reviews/${reviewId}/respond`,
        { response: responseText },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      fetchReviews(); 
      setResponses((prev) => ({ ...prev, [reviewId]: '' }));
    } catch (error) {
      console.error('Error responding to review:', error);
    }
  };

  const handleChange = (reviewId, event) => {
    setResponses((prev) => ({ ...prev, [reviewId]: event.target.value }));
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>★</span>
      );
    }
    return stars;
  };

  return (
    <div className="App">
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        screenWidth={screenWidth}
        onLoginSuccess={onLoginSuccess}
        onLoginFailure={onLoginFailure}
        handleLogout={handleLogout}
      />

      {isOnline ? (
          <Review
            reviews={reviews}
            responses={responses}
            isLoggedIn={isLoggedIn}
            handleChange={handleChange}
            handleRespond={handleRespond}
            renderStars={renderStars}
          />
      ) : (
        <div className="offline-message">
          <h2>Internet not available. Please check your connection.</h2>
        </div>
      )}
    </div>
  );
}

export default App;
