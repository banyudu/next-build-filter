import React from 'react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Contact Page</h1>
      <p>This is the contact page. It can be included or excluded based on your filter configuration.</p>
      
      <form style={{ marginTop: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" style={{ marginLeft: '1rem', padding: '0.5rem' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" style={{ marginLeft: '1rem', padding: '0.5rem' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="message">Message:</label>
          <textarea id="message" name="message" rows="4" style={{ marginLeft: '1rem', padding: '0.5rem', display: 'block', marginTop: '0.5rem' }} />
        </div>
        <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}>
          Send Message
        </button>
      </form>
      
      <div style={{ marginTop: '2rem' }}>
        <Link href="/">← Back to Home</Link>
      </div>
    </div>
  );
}