// Empty module to replace filtered pages
// This module provides a default export that's compatible with both Pages Router and App Router

function EmptyPage() {
  return null;
}

// For React components (Pages Router)
module.exports = EmptyPage;
module.exports.default = EmptyPage;

// For App Router (ES6 export)
if (typeof exports !== 'undefined') {
  exports.default = EmptyPage;
}

// Generate metadata for App Router if needed
module.exports.generateMetadata = () => ({
  title: 'Page Not Available',
  description: 'This page has been filtered out during build'
});

// Generate static params for dynamic routes if needed
module.exports.generateStaticParams = () => [];

// Export all common App Router functions as empty
module.exports.generateViewport = () => ({});
module.exports.generateStaticParams = () => [];
module.exports.revalidate = false;