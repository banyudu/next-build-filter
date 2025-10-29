import Link from 'next/link';

export default function DebugPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Debug Page (App Router)</h1>
      <p style={{ color: '#d73027', fontWeight: 'bold' }}>
        🔧 This is a development debug page - it should be filtered out in production builds!
      </p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#2d3436', color: '#ffffff' }}>
        <h3>Debug Information</h3>
        <pre style={{ fontSize: '0.9rem' }}>
{`Environment: Client-side App Router
Build Time: ${new Date().toISOString()}
Route: /dev/debug
File: app/dev/debug/page.tsx`}
        </pre>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <h3>App Router Debug Features</h3>
        <ul>
          <li>Server Components debugging</li>
          <li>Client Components analysis</li>
          <li>Route group inspection</li>
          <li>Layout hierarchy visualization</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <Link href="/">← Back to Home</Link>
      </div>
    </div>
  );
}