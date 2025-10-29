import Link from 'next/link';

export default function AboutPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>About Page (App Router)</h1>
      <p>This is the about page using App Router. It can be included or excluded based on your filter configuration.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <Link href="/">← Back to Home</Link>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e8f4f8' }}>
        <h3>App Router Information</h3>
        <p>File: app/about/page.tsx</p>
        <p>This demonstrates how App Router structures routes with folders and page.tsx files.</p>
        <p>
          <strong>App Router Benefits:</strong>
        </p>
        <ul>
          <li>Server Components by default</li>
          <li>Improved performance with streaming</li>
          <li>Better developer experience</li>
          <li>More intuitive file-based routing</li>
        </ul>
      </div>
    </div>
  );
}