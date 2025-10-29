import Link from 'next/link';

export default function AdminPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Admin Page (App Router)</h1>
      <p style={{ color: '#d73027', fontWeight: 'bold' }}>
        ⚠️ This is an admin page - it might be filtered out during builds!
      </p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#ffeaa7' }}>
        <h3>Admin Dashboard</h3>
        <ul>
          <li>User Management</li>
          <li>Content Management</li>
          <li>System Settings</li>
          <li>Analytics</li>
          <li>Route Configuration</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <Link href="/">← Back to Home</Link>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#ffeaa7' }}>
        <h4>App Router Filter Configuration Note</h4>
        <p>
          This page is typically excluded in production builds to reduce bundle size.
          With App Router, the entire /admin route group can be filtered out.
        </p>
        <p>File structure: app/admin/page.tsx</p>
      </div>
    </div>
  );
}