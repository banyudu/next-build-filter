import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Home Page</h1>
      <p>This is the home page - it should always be included in builds.</p>
      
      <nav style={{ marginTop: '2rem' }}>
        <h2>Navigation:</h2>
        <ul>
          <li><Link href="/about">About Page</Link></li>
          <li><Link href="/contact">Contact Page</Link></li>
          <li><Link href="/blog">Blog Page</Link></li>
          <li><Link href="/admin">Admin Page (might be filtered)</Link></li>
          <li><Link href="/dev/debug">Debug Page (might be filtered)</Link></li>
        </ul>
      </nav>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0' }}>
        <h3>Build Filter Demo</h3>
        <p>
          This project demonstrates how to filter pages during build time without removing files.
          Check the next.config.js to see which pages are included/excluded.
        </p>
      </div>
    </div>
  );
}