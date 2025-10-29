import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>About Page</h1>
      <p>This is the about page. It can be included or excluded based on your filter configuration.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <Link href="/">← Back to Home</Link>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e8f4f8' }}>
        <h3>Page Information</h3>
        <p>File: pages/about.js</p>
        <p>This page demonstrates a standard page that might be filtered out during development builds.</p>
      </div>
    </div>
  );
}