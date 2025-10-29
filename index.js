const NextBuildFilterPlugin = require('./lib/next-build-filter-plugin');
const withPageFilter = require('./lib/with-page-filter');

module.exports = withPageFilter;
module.exports.NextBuildFilterPlugin = NextBuildFilterPlugin;
module.exports.withPageFilter = withPageFilter;