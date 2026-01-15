/**
 * Empty module to replace filtered pages
 *
 * This module provides a custom 404 response with a detectable marker
 * that can be verified in tests and provides clear feedback to users.
 *
 * Marker: NEXT_BUILD_FILTER_EXCLUDED_PAGE
 */

// Marker string to identify filtered pages
const FILTER_MARKER = 'NEXT_BUILD_FILTER_EXCLUDED_PAGE';

// Try to import notFound for App Router (will fail gracefully for Pages Router)
let notFoundFn = null;
try {
  notFoundFn = require('next/navigation').notFound;
} catch (e) {
  // Not in App Router context or Next.js not available
}

// Import React at module level for better compatibility
let React = null;
try {
  React = require('react');
} catch (e) {
  // React not available
}

/**
 * Filtered page component
 * Works with both Pages Router and App Router
 */
function FilteredPage() {
  // If we're in App Router and notFound is available, use it
  if (notFoundFn && typeof notFoundFn === 'function') {
    notFoundFn();
    return null; // notFound() throws, so this won't be reached
  }

  // For Pages Router or fallback: Return a custom 404 component
  if (!React) {
    return null;
  }

  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f5f5f5',
      },
      'data-filter-marker': FILTER_MARKER,
    },
    [
      React.createElement(
        'h1',
        { key: 'title', style: { fontSize: '3rem', margin: '0' } },
        '404'
      ),
      React.createElement(
        'p',
        {
          key: 'message',
          style: { fontSize: '1.2rem', color: '#666', marginTop: '1rem' },
        },
        'Page Not Available'
      ),
      React.createElement(
        'p',
        {
          key: 'detail',
          style: { fontSize: '0.9rem', color: '#999', marginTop: '0.5rem' },
        },
        'This page has been filtered out during build.'
      ),
      React.createElement(
        'div',
        { key: 'marker', style: { display: 'none' } },
        FILTER_MARKER
      ),
    ]
  );
}

// Set status code for Pages Router
FilteredPage.getInitialProps = ({ res }) => {
  if (res) {
    res.statusCode = 404;
  }
  return {};
};

// For React components (Pages Router)
module.exports = FilteredPage;
module.exports.default = FilteredPage;

// Export the marker for testing
module.exports.FILTER_MARKER = FILTER_MARKER;

// Generate metadata for App Router (async for Next.js best practices)
module.exports.generateMetadata = async () => ({
  title: 'Page Not Available - 404',
  description: 'This page has been filtered out during build',
});

// Generate static params for dynamic routes if needed
module.exports.generateStaticParams = async () => [];

// Export all common App Router functions
module.exports.generateViewport = async () => ({});
module.exports.revalidate = false;
module.exports.dynamic = 'force-static';
