import React from 'react';
import Link from 'next/link';

export default function BlogPage() {
  const posts = [
    { id: 1, title: 'First Blog Post', date: '2024-01-01' },
    { id: 2, title: 'Second Blog Post', date: '2024-01-15' },
    { id: 3, title: 'Third Blog Post', date: '2024-02-01' }
  ];

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Blog Page</h1>
      <p>This is the blog page with a list of posts.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Recent Posts</h2>
        {posts.map(post => (
          <div key={post.id} style={{ 
            marginBottom: '1rem', 
            padding: '1rem', 
            border: '1px solid #ddd', 
            borderRadius: '4px' 
          }}>
            <h3>{post.title}</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Published: {post.date}</p>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <Link href="/">← Back to Home</Link>
      </div>
    </div>
  );
}