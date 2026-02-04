import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import VerifyPage from './Verify';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Simple routing
const path = window.location.pathname;

root.render(
  <React.StrictMode>
    {path === '/verify' ? <VerifyPage /> : <App />}
  </React.StrictMode>
);