import React from 'react';
import Link from 'next/link';

export default function DebugPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Debug Page</h1>
      <p style={{ color: '#d73027', fontWeight: 'bold' }}>
        🔧 This is a development debug page - it should be filtered out in production builds!
      </p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#2d3436', color: '#ffffff' }}>
        <h3>Debug Information</h3>
        <pre style={{ fontSize: '0.9rem' }}>
{`Environment: ${typeof window !== 'undefined' ? 'Client' : 'Server'}
Build Time: ${new Date().toISOString()}
Node Version: ${typeof process !== 'undefined' ? process.version : 'N/A'}
Next.js Version: Check package.json`}
        </pre>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <h3>Debug Tools</h3>
        <button 
          onClick={() => console.log('Debug button clicked')}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#00b894', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            marginRight: '1rem'
          }}
        >
          Log to Console
        </button>
        <button 
          onClick={() => alert('Debug alert')}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#fdcb6e', 
            color: 'black', 
            border: 'none', 
            borderRadius: '4px'
          }}
        >
          Show Alert
        </button>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <Link href="/">← Back to Home</Link>
      </div>
    </div>
  );
}