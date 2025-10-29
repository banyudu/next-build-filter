import { ReactNode } from 'react';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header style={{ 
          padding: '1rem', 
          backgroundColor: '#0070f3', 
          color: 'white',
          marginBottom: '2rem'
        }}>
          <h1>Next.js Build Filter Demo - App Router</h1>
          <p>Demonstrating route filtering in Next.js 13+ App Router</p>
        </header>
        <main>
          {children}
        </main>
        <footer style={{ 
          marginTop: '4rem', 
          padding: '2rem', 
          backgroundColor: '#f0f0f0', 
          textAlign: 'center' 
        }}>
          <p>© 2024 Next.js Build Filter Plugin Demo</p>
        </footer>
      </body>
    </html>
  );
}