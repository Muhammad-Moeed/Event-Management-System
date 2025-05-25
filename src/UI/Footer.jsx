import React from 'react';
import logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '10px 20px', 
      backgroundColor: '#f5f5f5',
      borderTop: '1px solid #ddd' 
    }}>
      <img src={logo} alt="Logo" style={{ height: 40, marginRight: 15 }} />
      <p style={{ margin: 0, color: '#555', fontSize: 14 }}>
        © 2025 Asan Qarza. All rights reserved.
      </p>
    </footer>
  );
}
